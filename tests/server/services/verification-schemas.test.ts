import { describe, it, expect } from 'vitest';

describe('Verification schemas', () => {
  it('should validate correct NIN input', async () => {
    const { submitNinInput } = await import('@/server/schemas/verification');
    const result = submitNinInput.safeParse({ nin: '12345678901' });
    expect(result.success).toBe(true);
  });

  it('should reject NIN with wrong length', async () => {
    const { submitNinInput } = await import('@/server/schemas/verification');
    const result = submitNinInput.safeParse({ nin: '12345' });
    expect(result.success).toBe(false);
  });

  it('should reject NIN with letters', async () => {
    const { submitNinInput } = await import('@/server/schemas/verification');
    const result = submitNinInput.safeParse({ nin: '1234567890a' });
    expect(result.success).toBe(false);
  });
});
