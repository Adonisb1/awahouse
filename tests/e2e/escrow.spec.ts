import { test, expect } from '@playwright/test';

test.describe('Escrow flows', () => {
  test('escrow dashboard lists transactions', async ({ page }) => {
    await page.goto('/escrow');
    await expect(page.locator('text=My Escrows')).toBeVisible();
    await expect(page.locator('text=Modern 3-Bedroom Apartment')).toBeVisible();
    await expect(page.locator('text=Luxury 4-Bedroom Duplex')).toBeVisible();
  });

  test('escrow detail shows timeline and action buttons', async ({ page }) => {
    await page.goto('/escrow/1');
    await expect(page.locator('text=Transaction Timeline')).toBeVisible();
    await expect(page.locator('text=Payment Initiated')).toBeVisible();
    await expect(page.locator('text=Funds Held in Escrow')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm Handover' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Raise Dispute' })).toBeVisible();
  });

  test('escrow detail shows amount and landlord', async ({ page }) => {
    await page.goto('/escrow/1');
    await expect(page.locator('text=Chidi Okonkwo')).toBeVisible();
    await expect(page.locator('text=₦2,500,000')).toBeVisible();
  });

  test('admin dashboard shows open disputes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Open Disputes')).toBeVisible();
    await expect(page.locator('text=AWA-3F2A1B')).toBeVisible();
  });
});
