import { test, expect } from '@playwright/test';

test.describe('Explore & property detail', () => {
  test('explore page shows search filters and property cards', async ({ page }) => {
    await page.goto('/explore');
    await expect(page.locator('text=Find your home')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    await expect(page.locator('text=Modern 3-Bedroom Apartment').first()).toBeVisible();
  });

  test('property detail page shows specs and reviews', async ({ page }) => {
    await page.goto('/property/1');
    await expect(page.locator('text=Modern 3-Bedroom Apartment in Ikeja')).toBeVisible();
    await expect(page.locator('text=3 Bedrooms')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
  });

  test('property detail shows property type badge', async ({ page }) => {
    await page.goto('/property/1');
    await expect(page.getByText('apartment', { exact: true })).toBeVisible();
  });
});
