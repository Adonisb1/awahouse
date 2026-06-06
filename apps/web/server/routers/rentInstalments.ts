import { z } from 'zod';
import { authedProcedure, tenantProcedure, router } from '../trpc';
import { listInstalmentsInput, payInstalmentInput } from '../schemas/rent';
import { rentScoreService } from '../services/RentScoreService';

export const rentInstalmentsRouter = router({
  list: authedProcedure.input(listInstalmentsInput).query(async ({ ctx, input }) => {
    return rentScoreService.getInstalments(
      ctx.userId!,
      input.escrowId,
      input.status,
      input.page,
      input.limit,
    );
  }),

  pay: tenantProcedure.input(payInstalmentInput).mutation(async ({ ctx, input }) => {
    return rentScoreService.payInstalment(input.instalmentId, ctx.userId!);
  }),

  getSchedule: authedProcedure
    .input(z.object({ escrowId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return rentScoreService.getSchedule(input.escrowId);
    }),
});
