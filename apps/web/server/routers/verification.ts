import { router, authedProcedure, adminProcedure } from '../trpc';
import { submitNinInput, checkStatusInput, uploadDocumentInput, adminReviewInput } from '../schemas/verification';

export const verificationRouter = router({
  submitNin: authedProcedure
    .input(submitNinInput)
    .mutation(async () => {
      return { success: true, status: 'pending' as const };
    }),

  checkStatus: authedProcedure
    .input(checkStatusInput.optional())
    .query(async () => {
      return { verifications: [] as Array<{ id: string; type: string; status: string }> };
    }),

  uploadDocument: authedProcedure
    .input(uploadDocumentInput)
    .mutation(async () => {
      return { success: true, documentUrl: '' };
    }),

  adminReview: adminProcedure
    .input(adminReviewInput)
    .mutation(async () => {
      return { success: true };
    }),
});
