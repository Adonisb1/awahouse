import { z } from 'zod';
import { LGA_LIST } from '@awahouse/types';

const phoneRegex = /^\+234[0-9]{10}$/;

export const sendOtpInput = z.object({
  phone: z
    .string()
    .regex(phoneRegex, 'Phone must be a valid Nigerian number (+234XXXXXXXXXX)'),
  role: z.enum(['tenant', 'landlord', 'agent']),
});

export const verifyOtpInput = z.object({
  phone: z
    .string()
    .regex(phoneRegex, 'Phone must be a valid Nigerian number (+234XXXXXXXXXX)'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  firstName: z.string().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
  lga: z.enum(LGA_LIST).optional(),
});

export const signInWithGoogleInput = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  role: z.enum(['tenant', 'landlord', 'agent']).optional(),
});

export const signOutInput = z.object({
  allSessions: z.boolean().optional().default(false),
});

export type SendOtpInput = z.infer<typeof sendOtpInput>;
export type VerifyOtpInput = z.infer<typeof verifyOtpInput>;
export type SignInWithGoogleInput = z.infer<typeof signInWithGoogleInput>;
