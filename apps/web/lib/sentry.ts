const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function isSentryConfigured(): boolean {
  return !!sentryDsn;
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (isSentryConfigured()) {
    try {
      const Sentry = require('@sentry/nextjs');
      Sentry.captureException(error, { extra: context });
    } catch {
      // Sentry not available
    }
  }
}
