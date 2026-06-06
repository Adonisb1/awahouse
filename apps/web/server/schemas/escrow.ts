import { z } from 'zod';

export const escrowStatusEnum = z.enum([
  'pending_payment',
  'funds_held',
  'docs_verified',
  'key_handover_pending',
  'completed',
  'refunded',
  'cancelled',
  'disputed',
]);

export const initiateEscrowInput = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  amountKobo: z.bigint().positive('Amount must be positive'),
  rentMonthly: z.boolean().default(false),
});

export const escrowIdInput = z.object({
  id: z.string().uuid('Invalid escrow ID'),
});

export const confirmHandoverInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
});

export const raiseDisputeInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
  reason: z.string().min(10, 'Dispute reason must be at least 10 characters').max(2000),
});

export const listEscrowsInput = z.object({
  status: escrowStatusEnum.optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const adminReleaseInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
});

export const adminRefundInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
});

export const adminResolveDisputeInput = z.object({
  escrowId: z.string().uuid('Invalid escrow ID'),
  outcome: z.enum(['completed', 'refunded']),
});

export type InitiateEscrowInput = z.infer<typeof initiateEscrowInput>;
export type RaiseDisputeInput = z.infer<typeof raiseDisputeInput>;
export type ListEscrowsInput = z.infer<typeof listEscrowsInput>;
