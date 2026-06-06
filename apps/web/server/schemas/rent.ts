import { z } from 'zod';

export const listInstalmentsInput = z.object({
  escrowId: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'paid', 'overdue', 'missed']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const payInstalmentInput = z.object({
  instalmentId: z.string().uuid('Invalid instalment ID'),
});

export const getRentScoreInput = z.object({
  userId: z.string().uuid().optional(),
});

export const listScoreEventsInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ListInstalmentsInput = z.infer<typeof listInstalmentsInput>;
