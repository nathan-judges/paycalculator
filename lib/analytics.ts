type AnalyticsProperties = Record<string, unknown>;

export interface AnalyticsEvent {
  event: string;
  properties?: AnalyticsProperties;
  timestamp: string;
}

const STORAGE_KEY = 'analytics-events';
const OPTOUT_KEY = 'analytics-opt-out';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function shouldSendInProduction(): boolean {
  if (typeof navigator === 'undefined' || !canUseStorage()) {
    return false;
  }

  if (navigator.doNotTrack === '1') {
    return false;
  }

  return localStorage.getItem(OPTOUT_KEY) !== 'true';
}

function readEvents(): AnalyticsEvent[] {
  if (!canUseStorage()) {
    return [];
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is AnalyticsEvent => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'event' in item &&
        typeof item.event === 'string' &&
        'timestamp' in item &&
        typeof item.timestamp === 'string'
      );
    });
  } catch {
    return [];
  }
}

function persistEvent(event: AnalyticsEvent): void {
  if (!canUseStorage()) {
    return;
  }
  const events = readEvents();
  events.push(event);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function track(event: string, properties?: AnalyticsProperties): void {
  const payload: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  persistEvent(payload);

  if (!isProduction()) {
    // eslint-disable-next-line no-console
    console.info('[analytics]', payload);
    return;
  }

  if (!shouldSendInProduction()) {
    return;
  }

  // Keep production payload local-only unless a first-party endpoint is added.
  // This avoids shipping PII or leaking network traffic during development/tests.
}

export function exportLocalAnalytics(): AnalyticsEvent[] {
  return readEvents();
}
