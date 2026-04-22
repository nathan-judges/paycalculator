import type { Page, Request } from '@playwright/test';

const FIXED_NOW_ISO = '2025-04-01T12:00:00.000Z';

function isAllowedRequest(request: Request, appOrigin: string): boolean {
  const url = new URL(request.url());
  if (url.origin === appOrigin) {
    return true;
  }
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '::1'
  ) {
    return true;
  }
  return false;
}

export async function setupDeterministicPage(
  page: Page,
  baseURL: string,
): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript((isoNow: string) => {
    const fixedNow = new Date(isoNow).valueOf();
    const RealDate = Date;

    const MockDate = function (...args: unknown[]) {
      if (args.length === 0) {
        return new RealDate(fixedNow);
      }
      return new RealDate(args[0] as string | number | Date);
    } as unknown as DateConstructor;
    MockDate.now = () => fixedNow;
    MockDate.parse = RealDate.parse;
    MockDate.UTC = RealDate.UTC;

    // Freeze Date across all client-side rendering in tests.
    Object.defineProperty(window, 'Date', {
      configurable: true,
      writable: true,
      value: MockDate,
    });
  }, FIXED_NOW_ISO);

  await page.route('**/*', async (route) => {
    if (isAllowedRequest(route.request(), baseURL)) {
      await route.continue();
      return;
    }
    await route.abort();
  });
}
