const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function isPostHogConfigured(): boolean {
  return !!(posthogKey && posthogHost);
}

export function captureEvent(name: string, properties?: Record<string, unknown>) {
  if (isPostHogConfigured()) {
    try {
      const posthog = require('posthog-js');
      posthog.capture(name, properties);
    } catch {
      // PostHog not available
    }
  }
}
