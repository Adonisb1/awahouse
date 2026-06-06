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
import { escrowService } from '../services/EscrowService';
import { rentScoreService } from '../services/RentScoreService';

export const escrowRouter = router({
  initiate: tenantProcedure.input(initiateEscrowInput).mutation(async ({ ctx, input }) => {
    const result = await escrowService.initiate(
      ctx.userId!,
      input.propertyId,
      input.amountKobo,
      input.rentMonthly,
    );
    return {
      success: true,
      escrowId: result.escrow.id,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    };
  }),

  getById: authedProcedure.input(escrowIdInput).query(async ({ ctx, input }) => {
    return escrowService.getById(input.id, ctx.userId!);
  }),

  list: authedProcedure.input(listEscrowsInput).query(async ({ ctx, input }) => {
    return escrowService.list(ctx.userId!, input.status, input.page, input.limit);
  }),

  confirmHandover: tenantProcedure.input(confirmHandoverInput).mutation(async ({ ctx, input }) => {
    const escrow = await escrowService.confirmHandover(input.escrowId, ctx.userId!);

    await rentScoreService.recordEvent(ctx.userId!, 'escrow_completed', input.escrowId);

    if (escrow.rentMonthly) {
      await rentScoreService.scheduleInstalments(input.escrowId, new Date(), escrow.amountKobo);
    }

    return {
      success: true,
      showReviewPrompt: true,
      propertyId: escrow.propertyId,
      landlordId: escrow.landlordId,
    };
  }),

  raiseDispute: tenantProcedure.input(raiseDisputeInput).mutation(async ({ ctx, input }) => {
    const escrow = await escrowService.raiseDispute(input.escrowId, ctx.userId!, input.reason);
    await rentScoreService.recordEvent(ctx.userId!, 'dispute_raised', input.escrowId);
    return { success: true };
  }),

  cancel: authedProcedure.input(escrowIdInput).mutation(async ({ ctx, input }) => {
    await escrowService.cancel(input.id, ctx.userId!);
    return { success: true };
  }),

  adminRelease: adminProcedure.input(adminReleaseInput).mutation(async ({ ctx, input }) => {
    await escrowService.adminRelease(input.escrowId, ctx.userId!);
    return { success: true };
  }),

  adminRefund: adminProcedure.input(adminRefundInput).mutation(async ({ ctx, input }) => {
    await escrowService.adminRefund(input.escrowId, ctx.userId!);
    return { success: true };
  }),

  adminResolveDispute: adminProcedure.input(adminResolveDisputeInput).mutation(async ({ ctx, input }) => {
    if (input.outcome === 'completed') {
      await escrowService.adminRelease(input.escrowId, ctx.userId!);
    } else {
      await escrowService.adminRefund(input.escrowId, ctx.userId!);
    }
    return { success: true, outcome: input.outcome };
  }),
});
