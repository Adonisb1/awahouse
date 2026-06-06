import crypto from 'crypto';
import { TRPCError } from '@trpc/server';
import { prisma } from '@awahouse/db';
import { paystackClient } from '@/lib/paystack/client';
import type { EscrowStatus } from '@awahouse/types';

type StateTransition = {
  from: EscrowStatus;
  to: EscrowStatus;
};

const VALID_TRANSITIONS: StateTransition[] = [
  { from: 'pending_payment', to: 'funds_held' },
  { from: 'pending_payment', to: 'cancelled' },
  { from: 'funds_held', to: 'docs_verified' },
  { from: 'funds_held', to: 'refunded' },
  { from: 'docs_verified', to: 'key_handover_pending' },
  { from: 'docs_verified', to: 'disputed' },
  { from: 'key_handover_pending', to: 'completed' },
  { from: 'key_handover_pending', to: 'disputed' },
  { from: 'disputed', to: 'completed' },
  { from: 'disputed', to: 'refunded' },
];

function calculateFees(amountKobo: bigint): { platformFeeKobo: bigint; landlordPayoutKobo: bigint } {
  const fee = BigInt(Math.max(Math.round(Number(amountKobo) * 0.015), 500_000));
  return {
    platformFeeKobo: fee,
    landlordPayoutKobo: amountKobo - fee,
  };
}

export class EscrowService {
  async initiate(
    tenantId: string,
    propertyId: string,
    amountKobo: bigint,
    rentMonthly: boolean,
  ) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.isDeleted) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
    }
    if (!property.isAvailable) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Property is not available' });
    }

    const tenant = await prisma.user.findUnique({ where: { id: tenantId } });
    if (!tenant?.email) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tenant email required for payment' });
    }

    const { platformFeeKobo, landlordPayoutKobo } = calculateFees(amountKobo);
    const reference = `AWA-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const charge = await paystackClient.initiateCharge(amountKobo, tenant.email, reference);

    const escrow = await prisma.escrowTransaction.create({
      data: {
        propertyId,
        tenantId,
        landlordId: property.ownerId,
        status: 'pending_payment',
        amountKobo,
        platformFeeKobo,
        landlordPayoutKobo,
        paystackReference: reference,
        paystackAccessCode: charge.accessCode,
        rentMonthly,
      },
    });

    return {
      escrow,
      authorizationUrl: charge.authorizationUrl,
      accessCode: charge.accessCode,
      reference,
    };
  }

  async handlePaymentSuccess(paystackReference: string) {
    const escrow = await prisma.escrowTransaction.findFirst({
      where: { paystackReference },
    });
    if (!escrow) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow not found' });
    }
    if (escrow.status !== 'pending_payment') {
      return escrow;
    }

    return this._transition(escrow.id, 'funds_held', escrow.tenantId, 'Payment confirmed via Paystack');
  }

  async cancel(escrowId: string, actorId: string) {
    const escrow = await this._getEscrow(escrowId);
    if (escrow.tenantId !== actorId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the tenant can cancel' });
    }
    return this._transition(escrowId, 'cancelled', actorId, 'Cancelled by tenant');
  }

  async markDocsVerified(escrowId: string, adminId: string) {
    return this._transition(escrowId, 'docs_verified', adminId, 'Documents verified by admin');
  }

  async confirmHandover(escrowId: string, tenantId: string) {
    const escrow = await this._getEscrow(escrowId);
    if (escrow.tenantId !== tenantId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the tenant can confirm handover' });
    }
    const result = await this._transition(escrowId, 'completed', tenantId, 'Handover confirmed by tenant');

    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { completedAt: new Date() },
    });

    return result;
  }

  async raiseDispute(escrowId: string, tenantId: string, reason: string) {
    const escrow = await this._getEscrow(escrowId);
    if (escrow.tenantId !== tenantId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the tenant can raise a dispute' });
    }

    const allowedFrom: EscrowStatus[] = ['docs_verified', 'key_handover_pending'];
    if (!allowedFrom.includes(escrow.status as EscrowStatus)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Cannot raise dispute from status ${escrow.status}`,
      });
    }

    const result = await this._transition(escrowId, 'disputed', tenantId, reason);

    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { disputeReason: reason, disputedAt: new Date() },
    });

    return result;
  }

  async adminRelease(escrowId: string, adminId: string) {
    const escrow = await this._getEscrow(escrowId);

    if (escrow.status === 'key_handover_pending') {
      const result = await this._transition(escrowId, 'completed', adminId, 'Admin completed handover');
      await prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: { completedAt: new Date() },
      });
      return result;
    }

    if (escrow.status !== 'disputed') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Can only release from disputed or key_handover_pending status',
      });
    }

    const result = await this._transition(escrowId, 'completed', adminId, 'Admin resolved in landlord\'s favour');
    await prisma.escrowTransaction.update({
      where: { id: escrowId },
      data: { completedAt: new Date() },
    });
    return result;
  }

  async adminRefund(escrowId: string, adminId: string) {
    return this._transition(escrowId, 'refunded', adminId, 'Admin refunded to tenant');
  }

  async getById(escrowId: string, userId: string) {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId },
      include: {
        property: true,
        tenant: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        agent: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!escrow || escrow.isDeleted) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow not found' });
    }
    if (escrow.tenantId !== userId && escrow.landlordId !== userId && escrow.agentId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
    }
    return escrow;
  }

  async list(userId: string, status?: EscrowStatus, page = 1, limit = 20) {
    const where: Record<string, unknown> = {
      isDeleted: false,
      OR: [{ tenantId: userId }, { landlordId: userId }, { agentId: userId }],
    };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.escrowTransaction.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, lga: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.escrowTransaction.count({ where }),
    ]);

    return { items, total };
  }

  private async _getEscrow(escrowId: string) {
    const escrow = await prisma.escrowTransaction.findUnique({ where: { id: escrowId } });
    if (!escrow || escrow.isDeleted) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow not found' });
    }
    return escrow;
  }

  private async _transition(
    escrowId: string,
    toStatus: EscrowStatus,
    actorId: string,
    reason?: string,
  ) {
    const escrow = await this._getEscrow(escrowId);
    const fromStatus = escrow.status as EscrowStatus;

    const isValid = VALID_TRANSITIONS.some(
      (t) => t.from === fromStatus && t.to === toStatus,
    );
    if (!isValid) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid transition from ${fromStatus} to ${toStatus}`,
      });
    }

    const [updated] = await Promise.all([
      prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: { status: toStatus },
      }),
      prisma.transactionLog.create({
        data: {
          escrowId,
          fromStatus,
          toStatus,
          actorId,
          reason,
        },
      }),
    ]);

    return updated;
  }
}

export const escrowService = new EscrowService();
