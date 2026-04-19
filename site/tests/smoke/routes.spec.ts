import { test, expect } from '@playwright/test';

const routes = [
  { path: '/',              expectText: 'CommonGround' },
  { path: '/manifesto',     expectText: 'We believe' },
  { path: '/constitution',  expectText: 'Constitution' },
  { path: '/covenant',      expectText: 'Covenant' },
  { path: '/protocol',      expectText: 'Protocol' },
  { path: '/overview',      expectText: 'Integral Commons OS' },
  { path: '/docs',          expectText: 'All source documents' },
  { path: '/docs/manifesto',expectText: 'We believe' },
];

for (const r of routes) {
  test(`route ${r.path} returns 200 and renders expected text`, async ({ page }) => {
    const resp = await page.goto(r.path);
    expect(resp?.status(), `status for ${r.path}`).toBe(200);
    await expect(page.locator('body')).toContainText(r.expectText);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.waitForLoadState('networkidle');
    expect(errors, `console errors on ${r.path}`).toEqual([]);
  });
}
