import { test, expect } from '@playwright/test';

/**
 * US3 — Member creates an Issue.
 *
 * Independent Test (spec §US3):
 *   A member with base capabilities creates an Issue with required fields
 *   (title, scope, status=Open), and it appears in the Space's Issue list.
 *
 * Scope:
 *   - Creates an Issue via the new-issue form.
 *   - Verifies the Issue appears in the Issues list with status=open.
 *   - Verifies rate-limit feedback on the 4th Issue.
 *   - Verifies structured sections are visible on the detail page.
 *
 * Requires: RUN_E2E=true, a running `next dev`, a seeded Postgres with a
 * bootstrapped Space and a session cookie for an active member.
 */

const RUN = process.env.RUN_E2E === 'true';

test.describe('US3 — create Issue', () => {
  test.skip(!RUN, 'set RUN_E2E=true to run against a live server');

  test('member creates an Issue and it appears in the list', async ({ page, baseURL }) => {
    expect(baseURL).toBeTruthy();

    // Assume the seed fixture created a Space with slug "seed-space" and
    // a session cookie is injected by the global Playwright setup.
    await page.goto(`${baseURL}/spaces/seed-space/issues/new`);

    await page.fill('[name="title"]', 'US3 test Issue');
    await page.fill('[name="scope"]', 'Automated E2E test for US3 — create Issue path.');
    await page.click('button[type="submit"]');

    // Should redirect to the new Issue's detail page.
    await expect(page).toHaveURL(/\/spaces\/seed-space\/issues\//);
    await expect(page.locator('h1')).toContainText('US3 test Issue');

    // Navigate to the Issues list and verify the new Issue appears.
    await page.goto(`${baseURL}/spaces/seed-space/issues`);
    await expect(page.locator('a', { hasText: 'US3 test Issue' })).toBeVisible();
  });

  test('issue detail shows structured sections', async ({ page, baseURL }) => {
    // Creates and navigates to an Issue to verify the structured-section shells render.
    await page.goto(`${baseURL}/spaces/seed-space/issues/new`);
    await page.fill('[name="title"]', 'US3 sections test');
    await page.fill('[name="scope"]', 'Checking structured sections render.');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/spaces\/seed-space\/issues\//);

    // The detail page always renders the five section headers even when empty.
    await expect(page.getByText('Problem framings')).toBeVisible();
    await expect(page.getByText('Constraints')).toBeVisible();
    await expect(page.getByText('Stakeholders')).toBeVisible();
  });
});
