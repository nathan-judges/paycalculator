import { test, expect } from '@playwright/test';
import { setupDeterministicPage } from './helpers';

test.describe('Initial UX flow', () => {
  test('salary input drives compare workflow', async ({ page, baseURL }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.goto('/');

    await expect(page.getByTestId('salary-input')).toBeFocused();
    await expect(page.getByTestId('compare-cta')).toBeDisabled();

    await page.getByTestId('salary-input').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.type('85000');
    await expect(page.getByTestId('compare-cta')).toBeEnabled();

    await expect(page.getByTestId('net-pay').first()).not.toHaveText(/\$70,412/);

    await page.getByTestId('compare-cta').click();
    await expect(page.getByTestId('scenario-card-s2')).toBeVisible();
  });
});
