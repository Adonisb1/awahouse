import { describe, it, expect } from 'vitest';
import { clampScore } from '@/server/services/RentScoreService';

describe('RentScore clamp', () => {
  it('should clamp to minimum 300', () => {
    expect(clampScore(0)).toBe(300);
    expect(clampScore(299)).toBe(300);
    expect(clampScore(300)).toBe(300);
  });

  it('should clamp to maximum 850', () => {
    expect(clampScore(851)).toBe(850);
    expect(clampScore(1000)).toBe(850);
    expect(clampScore(850)).toBe(850);
  });

  it('should pass through values in range', () => {
    expect(clampScore(500)).toBe(500);
    expect(clampScore(600)).toBe(600);
    expect(clampScore(425)).toBe(425);
  });
});

describe('Rent schemas', () => {
  it('should validate list instalments input', async () => {
    const { listInstalmentsInput } = await import('@/server/schemas/rent');
    const result = listInstalmentsInput.safeParse({
      status: 'scheduled',
      page: 1,
      limit: 10,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid instalment status', async () => {
    const { listInstalmentsInput } = await import('@/server/schemas/rent');
    const result = listInstalmentsInput.safeParse({
      status: 'invalid_status',
    });
    expect(result.success).toBe(false);
  });

  it('should validate pay instalment input', async () => {
    const { payInstalmentInput } = await import('@/server/schemas/rent');
    const result = payInstalmentInput.safeParse({
      instalmentId: '00000000-0000-0000-0000-000000000001',
    });
    expect(result.success).toBe(true);
  });

  it('should validate rent score input', async () => {
    const { getRentScoreInput } = await import('@/server/schemas/rent');
    const result = getRentScoreInput.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('Rent service exports', () => {
  it('RentScoreService class should be exported', async () => {
    const mod = await import('@/server/services/RentScoreService');
    expect(mod.RentScoreService).toBeDefined();
    expect(mod.rentScoreService).toBeDefined();
  });

  it('rent instalment router should be importable', async () => {
    const mod = await import('@/server/routers/rentInstalments');
    expect(mod.rentInstalmentsRouter).toBeDefined();
  });

  it('rent score router should be importable', async () => {
    const mod = await import('@/server/routers/rentScore');
    expect(mod.rentScoreRouter).toBeDefined();
  });
});
