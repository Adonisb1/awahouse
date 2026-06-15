import { TRPCError } from '@trpc/server';
import { Prisma, prisma, type ReviewType } from '@awahouse/db';

export class ReviewService {
  async create(
    reviewerId: string,
    input: {
      revieweeId: string;
      propertyId?: string;
      escrowId?: string;
      type: ReviewType;
      rating: number;
      comment?: string;
    },
  ) {
    if (input.escrowId) {
      const existing = await prisma.review.findUnique({
        where: { reviewerId_escrowId: { reviewerId, escrowId: input.escrowId } },
      });
      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You have already reviewed this transaction',
        });
      }
    }

    const review = await prisma.review.create({
      data: {
        reviewerId,
        revieweeId: input.revieweeId,
        propertyId: input.propertyId,
        escrowId: input.escrowId,
        type: input.type,
        rating: input.rating,
        comment: input.comment,
        isVerified: !!input.escrowId,
      },
    });

    return review;
  }

  async list(input: { propertyId?: string; revieweeId?: string; page: number; limit: number }) {
    const where: Record<string, unknown> = { isPublished: true };

    if (input.propertyId) where.propertyId = input.propertyId;
    if (input.revieweeId) where.revieweeId = input.revieweeId;

    const skip = (input.page - 1) * input.limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: where as Prisma.ReviewWhereInput,
        include: {
          reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: input.limit,
      }),
      prisma.review.count({ where: where as Prisma.ReviewWhereInput }),
    ]);

    return { reviews, total, page: input.page, limit: input.limit };
  }

  async aggregateRating(input: { propertyId?: string; revieweeId?: string }) {
    const where: Record<string, unknown> = { isPublished: true };

    if (input.propertyId) where.propertyId = input.propertyId;
    if (input.revieweeId) where.revieweeId = input.revieweeId;

    const result = await prisma.review.aggregate({
      where: where as Prisma.ReviewWhereInput,
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
      count: result._count.rating,
    };
  }

  async delete(reviewId: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { isPublished: false },
    });

    return { success: true };
  }
}

export const reviewService = new ReviewService();
