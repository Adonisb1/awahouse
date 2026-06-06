import { z } from 'zod';
import { authedProcedure, tenantProcedure, router } from '../trpc';
import { listInstalmentsInput, payInstalmentInput } from '../schemas/rent';

export const rentInstalmentsRouter = router({
  list: authedProcedure.input(listInstalmentsInput).query(async ({ ctx, input }) => {
    // rent-agent implements
    return { items: [], total: 0 };
  }),

  pay: tenantProcedure.input(payInstalmentInput).mutation(async ({ ctx, input }) => {
    // rent-agent implements
    return { success: true, authorizationUrl: '' };
  }),

  getSchedule: authedProcedure
    .input(z.object({ escrowId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // rent-agent implements
      return { items: [], total: 0 };
    }),
});
