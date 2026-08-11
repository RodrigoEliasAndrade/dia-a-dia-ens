import { expect, test } from '@playwright/test';

test('production build exposes an installable PWA shell', async ({ page }) => {
  await page.goto('/dia-a-dia-ens/');

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toContain('manifest.webmanifest');

  await expect.poll(async () => page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.getRegistration('/dia-a-dia-ens/');
    return Boolean(registration?.active || registration?.installing || registration?.waiting);
  }), { timeout: 15_000 }).toBe(true);
});
