import { adminProcedure, router } from '../trpc';
import {
  verifyPropertyInput,
  verifyAgentInput,
  adminResolveDisputeInput,
  adminReleaseFundsInput,
  getAdminStatsInput,
} from '../schemas/admin';

export const adminRouter = router({
  verifyProperty: adminProcedure.input(verifyPropertyInput).mutation(async ({ ctx, input }) => {
    // admin-agent implements
    return { success: true };
  }),

  verifyAgent: adminProcedure.input(verifyAgentInput).mutation(async ({ ctx, input }) => {
    // admin-agent implements
    return { success: true };
  }),

  releaseFunds: adminProcedure.input(adminReleaseFundsInput).mutation(async ({ ctx, input }) => {
    // escrow-agent implements
    return { success: true };
  }),

  resolveDispute: adminProcedure.input(adminResolveDisputeInput).mutation(async ({ ctx, input }) => {
    // admin-agent implements
    return { success: true, outcome: input.outcome };
  }),

  getStats: adminProcedure.input(getAdminStatsInput).query(async ({ ctx, input }) => {
    // admin-agent implements
    return { totalEscrows: 0, totalRevenue: 0n, completedCount: 0, pendingVerifications: 0 };
  }),
});
