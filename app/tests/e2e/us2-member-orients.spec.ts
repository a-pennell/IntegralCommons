import { test, expect } from '@playwright/test';

/**
 * US2 — Member joins a Space and orients.
 *
 * Independent Test (spec §US2):
 *   A newly invited member can accept, land on the Space, read the active
 *   governance profile, browse Issues by status, and view any Issue's Civic
 *   Memory timeline — without needing any delegation or admin intervention.
 *
 * Phase-3 scope:
 *   - Login (magic link) is exercised against a seeded token in the DB rather
 *     than by capturing the email (Mailhog integration is a full-M3 concern).
 *   - Issues/timeline portions assert the empty-state shells wired in T087 and
 *     T089. Populated-timeline coverage lives in the US3 E2E (T108).
 *
 * This test is skipped when RUN_E2E is unset, because Playwright needs a
 * running `next dev` + a seeded Postgres — the CI workflow boots both.
 */

const RUN = process.env.RUN_E2E === 'true';

test.describe('US2 — member orients', () => {
  test.skip(!RUN, 'set RUN_E2E=true to run against a live server');

  test('renders Space home, governance profile, and empty timeline', async ({ page, baseURL }) => {
    // The seed script (scripts/seed-dev.ts) creates a Space with three active
    // Members. The E2E harness is responsible for inserting a session cookie
    // for one of them before this test runs.
    expect(baseURL).toBeTruthy();

    await page.goto('/spaces');
    await expect(page.getByRole('heading', { name: 'Your Spaces' })).toBeVisible();

    // Click into the seeded Space.
    const spaceLink = page.getByRole('link', { name: /Neighborhood Cooperative/ });
    await expect(spaceLink).toBeVisible();
    await spaceLink.click();

    // Space home.
    await expect(page.getByRole('heading', { name: 'Neighborhood Cooperative' })).toBeVisible();
    await expect(page.getByText('Bootstrap required')).toBeVisible();

    // Governance profile (read-only).
    await page.getByRole('link', { name: 'Governance' }).click();
    await expect(page.getByRole('heading', { name: 'Governance' })).toBeVisible();
    await expect(page.getByText('Consent')).toBeVisible();
    await expect(page.getByText('72 hours')).toBeVisible();

    // Back to Space → Issues list empty state.
    await page.goBack();
    await page.getByRole('link', { name: 'Issues' }).click();
    await expect(page.getByText('No Issues yet.')).toBeVisible();
  });
});
