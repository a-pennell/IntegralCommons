import { test, expect } from '@playwright/test';

/**
 * US4 — Member adds a Perspective with a taxonomy tag.
 *
 * Independent Test (spec §US4):
 *   A member can add a Perspective to an Issue, manually select its taxonomy
 *   type, optionally set the experience flag, and have it appear as a
 *   first-class object on the Issue (not a threaded reply).
 *
 * Skipped unless RUN_E2E=true — requires Docker Compose + seeded Postgres +
 * live Next.js server. Covered by the CI workflow.
 */

const RUN = process.env.RUN_E2E === 'true';

test.describe('US4 — add perspective', () => {
  test.skip(!RUN, 'set RUN_E2E=true to run against a live server');

  test('submits a Perspective and sees it render on the Issue detail page', async ({ page }) => {
    // Preconditions: a session cookie is installed for a member of the seeded
    // "Neighborhood Cooperative" Space, and at least one Issue exists. The
    // E2E harness seeds both.

    await page.goto('/spaces');
    await page.getByRole('link', { name: /Neighborhood Cooperative/ }).click();
    await page.getByRole('link', { name: 'Issues' }).click();

    // Pick the seeded Issue.
    const firstIssue = page.locator('ul li a').first();
    await expect(firstIssue).toBeVisible();
    await firstIssue.click();

    // Add a Perspective.
    await page.getByRole('link', { name: '+ Add a Perspective' }).click();
    await page.getByLabel('values').check();
    await page.getByLabel(/Your perspective/).fill('I speak from direct experience with this.');
    await page.getByLabel(/direct experience/).check();
    await page.getByRole('button', { name: 'Post Perspective' }).click();

    // Back on the Issue detail page, the Perspective is visible as a
    // first-class element (not a threaded reply).
    await expect(page.getByText('I speak from direct experience with this.')).toBeVisible();
    await expect(page.getByText('direct experience').first()).toBeVisible();

    // The reply link is offered on top-level Perspectives.
    const replyLink = page.getByRole('link', { name: 'Reply' }).first();
    await expect(replyLink).toBeVisible();

    // Once we follow the reply link, the resulting child Perspective does NOT
    // get a further reply link (one-level nesting — FR-021).
    await replyLink.click();
    await page.getByLabel('values').check();
    await page.getByLabel(/Your perspective/).fill('Reply to the above.');
    await page.getByRole('button', { name: 'Post Perspective' }).click();

    // The reply is visible, but no Reply link under it.
    await expect(page.getByText('Reply to the above.')).toBeVisible();
    const replyLinkCount = await page.getByRole('link', { name: 'Reply' }).count();
    // Only the original top-level Perspective still offers a Reply link.
    expect(replyLinkCount).toBe(1);
  });
});
