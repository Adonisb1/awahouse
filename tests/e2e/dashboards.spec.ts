import { test, expect } from '@playwright/test';

test.describe('Landlord & agent dashboards', () => {
  test('landlord listings page shows properties', async ({ page }) => {
    await page.goto('/landlord/listings');
    await expect(page.locator('text=My Listings')).toBeVisible();
    await expect(page.locator('text=Manage your properties')).toBeVisible();
    await expect(page.locator('text=Modern 3-Bedroom Apartment')).toBeVisible();
    await expect(page.locator('text=Luxury 4-Bedroom Duplex')).toBeVisible();
  });

  test('landlord listings has new listing button', async ({ page }) => {
    await page.goto('/landlord/listings');
    await expect(page.locator('text=New listing')).toBeVisible();
  });

  test('landlord shows verification badges', async ({ page }) => {
    await page.goto('/landlord/listings');
    await expect(page.locator('text=Verified')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
  });

  test('agent listings page shows client properties', async ({ page }) => {
    await page.goto('/agent/listings');
    await expect(page.locator('text=Client Listings')).toBeVisible();
    await expect(page.locator('text=Cozy Studio in Surulere')).toBeVisible();
    await expect(page.locator('text=Agent Verified')).toBeVisible();
  });

  test('agent listings has new listing button', async ({ page }) => {
    await page.goto('/agent/listings');
    await expect(page.locator('text=New listing')).toBeVisible();
  });
});
