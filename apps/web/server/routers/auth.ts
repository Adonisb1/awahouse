import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, authedProcedure } from '../trpc';
import { sendOtpInput, verifyOtpInput, signInWithGoogleInput, switchRoleInput } from '../schemas/auth';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { createOtp, verifyOtp, canRequestOtp } from '@/lib/auth/otp';
import { verificationService } from '../services/VerificationService';
import { prisma } from '@awahouse/db';

export const authRouter = router({
  sendOtp: publicProcedure
    .input(sendOtpInput)
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

      if (input.intent === 'signup' && existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists. Please log in instead.',
        });
      }

      if (input.intent === 'login' && !existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No account found with this email. Please sign up instead.',
        });
      }

      if (!canRequestOtp(input.email)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many OTP requests. Please wait 10 minutes.',
        });
      }

      const code = createOtp(input.email);

      console.log('═══════════════════════════════════════');
      console.log(`  🔑 OTP for ${input.email}: ${code}`);
      console.log('═══════════════════════════════════════');

      const supabase = createServerSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          email: input.email,
          options: { data: { role: input.role } },
        });
        if (error) {
          console.error('Supabase OTP error:', error.message);
        }
      }

      return { success: true };
    }),

  verifyOtp: publicProcedure
    .input(verifyOtpInput)
    .mutation(async ({ input }) => {
      const supabase = createServerSupabaseClient();
      let supabaseUserId: string | null = null;

      if (supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: input.email,
          token: input.code,
          type: 'email',
        });
        if (!error && data.user) {
          supabaseUserId = data.user.id;
        } else if (error) {
          console.warn('Supabase OTP fallback to local:', error.message);
        }
      }

      if (!supabaseUserId && !verifyOtp(input.email, input.code)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired OTP',
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!existingUser) {
        const newUserRole = input.role ?? 'tenant';
        const newUser = await prisma.user.create({
          data: {
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            roles: [newUserRole],
            activeRole: newUserRole,
          },
        });

        return {
          success: true,
          userId: newUser.id,
          roles: [newUserRole],
          activeRole: newUserRole,
          sessionToken: supabase ? null : 'stub-session-token',
        };
      }

      return {
        success: true,
        userId: existingUser.id,
        roles: existingUser.roles,
        activeRole: existingUser.activeRole,
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
        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          const googleRole = input.role ?? 'tenant';
          dbUser = await prisma.user.create({
            data: {
              email,
              firstName: data.user.user_metadata?.given_name,
              lastName: data.user.user_metadata?.family_name,
              avatarUrl: data.user.user_metadata?.avatar_url,
              roles: [googleRole],
              activeRole: googleRole,
            },
          });
        }
        return { success: true, userId: dbUser.id, roles: dbUser.roles, activeRole: dbUser.activeRole };
      }

      return { success: true, userId: 'stub-google-user-id', roles: ['tenant'], activeRole: 'tenant' };
    }),

  switchRole: authedProcedure
    .input(switchRoleInput)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.roles.includes(input.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You do not have the "${input.role}" role`,
        });
      }

      await prisma.user.update({
        where: { id: ctx.userId! },
        data: { activeRole: input.role },
      });

      return { success: true, activeRole: input.role, roles: ctx.roles };
    }),

  upgradeToLandlord: authedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.roles.includes('landlord')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are already a landlord',
        });
      }

      if (!ctx.roles.includes('tenant')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only tenants can upgrade to landlord',
        });
      }

      const { canUpgrade, missingRequirements } = await verificationService.canUpgradeToLandlord(ctx.userId!);

      if (!canUpgrade) {
        return {
          success: false,
          canUpgrade: false,
          missingRequirements,
          message: 'Complete the following requirements to become a landlord',
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id: ctx.userId! },
        data: {
          roles: { push: 'landlord' },
          activeRole: 'landlord',
        },
      });

      return {
        success: true,
        canUpgrade: true,
        roles: updatedUser.roles,
        activeRole: updatedUser.activeRole,
      };
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
      return { userId: ctx.userId, roles: ctx.roles, activeRole: ctx.activeRole, authenticated: true };
    }),
});
