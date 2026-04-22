import * as Sentry from '@sentry/nextjs';

export function initSentry(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  Sentry.init({
    enabled: true,
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}
