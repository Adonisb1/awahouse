import { TRPCError } from '@trpc/server';
import { router, authedProcedure, adminProcedure } from '../trpc';
import { submitNinInput, checkStatusInput, uploadDocumentInput, adminReviewInput } from '../schemas/verification';
import { verificationService } from '../services/VerificationService';

export const verificationRouter = router({
  submitNin: authedProcedure
    .input(submitNinInput)
    .mutation(async ({ input, ctx }) => {
      const verification = await verificationService.submitNin(
        ctx.userId!,
        input.nin,
        input.faceImageBase64,
      );
      return { success: true, status: verification.status, id: verification.id };
    }),

  checkStatus: authedProcedure
    .input(checkStatusInput.optional())
    .query(async ({ ctx }) => {
      const verifications = await verificationService.checkStatus(ctx.userId!);
      return { verifications };
    }),

  uploadDocument: authedProcedure
    .input(uploadDocumentInput)
    .mutation(async ({ input, ctx }) => {
      const verification = await verificationService.uploadDocument(
        ctx.userId!,
        input.verificationType,
        input.fileName,
        input.fileType,
        input.fileBase64,
      );
      return { success: true, documentUrl: verification.documentUrl ?? '', id: verification.id };
    }),

  adminReview: adminProcedure
    .input(adminReviewInput)
    .mutation(async ({ input, ctx }) => {
      const verification = await verificationService.adminReview(
        input.verificationId,
        input.status,
        ctx.userId!,
        input.reason,
      );
      return { success: true, status: verification.status };
    }),

  canCreateListing: authedProcedure
    .query(async ({ ctx }) => {
      const canCreate = await verificationService.canAgentCreateListing(ctx.userId!);
      return { canCreate };
    }),
});
