import { router, authedProcedure, publicProcedure, adminProcedure } from '../trpc';
import { createReviewInput, reviewListInput, deleteReviewInput, aggregateRatingInput } from '../schemas/reviews';

export const reviewsRouter = router({
  create: authedProcedure
    .input(createReviewInput)
    .mutation(async ({ input, ctx }) => {
      return { success: true, id: '' };
    }),

  list: publicProcedure
    .input(reviewListInput)
    .query(async ({ input }) => {
      return { reviews: [], total: 0 };
    }),

  aggregateRating: publicProcedure
    .input(aggregateRatingInput)
    .query(async ({ input }) => {
      return { average: 0, count: 0 };
    }),

  delete: adminProcedure
    .input(deleteReviewInput)
    .mutation(async ({ input, ctx }) => {
      return { success: true };
    }),
});
