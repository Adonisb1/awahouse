import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;

type OtpRecord = {
  code: string;
  attempts: number;
  expiresAt: number;
};

const inMemoryStore = new Map<string, OtpRecord>();

function generateCode(): string {
  const digits = crypto.randomInt(0, 1000000).toString().padStart(OTP_LENGTH, '0');
  return digits;
}

export function createOtp(identifier: string): string {
  const code = generateCode();
  inMemoryStore.set(identifier, {
    code,
    attempts: 0,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return code;
}

export function verifyOtp(identifier: string, code: string): boolean {
  const record = inMemoryStore.get(identifier);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    inMemoryStore.delete(identifier);
    return false;
  }
  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    inMemoryStore.delete(identifier);
    return false;
  }
  if (record.code !== code) return false;
  inMemoryStore.delete(identifier);
  return true;
}

export function canRequestOtp(identifier: string): boolean {
  const record = inMemoryStore.get(identifier);
  if (!record) return true;
  if (Date.now() > record.expiresAt) {
    inMemoryStore.delete(identifier);
    return true;
  }
  return record.attempts < MAX_ATTEMPTS;
}

export function clearExpiredOtps(): void {
  const now = Date.now();
  for (const [key, record] of inMemoryStore) {
    if (now > record.expiresAt) {
      inMemoryStore.delete(key);
    }
  }
}
