import { describe, it, expect } from 'vitest';

describe('currency utils', () => {
  it('should format kobo to NGN string', async () => {
    const { formatNGN } = await import('@/lib/utils/currency');
    const result = formatNGN(150000n);
    expect(result).toContain('1,500');
  });
});
