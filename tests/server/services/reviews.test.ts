import { describe, it, expect } from 'vitest';

describe('Review schemas', () => {
  it('should validate correct review input', async () => {
    const { createReviewInput } = await import('@/server/schemas/reviews');
    const result = createReviewInput.safeParse({
      revieweeId: '00000000-0000-0000-0000-000000000001',
      type: 'property',
      rating: 4,
      comment: 'Great place!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject rating out of range', async () => {
    const { createReviewInput } = await import('@/server/schemas/reviews');
    const result = createReviewInput.safeParse({
      revieweeId: '00000000-0000-0000-0000-000000000001',
      type: 'landlord',
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid review type', async () => {
    const { createReviewInput } = await import('@/server/schemas/reviews');
    const result = createReviewInput.safeParse({
      revieweeId: '00000000-0000-0000-0000-000000000001',
      type: 'invalid_type',
      rating: 3,
    });
    expect(result.success).toBe(false);
  });

  it('ReviewService class should be exported', async () => {
    const mod = await import('@/server/services/ReviewService');
    expect(mod.ReviewService).toBeDefined();
    expect(mod.reviewService).toBeDefined();
  });
});
