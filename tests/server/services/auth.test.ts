import { describe, it, expect } from 'vitest';

describe('Auth - smoke', () => {
  it('auth router should be importable', async () => {
    const mod = await import('@/server/routers/auth');
    expect(mod.authRouter).toBeDefined();
  });

  it('auth schemas should validate correct email', async () => {
    const { sendOtpInput } = await import('@/server/schemas/auth');
    const result = sendOtpInput.safeParse({
      email: 'user@example.com',
      role: 'tenant',
    });
    expect(result.success).toBe(true);
  });

  it('auth schemas should reject invalid email', async () => {
    const { sendOtpInput } = await import('@/server/schemas/auth');
    const result = sendOtpInput.safeParse({
      email: 'not-an-email',
      role: 'tenant',
    });
    expect(result.success).toBe(false);
  });

  it('OTP module should generate and verify codes', async () => {
    const { createOtp, verifyOtp } = await import('@/lib/auth/otp');
    const email = 'user@example.com';
    const code = createOtp(email);
    expect(code).toHaveLength(6);
    expect(verifyOtp(email, code)).toBe(true);
    expect(verifyOtp(email, code)).toBe(false);
  });
});
