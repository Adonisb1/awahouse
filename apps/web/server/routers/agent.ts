import { z } from 'zod';
import { TRPCError } from '@trpc/server';
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

    return agents.map((agent) => {
      const ratings = agent.reviewsReceived.map((r) => r.rating);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
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
        rating: avgRating,
        isOnline: false,
        professionalBodies: profBodies.map(
          (b) => b.toUpperCase() as 'LASRERA' | 'ESVARBON' | 'NIESV' | 'AEAN' | 'ERCAAN' | 'REDAN',
        ),
      };
    });
  }),

  getPublicProfile: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id, isDeleted: false, roles: { has: 'agent' } },
        include: {
          verifications: { where: { status: 'approved' } },
          landlordProfile: { select: { firmName: true } },
          properties: {
            where: { isDeleted: false, isAvailable: true },
            include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } },
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { escrowAsAgent: { where: { status: 'completed' } } } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent not found' });
      }

      const ratingAgg = await prisma.review.aggregate({
        where: { revieweeId: user.id, isPublished: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const approvedTypes = user.verifications.map((v) => v.type);
      const profBodies = PROFESSIONAL_BODIES.filter((b) => approvedTypes.includes(b));

      return {
        id: user.id,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Agent',
        firm: user.landlordProfile?.firmName ?? null,
        avatarUrl: user.avatarUrl,
        escrowCount: user._count.escrowAsAgent,
        avgRating: ratingAgg._avg.rating ?? null,
        reviewCount: ratingAgg._count.rating,
        professionalBodies: profBodies.map(
          (b) => b.toUpperCase() as 'LASRERA' | 'ESVARBON' | 'NIESV' | 'AEAN' | 'ERCAAN' | 'REDAN',
        ),
        listings: user.properties.map((p) => ({
          id: p.id,
          title: p.title,
          lga: p.lga,
          priceKobo: p.priceKobo,
          imageUrl: p.images[0]?.url ?? null,
          type: p.type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
        })),
      };
    }),
});
