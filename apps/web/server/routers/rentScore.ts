import { authedProcedure, router } from '../trpc';
import { getRentScoreInput, listScoreEventsInput } from '../schemas/rent';
import { rentScoreService } from '../services/RentScoreService';

export const rentScoreRouter = router({
  get: authedProcedure.input(getRentScoreInput).query(async ({ ctx, input }) => {
    const userId = input.userId ?? ctx.userId!;
    return rentScoreService.getScore(userId);
  }),

  history: authedProcedure.input(listScoreEventsInput).query(async ({ ctx, input }) => {
    return rentScoreService.getScoreHistory(ctx.userId!, input.page, input.limit);
  }),
});
