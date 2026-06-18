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

  it('signInWithGoogleInput schema should validate correct inputs', async () => {
    const { signInWithGoogleInput } = await import('@/server/schemas/auth');
    const result1 = signInWithGoogleInput.safeParse({
      accessToken: 'valid-access-token',
      role: 'tenant',
    });
    expect(result1.success).toBe(true);

    const result2 = signInWithGoogleInput.safeParse({
      idToken: 'valid-id-token',
      role: 'admin',
    });
    expect(result2.success).toBe(true);

    const result3 = signInWithGoogleInput.safeParse({
      role: 'agent',
    });
    expect(result3.success).toBe(true); // accessToken & idToken are optional individually
  });
});
