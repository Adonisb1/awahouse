import { authedProcedure, tenantProcedure, adminProcedure, router } from '../trpc';
import {
  initiateEscrowInput,
  escrowIdInput,
  confirmHandoverInput,
  raiseDisputeInput,
  listEscrowsInput,
  adminReleaseInput,
  adminRefundInput,
  adminResolveDisputeInput,
} from '../schemas/escrow';

export const escrowRouter = router({
  initiate: tenantProcedure.input(initiateEscrowInput).mutation(async ({ ctx, input }) => {
    // escrow-agent implements
    return { success: true, escrowId: 'stub-escrow-id' };
  }),

  getById: authedProcedure.input(escrowIdInput).query(async ({ ctx, input }) => {
    // escrow-agent implements
    return null;
  }),

  list: authedProcedure.input(listEscrowsInput).query(async ({ ctx, input }) => {
    // escrow-agent implements
    return { items: [], total: 0 };
  }),

  confirmHandover: tenantProcedure.input(confirmHandoverInput).mutation(async ({ ctx, input }) => {
    // escrow-agent implements
    return { success: true };
  }),

  raiseDispute: tenantProcedure.input(raiseDisputeInput).mutation(async ({ ctx, input }) => {
    // escrow-agent implements
    return { success: true };
  }),

  adminRelease: adminProcedure.input(adminReleaseInput).mutation(async ({ ctx, input }) => {
    // escrow-agent implements
    return { success: true };
  }),

  adminRefund: adminProcedure.input(adminRefundInput).mutation(async ({ ctx, input }) => {
    // escrow-agent implements
    return { success: true };
  }),

  adminResolveDispute: adminProcedure.input(adminResolveDisputeInput).mutation(async ({ ctx, input }) => {
    // escrow-agent implements
    return { success: true, outcome: 'completed' };
  }),
});
