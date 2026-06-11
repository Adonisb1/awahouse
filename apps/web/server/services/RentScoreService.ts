import crypto from 'crypto';
import { TRPCError } from '@trpc/server';
import { prisma, Prisma } from '@awahouse/db';
import { paystackClient } from '@/lib/paystack/client';
import type { RentScoreEventType } from '@awahouse/types';

const SCORE_DELTAS: Record<RentScoreEventType, number> = {
  on_time_payment: 15,
  late_payment: -10,
  missed_payment: -50,
  escrow_completed: 20,
  dispute_raised: -30,
};

const LATE_PAYMENT_7_DAYS_DELTA = -10;
const LATE_PAYMENT_30_DAYS_DELTA = -25;

const MIN_SCORE = 300;
const MAX_SCORE = 850;
const INITIAL_SCORE = 500;

export function clampScore(score: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

export class RentScoreService {
  async recordEvent(
    userId: string,
    eventType: RentScoreEventType,
    escrowId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    let delta = SCORE_DELTAS[eventType];

    if (eventType === 'late_payment' && metadata?.daysLate) {
      const daysLate = metadata.daysLate as number;
      delta = daysLate <= 7 ? LATE_PAYMENT_7_DAYS_DELTA : LATE_PAYMENT_30_DAYS_DELTA;
    }

    const currentScore = user.rentScore;
    const scoreAfter = clampScore(currentScore + delta);

    const [event] = await Promise.all([
      prisma.rentScoreEvent.create({
        data: {
          userId,
          eventType,
          delta,
          scoreAfter,
          escrowId,
          metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { rentScore: scoreAfter },
      }),
    ]);

    return event;
  }

  async getScore(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rentScore: true, id: true },
    });
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return { score: user.rentScore, userId: user.id };
  }

  async getScoreHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      prisma.rentScoreEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rentScoreEvent.count({ where: { userId } }),
    ]);
    return { items, total };
  }

  async scheduleInstalments(escrowId: string, startDate: Date, totalKobo: bigint) {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
    });
    if (!escrow) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow not found' });
    }

    const monthlyKobo = totalKobo / 12n;
    const instalments = [];

    for (let i = 1; i <= 12; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      instalments.push({
        escrowId,
        userId: escrow.tenantId,
        instalmentNumber: i,
        amountKobo: monthlyKobo,
        dueDate,
        status: 'scheduled' as const,
      });
    }

    await prisma.rentInstalment.createMany({ data: instalments });
    return { count: instalments.length };
  }

  async getInstalments(userId: string, escrowId?: string, status?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = { userId };
    if (escrowId) where.escrowId = escrowId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.rentInstalment.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.rentInstalment.count({ where }),
    ]);

    return { items, total };
  }

  async getSchedule(escrowId: string) {
    const items = await prisma.rentInstalment.findMany({
      where: { escrowId },
      orderBy: { instalmentNumber: 'asc' },
    });
    return { items, total: items.length };
  }

  async payInstalment(instalmentId: string, userId: string) {
    const instalment = await prisma.rentInstalment.findUnique({
      where: { id: instalmentId },
      include: { escrow: true },
    });
    if (!instalment || instalment.userId !== userId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Instalment not found' });
    }
    if (instalment.status === 'paid') {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Instalment already paid' });
    }

    const tenant = await prisma.user.findUnique({ where: { id: userId } });
    if (!tenant?.email) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email required for payment' });
    }

    const reference = `AWA-RENT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const charge = await paystackClient.initiateCharge(instalment.amountKobo, tenant.email, reference);

    return {
      success: true,
      authorizationUrl: charge.authorizationUrl,
      reference,
      instalmentId,
    };
  }

  async confirmInstalmentPayment(instalmentId: string, paystackReference: string) {
    const instalment = await prisma.rentInstalment.findUnique({
      where: { id: instalmentId },
    });
    if (!instalment) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Instalment not found' });
    }

    const [updated] = await Promise.all([
      prisma.rentInstalment.update({
        where: { id: instalmentId },
        data: {
          status: 'paid',
          paidAt: new Date(),
          paystackReference,
        },
      }),
      this.recordEvent(instalment.userId, 'on_time_payment', instalment.escrowId),
    ]);

    return updated;
  }

  async markOverdue(instalmentId: string) {
    const instalment = await prisma.rentInstalment.findUnique({
      where: { id: instalmentId },
    });
    if (!instalment || instalment.status !== 'scheduled') return;

    const daysLate = Math.floor(
      (Date.now() - instalment.dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    await Promise.all([
      prisma.rentInstalment.update({
        where: { id: instalmentId },
        data: { status: 'overdue' },
      }),
      this.recordEvent(instalment.userId, 'late_payment', instalment.escrowId, { daysLate }),
    ]);
  }

  async markMissed(instalmentId: string) {
    const instalment = await prisma.rentInstalment.findUnique({
      where: { id: instalmentId },
    });
    if (!instalment || instalment.status === 'paid') return;

    await Promise.all([
      prisma.rentInstalment.update({
        where: { id: instalmentId },
        data: { status: 'missed' },
      }),
      this.recordEvent(instalment.userId, 'missed_payment', instalment.escrowId),
    ]);
  }
}

export const rentScoreService = new RentScoreService();
