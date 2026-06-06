import { prisma } from '@awahouse/db';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../trpc';
import {
  verifyPropertyInput,
  verifyAgentInput,
  adminResolveDisputeInput,
  adminReleaseFundsInput,
  getAdminStatsInput,
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
