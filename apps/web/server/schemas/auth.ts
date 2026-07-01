import { z } from 'zod';
import { BLOCKED_EMAIL_DOMAINS, isEmailDomainBlocked } from '@/lib/email/blocked-domains';

const emailSchema = z.string().email('Please enter a valid email address').refine(
  (email) => !isEmailDomainBlocked(email),
  'Please use a valid email address (disposable emails not allowed)',
);

const phoneSchema = z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in E.164 format (e.g. +2348012345678)').optional();

export const sendOtpInput = z.object({
  email: emailSchema,
  role: z.enum(['tenant', 'landlord', 'agent']),
});

export const verifyOtpInput = z.object({
  email: emailSchema,
  code: z.string().length(6, 'OTP must be 6 digits'),
  role: z.enum(['tenant', 'landlord', 'agent']).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: phoneSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const signInInput = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signInWithGoogleInput = z.object({
  idToken: z.string().optional(),
  accessToken: z.string().optional(),
  role: z.enum(['tenant', 'landlord', 'agent', 'admin']).optional(),
});

export const switchRoleInput = z.object({
  role: z.enum(['tenant', 'landlord', 'agent', 'admin']),
});

export const signOutInput = z.object({
  allSessions: z.boolean().optional().default(false),
});

export const updateProfileInput = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
  phone: phoneSchema,
  firmName: z.string().max(200).optional(),
  bankName: z.string().max(100).optional(),
  bankCode: z.string().max(10).optional(),
  bankAccount: z.string().max(10).optional(),
});

export const syncGoogleUserInput = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(['tenant', 'landlord', 'agent']).default('tenant'),
});

export type SendOtpInput = z.infer<typeof sendOtpInput>;
export type VerifyOtpInput = z.infer<typeof verifyOtpInput>;
export type SignInInput = z.infer<typeof signInInput>;
export type SignInWithGoogleInput = z.infer<typeof signInWithGoogleInput>;
export type SwitchRoleInput = z.infer<typeof switchRoleInput>;
export type SyncGoogleUserInput = z.infer<typeof syncGoogleUserInput>;
