import { authedProcedure, router } from '../trpc';
import { getRentScoreInput, listScoreEventsInput } from '../schemas/rent';

export const rentScoreRouter = router({
  get: authedProcedure.input(getRentScoreInput).query(async ({ ctx, input }) => {
    // rent-agent implements
    return { score: 500, userId: ctx.userId };
  }),

  history: authedProcedure.input(listScoreEventsInput).query(async ({ ctx, input }) => {
    // rent-agent implements
    return { items: [], total: 0 };
  }),
});
