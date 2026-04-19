import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

// Belt-and-braces: Playwright 1.59 has an issue where `test.use({ reducedMotion })`
// at file scope doesn't always propagate to the browser context on first navigation.
// `page.emulateMedia` guarantees the emulation is active before we load the page.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('premise lines are fully visible under reduced-motion', async ({ page }) => {
  await page.goto('/');
  const lines = page.locator('[data-premise-line]');
  await expect(lines).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const opacity = await lines.nth(i).evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThanOrEqual(0.99);
  }
});

test('layer rows are fully visible under reduced-motion', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-scene="layers"]').scrollIntoViewIfNeeded();
  const rows = page.locator('[data-scene="layers"] [data-layer-id]');
  await expect(rows).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    const opacity = await rows.nth(i).evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThanOrEqual(0.99);
  }
});
