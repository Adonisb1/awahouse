import { describe, it, expect } from 'vitest';
import { calculateFees } from '@/server/services/EscrowService';

describe('Escrow schemas', () => {
  it('should validate initiate escrow input', async () => {
    const { initiateEscrowInput } = await import('@/server/schemas/escrow');
    const result = initiateEscrowInput.safeParse({
      propertyId: '00000000-0000-0000-0000-000000000001',
      amountKobo: 250000000n,
      rentMonthly: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', async () => {
    const { initiateEscrowInput } = await import('@/server/schemas/escrow');
    const result = initiateEscrowInput.safeParse({
      propertyId: '00000000-0000-0000-0000-000000000001',
      amountKobo: -100n,
    });
    expect(result.success).toBe(false);
  });

  it('should validate dispute reason length', async () => {
    const { raiseDisputeInput } = await import('@/server/schemas/escrow');
    const result = raiseDisputeInput.safeParse({
      escrowId: '00000000-0000-0000-0000-000000000001',
      reason: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('EscrowService class should be exported', async () => {
    const mod = await import('@/server/services/EscrowService');
    expect(mod.EscrowService).toBeDefined();
    expect(mod.escrowService).toBeDefined();
  });
});

describe('Escrow fee calculation', () => {
  it('should enforce minimum fee of ₦5,000', () => {
    const { platformFeeKobo, landlordPayoutKobo } = calculateFees(10000000n); // ₦100,000 in kobo
    // 1.5% = 150,000 kobo, but minimum is 500,000 kobo
    expect(platformFeeKobo).toBe(500000n);
    expect(landlordPayoutKobo).toBe(9500000n);
  });

  it('should calculate 1.5% when above minimum', () => {
    const { platformFeeKobo, landlordPayoutKobo } = calculateFees(5000000000n); // ₦50,000,000 in kobo
    // 1.5% = 75,000,000 kobo
    expect(platformFeeKobo).toBe(75000000n);
    expect(landlordPayoutKobo).toBe(4925000000n);
  });

  it('should handle amounts below minimum fee', () => {
    const { platformFeeKobo } = calculateFees(100000n); // ₦1,000 in kobo
    expect(platformFeeKobo).toBe(500000n); // minimum ₦5,000
  });
});

describe('Admin schemas', () => {
  it('should validate verify property input', async () => {
    const { verifyPropertyInput } = await import('@/server/schemas/admin');
    const result = verifyPropertyInput.safeParse({
      propertyId: '00000000-0000-0000-0000-000000000001',
      badge: 'fully_verified',
    });
    expect(result.success).toBe(true);
  });

  it('admin router should be importable', async () => {
    const mod = await import('@/server/routers/admin');
    expect(mod.adminRouter).toBeDefined();
  });
});

describe('Notification schemas', () => {
  it('notification service should be importable', async () => {
    const mod = await import('@/server/services/NotificationService');
    expect(mod.NotificationService).toBeDefined();
    expect(mod.notificationService).toBeDefined();
  });

  it('Termii client should validate Nigerian phone numbers', async () => {
    const { termiiClient } = await import('@/lib/termii/client');
    const result = await termiiClient.sendSms('+2348012345678', 'Test message');
    expect(result.success).toBe(true);
  });

  it('Termii should reject invalid phone', async () => {
    const { termiiClient } = await import('@/lib/termii/client');
    const result = await termiiClient.sendSms('+441234567890', 'Test message');
    expect(result.success).toBe(false);
  });
});

describe('Paystack signature validation', () => {
  it('should validate HMAC signature', async () => {
    const { validatePaystackSignature } = await import('@/lib/paystack/client');
    process.env.PAYSTACK_SECRET_KEY = 'test_secret';
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'test' } });
    const isValid = validatePaystackSignature(body, 'invalid_signature');
    expect(isValid).toBe(false);
  });
});
