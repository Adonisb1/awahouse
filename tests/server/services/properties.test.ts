import { describe, it, expect } from 'vitest';

describe('Property schemas', () => {
  it('should validate correct create input', async () => {
    const { createPropertyInput } = await import('@/server/schemas/properties');
    const result = createPropertyInput.safeParse({
      title: 'Modern 3-Bedroom Apartment in Ikeja',
      type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      priceKobo: 250000000n,
    });
    expect(result.success).toBe(true);
  });

  it('should reject too-short title', async () => {
    const { createPropertyInput } = await import('@/server/schemas/properties');
    const result = createPropertyInput.safeParse({
      title: 'Abc',
      type: 'apartment',
      priceKobo: 1000000n,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('title'))).toBe(true);
    }
  });

  it('should validate search input with all filters', async () => {
    const { propertySearchInput } = await import('@/server/schemas/properties');
    const result = propertySearchInput.safeParse({
      lga: 'Ikeja',
      type: 'apartment',
      minPriceKobo: 1000000n,
      maxPriceKobo: 5000000n,
      bedrooms: 2,
      page: 1,
      limit: 20,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid lga', async () => {
    const { propertySearchInput } = await import('@/server/schemas/properties');
    const result = propertySearchInput.safeParse({ lga: 'InvalidLGA' });
    expect(result.success).toBe(false);
  });

  it('PropertyService class should be exported', async () => {
    const mod = await import('@/server/services/PropertyService');
    expect(mod.PropertyService).toBeDefined();
    expect(mod.propertyService).toBeDefined();
  });
});
