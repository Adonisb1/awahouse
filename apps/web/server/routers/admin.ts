import { prisma } from '@awahouse/db';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../trpc';
import {
  verifyPropertyInput,
  verifyAgentInput,
  adminResolveDisputeInput,
  adminReleaseFundsInput,
  getAdminStatsInput,
  listEscrowsInput,
  escrowActionInput,
  adminListVerificationsInput,
} from '../schemas/admin';
import { verificationService } from '../services/VerificationService';
import { escrowService } from '../services/EscrowService';

export const adminRouter = router({
  verifyProperty: adminProcedure.input(verifyPropertyInput).mutation(async ({ ctx, input }) => {
    const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
    if (!property || property.isDeleted) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Property not found' });
    }

    await prisma.property.update({
      where: { id: input.propertyId },
      data: { verificationBadge: input.badge },
    });

    return { success: true };
  }),

  verifyAgent: adminProcedure.input(verifyAgentInput).mutation(async ({ ctx, input }) => {
    const result = await verificationService.adminReview(
      input.verificationId,
      input.status,
      ctx.userId!,
      input.notes,
    );
    return { success: true, status: result.status };
  }),

  releaseFunds: adminProcedure.input(adminReleaseFundsInput).mutation(async ({ ctx, input }) => {
    await escrowService.adminRelease(input.escrowId, ctx.userId!);
    return { success: true };
  }),

  resolveDispute: adminProcedure.input(adminResolveDisputeInput).mutation(async ({ ctx, input }) => {
    if (input.outcome === 'completed') {
      await escrowService.adminRelease(input.escrowId, ctx.userId!);
    } else {
      await escrowService.adminRefund(input.escrowId, ctx.userId!);
    }
    return { success: true, outcome: input.outcome };
  }),

  listEscrows: adminProcedure.input(listEscrowsInput).query(async ({ input }) => {
    const where: Record<string, unknown> = { isDeleted: false };
    if (input.status) where.status = input.status;
    if (input.search) {
      where.OR = [
        { property: { title: { contains: input.search, mode: 'insensitive' } } },
        { paymentReference: { contains: input.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.escrowTransaction.findMany({
        where: { ...where, ...(input.search ? {} : {}) },
        include: {
          property: { select: { id: true, title: true, lga: true } },
          tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
          landlord: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.escrowTransaction.count({ where }),
    ]);

    return { items, total };
  }),

  getEscrowDetail: adminProcedure.input(escrowActionInput).query(async ({ input }) => {
    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: input.escrowId },
      include: {
        property: true,
        tenant: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, phone: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, phone: true } },
        agent: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!escrow || escrow.isDeleted) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Escrow not found' });
    }
    return escrow;
  }),

  markDocsVerified: adminProcedure.input(escrowActionInput).mutation(async ({ ctx, input }) => {
    await escrowService.markDocsVerified(input.escrowId, ctx.userId!);
    return { success: true };
  }),

  markHandoverPending: adminProcedure.input(escrowActionInput).mutation(async ({ ctx, input }) => {
    await escrowService.markHandoverPending(input.escrowId, ctx.userId!);
    return { success: true };
  }),

  listVerifications: adminProcedure.input(adminListVerificationsInput).query(async ({ input }) => {
    const where: Record<string, unknown> = {};
    if (input.status) where.status = input.status;
    if (input.type) where.type = input.type;

    const [items, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.verification.count({ where }),
    ]);

    return { items, total };
  }),

  getStats: adminProcedure.input(getAdminStatsInput).query(async () => {
    const [totalEscrows, completedCount, pendingVerifications, totalRevenueResult] = await Promise.all([
      prisma.escrowTransaction.count({ where: { isDeleted: false } }),
      prisma.escrowTransaction.count({ where: { status: 'completed' } }),
      prisma.verification.count({ where: { status: 'pending' } }),
      prisma.escrowTransaction.aggregate({
        where: { status: 'completed' },
        _sum: { platformFeeKobo: true },
      }),
    ]);

    return {
      totalEscrows,
      completedCount,
      pendingVerifications,
      totalRevenue: totalRevenueResult._sum.platformFeeKobo ?? 0n,
    };
  }),
});
