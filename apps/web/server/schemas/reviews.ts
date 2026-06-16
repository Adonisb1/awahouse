import { z } from 'zod';

export const createReviewInput = z.object({
  revieweeId: z.string().uuid('Invalid reviewee ID'),
  propertyId: z.string().uuid('Invalid property ID').optional(),
  escrowId: z.string().uuid('Invalid escrow ID').optional(),
  type: z.enum(['property', 'landlord', 'agent']),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000).optional(),
});

export const reviewListInput = z.object({
  propertyId: z.string().uuid().optional(),
  revieweeId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export const deleteReviewInput = z.object({
  id: z.string().uuid('Invalid review ID'),
});

export const aggregateRatingInput = z.object({
  propertyId: z.string().uuid().optional(),
  revieweeId: z.string().uuid().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewInput>;
export type ReviewListInput = z.infer<typeof reviewListInput>;
