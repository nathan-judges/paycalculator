import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { setupDeterministicPage } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function assertA11y(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );
  const warnings = results.violations.filter(
    (violation) => violation.impact === 'moderate' || violation.impact === 'minor',
  );

  for (const violation of warnings) {
    console.warn(`[a11y-warning] ${violation.id}: ${violation.description}`);
  }

  expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
}

test.describe('a11y checks', () => {
  test('main page has no serious/critical violations', async ({ page, baseURL }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.goto('/');
    await assertA11y(page);
  });

  test('comparison mode has no serious/critical violations', async ({ page, baseURL }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.goto('/');
    await page.getByTestId('salary-input').click();
    await page.keyboard.press('Meta+A');
    await page.keyboard.type('95000');
    await page.getByTestId('compare-cta').click();
    await assertA11y(page);
  });

  test('expanded card has no serious/critical violations', async ({ page, baseURL }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.goto('/');
    await page.getByLabel('Edit').click();
    await assertA11y(page);
  });

  test('keyboard flow traverses critical actions without trap', async ({ page, baseURL }) => {
    await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
    await page.goto('/');

    const focusTrail: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const active = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (!element) {
          return 'none';
        }
        return element.getAttribute('data-testid') ?? element.getAttribute('aria-label') ?? element.tagName;
      });
      focusTrail.push(active);
    }

    expect(focusTrail.some((item) => item === 'share-link')).toBe(true);
    expect(focusTrail.some((item) => item === 'export-csv')).toBe(true);
    expect(new Set(focusTrail).size).toBeGreaterThan(4);
  });
});
