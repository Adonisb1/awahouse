import { describe, it, expect } from 'vitest';

describe('Auth - smoke', () => {
  it('auth router should be importable', async () => {
    const mod = await import('@/server/routers/auth');
    expect(mod.authRouter).toBeDefined();
  });

  it('auth schemas should validate correct phone', async () => {
    const { sendOtpInput } = await import('@/server/schemas/auth');
    const result = sendOtpInput.safeParse({
      phone: '+2348012345678',
      role: 'tenant',
    });
    expect(result.success).toBe(true);
  });

  it('auth schemas should reject invalid phone', async () => {
    const { sendOtpInput } = await import('@/server/schemas/auth');
    const result = sendOtpInput.safeParse({
      phone: '08012345678',
      role: 'tenant',
    });
    expect(result.success).toBe(false);
  });

  it('OTP module should generate and verify codes', async () => {
    const { createOtp, verifyOtp } = await import('@/lib/auth/otp');
    const phone = '+2348012345678';
    const code = createOtp(phone);
    expect(code).toHaveLength(6);
    expect(verifyOtp(phone, code)).toBe(true);
    expect(verifyOtp(phone, code)).toBe(false);
  });
});
