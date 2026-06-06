import { router, publicProcedure, authedProcedure } from '../trpc';
import { sendOtpInput, verifyOtpInput, signInWithGoogleInput } from '../schemas/auth';

export const authRouter = router({
  sendOtp: publicProcedure
    .input(sendOtpInput)
    .mutation(async () => {
      return { success: true };
    }),

  verifyOtp: publicProcedure
    .input(verifyOtpInput)
    .mutation(async () => {
      return { success: true, userId: null as string | null, sessionToken: null as string | null };
    }),

  signInWithGoogle: publicProcedure
    .input(signInWithGoogleInput)
    .mutation(async () => {
      return { success: true, userId: null as string | null };
    }),

  signOut: authedProcedure
    .mutation(async () => {
      return { success: true };
    }),

  refreshSession: authedProcedure
    .query(async ({ ctx }) => {
      return { userId: ctx.userId, role: ctx.role };
    }),
});
