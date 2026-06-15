import { prisma } from '@awahouse/db';
import { router, agentProcedure, publicProcedure } from '../trpc';

const PROFESSIONAL_BODIES = ['lasrera', 'esvarbon', 'niesv', 'aean', 'ercaan', 'redan'] as const;

export type VerifiedAgentDTO = {
  id: string;
  name: string;
  firm: string | null;
  avatarUrl: string | null;
  escrowCount: number;
  rating: number | null;
  isOnline: boolean;
  professionalBodies: Array<'LASRERA' | 'ESVARBON' | 'NIESV' | 'AEAN' | 'ERCAAN' | 'REDAN'>;
};

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

  listVerified: publicProcedure.query(async (): Promise<VerifiedAgentDTO[]> => {
    const agents = await prisma.user.findMany({
      where: {
        roles: { has: 'agent' },
        isDeleted: false,
        verifications: {
          some: {
            type: 'nin',
            status: 'approved',
          },
        },
      },
      include: {
        verifications: {
          where: { status: 'approved' },
        },
        landlordProfile: { select: { firmName: true } },
        _count: {
          select: {
            escrowAsAgent: { where: { status: 'completed' } },
          },
        },
        reviewsReceived: {
          where: { isPublished: true },
          select: { rating: true },
        },
      },
    });

    const ratingAggs = await Promise.all(
      agents.map((agent) =>
        prisma.review.aggregate({
          where: { revieweeId: agent.id, isPublished: true },
          _avg: { rating: true },
        }),
      ),
    );

    return agents.map((agent, i) => {
      const approvedTypes = agent.verifications.map((v) => v.type);
      const profBodies = PROFESSIONAL_BODIES.filter((b) =>
        approvedTypes.includes(b),
      );

      return {
        id: agent.id,
        name: `${agent.firstName ?? ''} ${agent.lastName ?? ''}`.trim() || 'Agent',
        firm: agent.landlordProfile?.firmName ?? null,
        avatarUrl: agent.avatarUrl,
        escrowCount: agent._count.escrowAsAgent,
        rating: ratingAggs[i]._avg.rating ?? null,
        isOnline: false,
        professionalBodies: profBodies.map(
          (b) => b.toUpperCase() as 'LASRERA' | 'ESVARBON' | 'NIESV' | 'AEAN' | 'ERCAAN' | 'REDAN',
        ),
      };
    });
  }),
});
