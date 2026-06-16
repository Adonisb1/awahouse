import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('splash screen navigates to role selection', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Awa')).toBeVisible();
    await page.waitForURL('/role', { timeout: 5000 });
  });

  test('role selection shows three options', async ({ page }) => {
    await page.goto('/role');
    await expect(page.locator('text=Looking for a home')).toBeVisible();
    await expect(page.locator('text=I own property')).toBeVisible();
    await expect(page.locator("text=I'm an agent")).toBeVisible();
  });

  test('login page accepts email address', async ({ page }) => {
    await page.goto('/login?role=tenant');
    await expect(page.locator('text=Get started')).toBeVisible();
    await page.fill('input[type="email"]', 'user@example.com');
    await page.click('text=Send code');
    await expect(page.locator('text=Enter code')).toBeVisible();
  });

  test('verify NIN page validates input', async ({ page }) => {
    await page.goto('/verify-nin');
    await expect(page.locator('text=Verify your NIN')).toBeVisible();
    await page.fill('input[placeholder="12345678901"]', '12345678901');
    await page.click('text=Verify NIN');
    await expect(page.locator('text=Under review')).toBeVisible({ timeout: 5000 });
  });
});
