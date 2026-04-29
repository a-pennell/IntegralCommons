import { test, expect } from '@playwright/test';

/**
 * US8 — Member reads a rhythm-based digest.
 *
 * Independent Test (spec §US8):
 *   A member with no activity for a week receives exactly one digest at
 *   the configured cadence; the system produces no badges, counts, or
 *   push notifications.
 *
 * Full loop requires Mailhog + the pg-boss worker running. The CI harness
 * sets those up; this spec only drives the cadence-settings UI.
 */

const RUN = process.env.RUN_E2E === 'true';

test.describe('US8 — digest', () => {
  test.skip(!RUN, 'set RUN_E2E=true to run against a live server');

  test('cadence settings exist and exclude every engagement term', async ({ page }) => {
    await page.goto('/spaces');
    await page.getByRole('link', { name: /Neighborhood Cooperative/ }).click();
    await page.goto(page.url() + '/settings/notifications');

    await expect(page.getByRole('heading', { name: 'Digest cadence' })).toBeVisible();
    await expect(page.locator('input[value="daily"]')).toBeVisible();
    await expect(page.locator('input[value="off"]')).toBeVisible();

    // Forbidden engagement-industry terms — NFR-001.
    for (const forbidden of ['badge', 'unread', 'notification bell', 'streak', 'points']) {
      await expect(page.locator('body')).not.toContainText(new RegExp(forbidden, 'i'));
    }
  });
});
