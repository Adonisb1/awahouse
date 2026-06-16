import { z } from 'zod';

export const verifyPropertyInput = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  badge: z.enum(['pending', 'agent_verified', 'title_confirmed', 'fully_verified']),
});

export const verifyAgentInput = z.object({
  verificationId: z.string().uuid('Invalid verification ID'),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().max(1000).optional(),
});

export const adminResolveDisputeInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
  outcome: z.enum(['completed', 'refunded']),
  reason: z.string().max(2000).optional(),
});

export const adminReleaseFundsInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
});

export const getAdminStatsInput = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const listEscrowsInput = z.object({
  status: z.enum([
    'pending_payment', 'funds_held', 'docs_verified',
    'key_handover_pending', 'completed', 'refunded',
    'cancelled', 'disputed',
  ]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  search: z.string().max(100).optional(),
});

export const escrowActionInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
});

export const adminListVerificationsInput = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  type: z.enum(['nin', 'lasrera', 'esvarbon', 'niesv', 'aean', 'ercaan', 'redan', 'property_title']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type VerifyPropertyInput = z.infer<typeof verifyPropertyInput>;
export type VerifyAgentInput = z.infer<typeof verifyAgentInput>;
export type AdminResolveDisputeInput = z.infer<typeof adminResolveDisputeInput>;
