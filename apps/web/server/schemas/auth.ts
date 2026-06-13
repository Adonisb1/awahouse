import { z } from 'zod';

export const sendOtpInput = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['tenant', 'landlord', 'agent']),
  intent: z.enum(['signup', 'login']).optional().default('signup'),
});

export const verifyOtpInput = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  role: z.enum(['tenant', 'landlord', 'agent']).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
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

export type SendOtpInput = z.infer<typeof sendOtpInput>;
export type VerifyOtpInput = z.infer<typeof verifyOtpInput>;
export type SignInWithGoogleInput = z.infer<typeof signInWithGoogleInput>;
export type SwitchRoleInput = z.infer<typeof switchRoleInput>;
