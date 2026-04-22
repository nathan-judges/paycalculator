import { test, expect } from '@playwright/test';
import { setupDeterministicPage } from './helpers';

const HARD_FAIL_TEST_IDS = ['compare-cta', 'share-link', 'export-csv'];

test('touch targets meet minimum size requirements', async ({ page, baseURL }) => {
  await setupDeterministicPage(page, baseURL ?? 'http://localhost:3000');
  await page.goto('/');

  const hardSelectors = [
    '[data-touch-target="true"]',
    ...HARD_FAIL_TEST_IDS.map((id) => `[data-testid="${id}"]`),
  ];

  const hardElements = page.locator(hardSelectors.join(','));
  const hardCount = await hardElements.count();
  for (let index = 0; index < hardCount; index += 1) {
    const box = await hardElements.nth(index).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  const allInteractive = page.locator(
    'button, [role="button"], a[role="button"], [role="tab"], input, select, textarea',
  );
  const interactiveCount = await allInteractive.count();

  for (let index = 0; index < interactiveCount; index += 1) {
    const element = allInteractive.nth(index);
    const testId = await element.getAttribute('data-testid');
    const isHardFail = !!testId && HARD_FAIL_TEST_IDS.includes(testId);
    if (isHardFail) {
      continue;
    }

    const box = await element.boundingBox();
    if (!box) {
      continue;
    }
    // eslint-disable-next-line no-console
    console.warn(
      `[touch-target-warning] testId=${testId ?? 'none'} size=${Math.round(box.width)}x${Math.round(box.height)}`,
    );
  }
});
