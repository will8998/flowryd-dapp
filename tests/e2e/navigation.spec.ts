import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

async function getAuthToken(): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'test-jwt-secret-32chars-minimum!!'
  );
  return new SignJWT({
    sub: 'test-user-id',
    partyId: 'texture::test',
    role: 'admin',
    orgId: 'test-org-id',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('flowryd')
    .sign(secret);
}

test.describe('Authenticated navigation', () => {
  test.beforeEach(async ({ context }) => {
    const token = await getAuthToken();
    await context.addCookies([
      {
        name: 'flowryd-access-token',
        value: token,
        domain: 'localhost',
        path: '/',
      },
    ]);
  });

  test('FlowsStudio renders with sidebar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Mission Control')).toBeVisible();
    await expect(page.getByText('Discover')).toBeVisible();
    await expect(page.getByText('Workbench')).toBeVisible();
    await expect(page.getByText('Deals')).toBeVisible();
  });

  test('sidebar navigation items are clickable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Mission Control')).toBeVisible();

    await page.getByRole('button', { name: /workbench/i }).click();
    await expect(page.getByText('Build Flow')).toBeVisible();

    await page.getByRole('button', { name: /deals/i }).click();
    await expect(page.getByText('Active Deals')).toBeVisible();
  });

  test('admin user sees Admin sidebar item', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /admin/i })).toBeVisible();
  });

  test('marketplace tab renders', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /marketplace/i }).click();
    await expect(page.getByText('Marketplace')).toBeVisible();
  });
});
