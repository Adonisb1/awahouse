import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, authedProcedure } from '../trpc';
import {
  sendOtpInput, verifyOtpInput, signInInput, signInWithGoogleInput,
  switchRoleInput, updateProfileInput,
} from '../schemas/auth';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { createOtp, verifyOtp, canRequestOtp } from '@/lib/auth/otp';
import { encrypt, decrypt } from '@/lib/crypto/encrypt';
import { verificationService } from '../services/VerificationService';
import { prisma } from '@awahouse/db';

export const authRouter = router({
  sendOtp: publicProcedure
    .input(sendOtpInput)
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists. Please log in instead.',
        });
      }

      if (!canRequestOtp(input.email)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many OTP requests. Please wait 10 minutes.',
        });
      }

      const code = createOtp(input.email);

      if (process.env.NODE_ENV === 'development') {
        console.log('═══════════════════════════════════════');
        console.log(`  🔑 [DEV ONLY] OTP for ${input.email}: ${code}`);
        console.log('═══════════════════════════════════════');
      }

      const supabase = createServerSupabaseClient();
      if (supabase) {
        await supabase.auth.signInWithOtp({
          email: input.email,
          options: { data: { role: input.role } },
        });
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
        }
      }

      if (!supabaseUserId && !verifyOtp(input.email, input.code)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired OTP',
        });
      }

      if (supabaseUserId && input.password && supabase) {
        await supabase.auth.admin.updateUserById(supabaseUserId, {
          password: input.password,
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

        let sessionToken: string | null = null;
        if (input.password && supabase) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: input.email,
            password: input.password,
          });
          sessionToken = signInData?.session?.access_token ?? null;
        }

        return {
          success: true,
          userId: newUser.id,
          roles: [newUserRole],
          activeRole: newUserRole,
          sessionToken,
        };
      }

      let sessionToken: string | null = null;
      if (input.password && supabase) {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });
        sessionToken = signInData?.session?.access_token ?? null;
      }

      return {
        success: true,
        userId: existingUser.id,
        roles: existingUser.roles,
        activeRole: existingUser.activeRole,
        sessionToken,
      };
    }),

  signIn: publicProcedure
    .input(signInInput)
    .mutation(async ({ input }) => {
      const supabase = createServerSupabaseClient();

      if (!supabase) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication service unavailable',
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error || !data.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error?.message === 'Invalid login credentials'
            ? 'Invalid email or password'
            : (error?.message ?? 'Sign in failed'),
        });
      }

      let dbUser = await prisma.user.findUnique({ where: { email: input.email } });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: input.email,
            roles: ['tenant'],
            activeRole: 'tenant',
          },
        });
      }

      return {
        success: true,
        userId: dbUser.id,
        roles: dbUser.roles,
        activeRole: dbUser.activeRole,
        sessionToken: data.session?.access_token ?? null,
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

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Google sign-in is not configured. Please use email/OTP instead.',
      });
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

  getProfile: authedProcedure
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId! },
        include: { landlordProfile: true },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      let bankAccount: string | null = null;
      if (user.landlordProfile?.bankAccount) {
        try { bankAccount = decrypt(user.landlordProfile.bankAccount); }
        catch { bankAccount = null; }
      }

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
        activeRole: user.activeRole,
        rentScore: user.rentScore,
        landlordProfile: user.landlordProfile
          ? {
              firmName: user.landlordProfile.firmName,
              bankName: user.landlordProfile.bankName,
              bankCode: user.landlordProfile.bankCode,
              bankAccount,
            }
          : null,
      };
    }),

  updateProfile: authedProcedure
    .input(updateProfileInput)
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({ where: { id: ctx.userId! } });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const userUpdate: Record<string, unknown> = {};
      if (input.firstName !== undefined) userUpdate.firstName = input.firstName;
      if (input.lastName !== undefined) userUpdate.lastName = input.lastName;
      if (input.avatarUrl !== undefined) userUpdate.avatarUrl = input.avatarUrl;

      if (Object.keys(userUpdate).length > 0) {
        await prisma.user.update({ where: { id: ctx.userId! }, data: userUpdate });
      }

      const hasLandlordFields = input.firmName !== undefined
        || input.bankName !== undefined
        || input.bankCode !== undefined
        || input.bankAccount !== undefined;

      if (hasLandlordFields) {
        const profileData: Record<string, unknown> = {};
        if (input.firmName !== undefined) profileData.firmName = input.firmName;
        if (input.bankName !== undefined) profileData.bankName = input.bankName;
        if (input.bankCode !== undefined) profileData.bankCode = input.bankCode;
        if (input.bankAccount !== undefined) {
          profileData.bankAccount = encrypt(input.bankAccount);
        }

        await prisma.landlordProfile.upsert({
          where: { userId: ctx.userId! },
          create: { userId: ctx.userId!, ...profileData },
          update: profileData,
        });
      }

      return { success: true };
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
