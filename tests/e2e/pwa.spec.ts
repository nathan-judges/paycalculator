import { test, expect } from '@playwright/test';
import { setupDeterministicPage } from './helpers';

test('manifest is served and includes required fields', async ({
  request,
  baseURL,
}) => {
  const response = await request.get(`${baseURL}/manifest.json`);
  expect(response.ok()).toBe(true);
  const contentType = response.headers()['content-type'] ?? '';
  expect(
    contentType.includes('application/manifest+json') ||
      contentType.includes('application/json'),
  ).toBe(true);

  const manifest = (await response.json()) as Record<string, unknown>;
  expect(manifest.name).toBeTruthy();
  expect(manifest.short_name).toBeTruthy();
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.display).toBeTruthy();
  expect(Array.isArray(manifest.icons)).toBe(true);
});

test('offline shell remains available after service worker registration', async ({
  page,
  baseURL,
}) => {
  await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
  await page.goto('/');

  await expect
    .poll(
      async () => {
        const workerCount = (await page.context().serviceWorkers()).length;
        const hasRegistration = await page.evaluate(async () => {
          if (!('serviceWorker' in navigator)) {
            return false;
          }
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration?.active;
        });
        return workerCount > 0 || hasRegistration;
      },
      { timeout: 10_000 },
    )
    .toBeTruthy();

  await page.context().setOffline(true);
  await page.reload();

  const comparison = page.getByTestId('comparison-grid');
  const fallback = page.getByRole('main');
  const comparisonCount = await comparison.count();
  if (comparisonCount > 0) {
    await expect(comparison).toBeVisible();
  } else {
    await expect(fallback).toBeVisible();
  }
});
