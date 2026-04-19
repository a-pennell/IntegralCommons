import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/manifesto', '/constitution', '/protocol', '/overview', '/docs'];

for (const path of routes) {
  test(`a11y scan: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    // We allow minor violations but fail on any "serious" or "critical" impact.
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      serious,
      `serious/critical a11y violations on ${path}: ${serious.map((v) => v.id).join(', ')}`,
    ).toEqual([]);
  });
}

test('/ has exactly one h1', async ({ page }) => {
  await page.goto('/');
  const h1s = page.locator('h1');
  await expect(h1s).toHaveCount(1);
});

test('/manifesto has exactly one h1', async ({ page }) => {
  await page.goto('/manifesto');
  const h1s = page.locator('h1');
  await expect(h1s).toHaveCount(1);
});

test('/ skip link is first focusable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const active = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(active).toBe('Skip to main content');
});
