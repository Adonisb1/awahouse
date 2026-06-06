import { router, authedProcedure, publicProcedure, adminProcedure } from '../trpc';
import { createReviewInput, reviewListInput, deleteReviewInput, aggregateRatingInput } from '../schemas/reviews';
import { reviewService } from '../services/ReviewService';

export const reviewsRouter = router({
  create: authedProcedure
    .input(createReviewInput)
    .mutation(async ({ input, ctx }) => {
      const review = await reviewService.create(ctx.userId!, input);
      return { success: true, id: review.id };
    }),

  list: publicProcedure
    .input(reviewListInput)
    .query(async ({ input }) => {
      return reviewService.list(input);
    }),

  aggregateRating: publicProcedure
    .input(aggregateRatingInput)
    .query(async ({ input }) => {
      return reviewService.aggregateRating(input);
    }),

  delete: adminProcedure
    .input(deleteReviewInput)
    .mutation(async ({ input }) => {
      return reviewService.delete(input.id);
    }),
});
