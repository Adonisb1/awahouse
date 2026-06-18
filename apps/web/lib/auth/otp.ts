import crypto from 'crypto';
import { prisma } from '@awahouse/db';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 60 * 1000; // min 60s between new OTP requests

/** Always normalise email before any DB operation to prevent case-mismatch. */
function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, '0');
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/** Creates a new OTP for the given email, deleting any previous one. Returns the plaintext code. */
export async function createOtp(email: string): Promise<string> {
  const normEmail = normaliseEmail(email);
  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  console.log(`[OTP] createOtp called for ${normEmail} — DB-backed v2`);

  // Delete any previous OTP for this email then create fresh
  await prisma.otpCode.deleteMany({ where: { email: normEmail } });
  await prisma.otpCode.create({ data: { email: normEmail, codeHash, expiresAt } });

  return code;
}

/**
 * Verifies the code for the given email.
 * Returns true and deletes the record on success.
 * Returns false on wrong code, expiry, or too many attempts.
 */
export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const normEmail = normaliseEmail(email);

  const record = await prisma.otpCode.findFirst({
    where: { email: normEmail },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`[OTP] verifyOtp called for ${normEmail} — record found: ${!!record}`);

  if (!record) return false;

  if (record.expiresAt < new Date()) {
    console.log(`[OTP] expired for ${normEmail}`);
    await prisma.otpCode.deleteMany({ where: { email: normEmail } });
    return false;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    console.log(`[OTP] max attempts reached for ${normEmail}`);
    await prisma.otpCode.deleteMany({ where: { email: normEmail } });
    return false;
  }

  // Increment attempts before checking — prevents timing attacks
  await prisma.otpCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  if (record.codeHash !== hashCode(code)) {
    console.log(`[OTP] wrong code for ${normEmail}`);
    return false;
  }

  // Code is correct — clean up
  await prisma.otpCode.deleteMany({ where: { email: normEmail } });
  return true;
}

/**
 * Returns true if the user is allowed to request a new OTP.
 * Enforces a 60-second cooldown between requests.
 */
export async function canRequestOtp(email: string): Promise<boolean> {
  const normEmail = normaliseEmail(email);

  const record = await prisma.otpCode.findFirst({
    where: { email: normEmail },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return true;

  // If the previous OTP is expired, allow a new one
  if (record.expiresAt < new Date()) {
    await prisma.otpCode.deleteMany({ where: { email: normEmail } });
    return true;
  }

  // Enforce cooldown: must wait at least 60s before requesting again
  const elapsed = Date.now() - record.createdAt.getTime();
  return elapsed >= RATE_LIMIT_MS;
}

/** Deletes all expired OTP records — can be called as a periodic cleanup job. */
export async function clearExpiredOtps(): Promise<void> {
  await prisma.otpCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
