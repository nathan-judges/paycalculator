import { test, expect, devices } from '@playwright/test';
import { setupDeterministicPage } from './helpers';

const mobileDevices = [
  { name: 'iPhone 12', preset: devices['iPhone 12'] },
  { name: 'Pixel 5', preset: devices['Pixel 5'] },
];

test.describe('Responsive layout', () => {
  for (const device of mobileDevices) {
    test(`mobile card switching on ${device.name}`, async ({ page, baseURL }) => {
      await page.setViewportSize(device.preset.viewport);
      await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
      await page.goto('/');
      await page.getByTestId('salary-input').click();
      await page.keyboard.press('Meta+A');
      await page.keyboard.type('95000');
      await expect(page.getByTestId('compare-cta')).toBeEnabled();
      await page.getByTestId('compare-cta').click();

      await expect(page.getByTestId('tab-s1')).toBeVisible();
      await expect(page.getByTestId('tab-s2')).toBeVisible();

      await expect(page.getByTestId('scenario-card-s1')).toBeVisible();
      await expect(page.getByTestId('scenario-card-s2')).toBeHidden();

      await page.getByTestId('tab-s2').click();
      await expect(page.getByTestId('scenario-card-s2')).toBeVisible();
      await expect(page.getByTestId('scenario-card-s1')).toBeHidden();
    });
  }

  test('desktop shows both cards side-by-side and footer does not overlap', async ({
    page,
    baseURL,
  }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.getByTestId('salary-input').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.type('95000');
    await expect(page.getByTestId('compare-cta')).toBeEnabled();
    await page.getByTestId('compare-cta').click();

    await expect(page.getByTestId('scenario-card-s1')).toBeVisible();
    await expect(page.getByTestId('scenario-card-s2')).toBeVisible();

    const cardBottom = await page.getByTestId('comparison-grid').evaluate((node) => {
      return node.getBoundingClientRect().bottom;
    });
    const footerTop = await page.getByTestId('sticky-footer').evaluate((node) => {
      return node.getBoundingClientRect().top;
    });

    expect(footerTop).toBeGreaterThan(cardBottom);
  });

  test('iPad viewport uses desktop two-card layout', async ({ page, baseURL }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.setViewportSize(devices['iPad (gen 7)'].viewport);
    await page.goto('/');
    await page.getByTestId('salary-input').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.type('95000');
    await expect(page.getByTestId('compare-cta')).toBeEnabled();
    await page.getByTestId('compare-cta').click();

    await expect(page.getByTestId('scenario-card-s1')).toBeVisible();
    await expect(page.getByTestId('scenario-card-s2')).toBeVisible();
    await expect(page.getByTestId('tab-s1')).toBeHidden();
  });
});
