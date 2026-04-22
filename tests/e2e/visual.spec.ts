import { test, expect } from '@playwright/test';
import { setupDeterministicPage } from './helpers';

test.describe('visual regression (nightly only)', () => {
  test.skip(process.env.CI_NIGHTLY !== '1', 'Visual regression runs in nightly CI only');

  test('home page screenshot', async ({ page, baseURL, browserName }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    await expect(page).toHaveScreenshot(`home-${browserName}.png`, {
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    });
  });
});
