import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  test('renders login form with party ID input', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Canton Party ID')).toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows register link', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /register/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('register page renders all fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Party ID')).toBeVisible();
    await expect(page.getByText('Display Name')).toBeVisible();
    await expect(page.getByText('Organization')).toBeVisible();
  });
});

test.describe('Auth redirect', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});
