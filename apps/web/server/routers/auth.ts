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
import { resendClient } from '@/lib/resend/client';
import { prisma } from '@awahouse/db';

function buildOtpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F5EFE3;font-family:'DM Sans',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE3;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#F9F3E7;border-radius:20px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
          <tr>
            <td style="padding:40px 32px 0;text-align:center;">
              <h1 style="font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:900;font-size:28px;color:#C4531C;margin:0 0 4px;">Awa<span style="color:#3D3020;">house</span></h1>
              <p style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#3D3020;opacity:0.4;margin:0;">Verified Property Marketplace</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="width:48px;height:3px;background:#C4531C;margin:0 auto 24px;border-radius:2px;"></div>
              <h2 style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-weight:600;font-size:18px;color:#3D3020;margin:0 0 8px;">Verify your email</h2>
              <p style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;color:#3D3020;opacity:0.6;line-height:1.6;margin:0 0 24px;">Use the code below to complete your account setup. It expires in 5 minutes.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;padding:24px 32px;width:100%;">
                <tr>
                  <td align="center">
                    <p style="font-family:'DM Mono',monospace;font-size:36px;font-weight:600;letter-spacing:12px;color:#C4531C;margin:0;">${code}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;text-align:center;">
              <p style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;color:#3D3020;opacity:0.4;line-height:1.6;margin:0;">If you didn't request this code, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 40px;text-align:center;">
              <div style="border-top:1px solid #EDE3D0;margin:0 0 24px;"></div>
              <p style="font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:11px;color:#3D3020;opacity:0.3;margin:0;">Lagos, Nigeria &middot; &copy; 2026 Awahouse</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
      } else {
        await resendClient.sendEmail({
          to: input.email,
          subject: 'Your Awahouse verification code',
          html: buildOtpEmailHtml(code),
        });
      }

      return { success: true };
    }),

  verifyOtp: publicProcedure
    .input(verifyOtpInput)
    .mutation(async ({ input }) => {
      if (!verifyOtp(input.email, input.code)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired OTP',
        });
      }

      const supabase = createServerSupabaseClient();
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!existingUser) {
        const newUserRole = input.role ?? 'tenant';

        let supabaseUserId: string | null = null;
        if (input.password && supabase) {
          const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true,
          });
          if (!createError && createdUser?.user) {
            supabaseUserId = createdUser.user.id;
          }
        }

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
        if (input.password && supabase && supabaseUserId) {
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
