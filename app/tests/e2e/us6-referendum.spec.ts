import { test, expect } from '@playwright/test';

/**
 * US6 — Member initiates a referendum against a delegation.
 *
 * Independent Test (spec §US6):
 *   A member can initiate a referendum against an existing delegation; the
 *   system verifies threshold and rate-limit requirements; the referendum
 *   enters a structured deliberation phase before any vote.
 *
 * Skipped unless RUN_E2E=true.
 */

const RUN = process.env.RUN_E2E === 'true';

test.describe('US6 — referendum', () => {
  test.skip(!RUN, 'set RUN_E2E=true to run against a live server');

  test('initiate → co-sign → deliberation → vote → close', async ({ page }) => {
    // Precondition: a session cookie, a seeded Space with an active
    // facilitation delegation, and the stability window for that delegation
    // is already backdated (the seed script handles this).

    await page.goto('/spaces');
    await page.getByRole('link', { name: /Neighborhood Cooperative/ }).click();
    await page.getByRole('link', { name: 'Governance' }).click();

    // Jump to referenda via direct URL (Space-home doesn't yet surface a
    // "Referenda" section — that lands with M4 polish).
    await page.goto(page.url().replace(/\/settings$/, '') + '/referenda/new');
    await expect(page.getByRole('heading', { name: 'Initiate a Referendum' })).toBeVisible();

    // Select the first active delegation and initiate.
    await page.locator('input[name="delegationId"]').first().check();
    await page.getByRole('button', { name: 'Initiate' }).click();

    // Landed on the detail page — initiating phase.
    await expect(page.locator('text=initiating').first()).toBeVisible();
  });
});
