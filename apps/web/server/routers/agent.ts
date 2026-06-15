import { prisma } from '@awahouse/db';
import { router, agentProcedure } from '../trpc';

export const agentRouter = router({
  getDashboardStats: agentProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId!;

    const [
      listingsCount,
      activeEscrows,
      completedEscrows,
      commissionResult,
      ratingResult,
    ] = await Promise.all([
      prisma.property.count({ where: { ownerId: userId, isDeleted: false } }),
      prisma.escrowTransaction.count({
        where: {
          agentId: userId,
          isDeleted: false,
          status: { in: ['funds_held', 'docs_verified', 'key_handover_pending'] },
        },
      }),
      prisma.escrowTransaction.count({
        where: { agentId: userId, status: 'completed' },
      }),
      prisma.escrowTransaction.aggregate({
        where: { agentId: userId, status: 'completed' },
        _sum: { platformFeeKobo: true },
      }),
      prisma.review.aggregate({
        where: { revieweeId: userId, isPublished: true },
        _avg: { rating: true },
      }),
    ]);

    return {
      listingsCount,
      activeEscrows,
      completedEscrows,
      totalCommissionKobo: commissionResult._sum.platformFeeKobo ?? 0n,
      avgRating: ratingResult._avg.rating ?? null,
    };
  }),
});
