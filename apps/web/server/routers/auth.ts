import { TRPCError } from '@trpc/server';
import { router, publicProcedure, authedProcedure } from '../trpc';
import { sendOtpInput, verifyOtpInput, signInWithGoogleInput } from '../schemas/auth';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { createOtp, verifyOtp, canRequestOtp } from '@/lib/auth/otp';
import { prisma } from '@awahouse/db';

export const authRouter = router({
  sendOtp: publicProcedure
    .input(sendOtpInput)
    .mutation(async ({ input }) => {
      if (!canRequestOtp(input.phone)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many OTP requests. Please wait 10 minutes.',
        });
      }

      const code = createOtp(input.phone);

      const supabase = createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: input.phone,
          options: { data: { role: input.role } },
        });
        if (error) {
          console.error('Supabase OTP error:', error.message);
        }
      }

      console.log(`[STUB] OTP for ${input.phone}: ${code}`);

      return { success: true };
    }),

  verifyOtp: publicProcedure
    .input(verifyOtpInput)
    .mutation(async ({ input }) => {
      const supabase = createServerSupabaseClient();
      let userId: string | null = null;

      if (supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: input.phone,
          token: input.code,
          type: 'sms',
        });
        if (error || !data.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: error?.message ?? 'Invalid or expired OTP',
          });
        }
        userId = data.user.id;
      } else {
        if (!verifyOtp(input.phone, input.code)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired OTP',
          });
        }
      }

      const existingUser = await prisma.user.findUnique({
        where: { phone: input.phone },
      });

      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            phone: input.phone,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            role: 'tenant',
          },
        });
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }

      if (!userId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create or find user',
        });
      }

      return {
        success: true,
        userId,
        sessionToken: supabase ? null : 'stub-session-token',
      };
    }),

  signInWithGoogle: publicProcedure
    .input(signInWithGoogleInput)
    .mutation(async ({ input }) => {
      const supabase = createServerSupabaseClient();

      if (supabase) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: input.idToken,
        });
        if (error || !data.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: error?.message ?? 'Google sign-in failed',
          });
        }
        const email = data.user.email;
        if (!email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Google account must have a verified email',
          });
        }
        let dbUser = await prisma.user.findUnique({ where: { phone: email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              phone: email,
              email,
              firstName: data.user.user_metadata?.given_name,
              lastName: data.user.user_metadata?.family_name,
              avatarUrl: data.user.user_metadata?.avatar_url,
              role: input.role ?? 'tenant',
            },
          });
        }
        return { success: true, userId: dbUser.id };
      }

      return { success: true, userId: 'stub-google-user-id' };
    }),

  signOut: authedProcedure
    .mutation(async ({ ctx }) => {
      const supabase = createServerSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      return { success: true };
    }),

  refreshSession: authedProcedure
    .query(async ({ ctx }) => {
      return { userId: ctx.userId, role: ctx.role, authenticated: true };
    }),
});
