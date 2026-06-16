import { z } from 'zod';

export const sendOtpInput = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['tenant', 'landlord', 'agent']),
});

export const verifyOtpInput = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  role: z.enum(['tenant', 'landlord', 'agent']).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signInInput = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signInWithGoogleInput = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  role: z.enum(['tenant', 'landlord', 'agent']).optional(),
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
  firmName: z.string().max(200).optional(),
  bankName: z.string().max(100).optional(),
  bankCode: z.string().max(10).optional(),
  bankAccount: z.string().max(10).optional(),
});

export type SendOtpInput = z.infer<typeof sendOtpInput>;
export type VerifyOtpInput = z.infer<typeof verifyOtpInput>;
export type SignInInput = z.infer<typeof signInInput>;
export type SignInWithGoogleInput = z.infer<typeof signInWithGoogleInput>;
export type SwitchRoleInput = z.infer<typeof switchRoleInput>;
