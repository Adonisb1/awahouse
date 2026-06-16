import { test, expect } from '@playwright/test';

test.describe('Admin dashboard', () => {
  test('admin dashboard shows stats cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Escrows')).toBeVisible();
    await expect(page.locator('text=Completed').first()).toBeVisible();
    await expect(page.locator('text=Pending Verifications').first()).toBeVisible();
    await expect(page.locator('text=Revenue')).toBeVisible();
  });

  test('admin dashboard shows verification queue', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Pending Verifications').first()).toBeVisible();
    await expect(page.locator('text=Tunde Balogun')).toBeVisible();
    await expect(page.locator('text=Chioma Eze')).toBeVisible();
  });

  test('admin dashboard has tab navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disputes' })).toBeVisible();
  });
});
