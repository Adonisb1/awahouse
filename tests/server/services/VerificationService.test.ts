import { describe, it, expect } from 'vitest';

describe('VerificationService - smoke', () => {
  it('should have the correct professional bodies list', async () => {
    const { PROFESSIONAL_BODIES } = await import('@awahouse/types');
    expect(PROFESSIONAL_BODIES).toEqual([
      'lasrera',
      'esvarbon',
      'niesv',
      'aean',
      'ercaan',
      'redan',
    ]);
  });

  it('VerificationService class should be exported', async () => {
    const mod = await import('@/server/services/VerificationService');
    expect(mod.VerificationService).toBeDefined();
    expect(mod.verificationService).toBeDefined();
  });
});
