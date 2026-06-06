import { z } from 'zod';
import { PROFESSIONAL_BODIES } from '@awahouse/types';

export const submitNinInput = z.object({
  nin: z
    .string()
    .length(11, 'NIN must be exactly 11 characters')
    .regex(/^[0-9]+$/, 'NIN must contain only digits'),
  faceImageBase64: z.string().optional(),
});

export const checkStatusInput = z.object({
  type: z.enum(['nin', ...PROFESSIONAL_BODIES] as [string, ...string[]]).optional(),
});

export const uploadDocumentInput = z.object({
  verificationType: z.enum(['nin', ...PROFESSIONAL_BODIES, 'property_title'] as [string, ...string[]]),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileBase64: z.string().min(1, 'File data is required'),
});

export const adminReviewInput = z.object({
  verificationId: z.string().uuid('Invalid verification ID'),
  status: z.enum(['approved', 'rejected']),
  reason: z.string().max(500).optional(),
});

export type SubmitNinInput = z.infer<typeof submitNinInput>;
export type CheckStatusInput = z.infer<typeof checkStatusInput>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentInput>;
export type AdminReviewInput = z.infer<typeof adminReviewInput>;
