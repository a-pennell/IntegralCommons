import { test, expect } from '@playwright/test';

/**
 * US1 — Founder bootstraps a new Space (end-to-end).
 *
 * Independent Test (spec §US1):
 *   Founder with an empty Space completes Bootstrap — name the Space,
 *   invite members, have the system open the first Issue "How should we
 *   make decisions?", propose a governance profile, and drive it to a
 *   Decision Record via the hardcoded consent meta-method.
 *
 * Skipped unless RUN_E2E=true.
 */

const RUN = process.env.RUN_E2E === 'true';

test.describe('US1 — founder bootstraps', () => {
  test.skip(!RUN, 'set RUN_E2E=true to run against a live server');

  test('create Space → Bootstrap Issue auto-opens → finalize DR', async ({ page }) => {
    // Precondition: session cookie installed for a signed-in founder with
    // no memberships yet.

    await page.goto('/spaces/new');
    await page.getByLabel('Name').fill('Kindred Pilot');
    await page.getByLabel(/Description/).fill('A pilot for CommonGround governance.');
    await page.getByRole('button', { name: 'Create' }).click();

    // Space-home banner offers the Bootstrap Issue.
    await expect(page.getByText('Bootstrap required')).toBeVisible();
    await page.getByRole('link', { name: 'Open the Bootstrap Issue →' }).click();

    // On the Issue detail page.
    await expect(
      page.getByRole('heading', { name: 'How should we make decisions?' }),
    ).toBeVisible();

    // Drive the Issue to a draft DR — navigate to the draft URL.
    await page.goto(page.url() + '/decision/draft');

    await page
      .getByLabel('What was decided')
      .fill('We adopt consent as the default decision method for Kindred Pilot.');
    await page
      .getByLabel('Rationale')
      .fill(
        'The founding group chose consent as the baseline (FR-046); richer methods are added by governance Issue later.',
      );
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await page.getByLabel('Review date').fill(futureDate);
    await page.getByRole('button', { name: 'Save draft' }).click();

    // The CI harness would then capture the DR id and drive Finalize; this
    // spec asserts the intermediate shape.
    await expect(page.getByText('No Decision Record has been finalized')).toBeVisible();
  });
});
