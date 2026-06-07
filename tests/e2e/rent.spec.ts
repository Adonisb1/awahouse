import { test, expect } from '@playwright/test';

test.describe('Rent & RentScore', () => {
  test('rent score dashboard shows score card', async ({ page }) => {
    await page.goto('/rent-score');
    await expect(page.locator('text=RentScore')).toBeVisible();
    await expect(page.locator('text=Current Score')).toBeVisible();
    await expect(page.locator('text=out of 850')).toBeVisible();
  });

  test('rent score shows score history', async ({ page }) => {
    await page.goto('/rent-score');
    await expect(page.locator('text=Score History')).toBeVisible();
    await expect(page.locator('text=On-Time Payment')).toBeVisible();
    await expect(page.locator('text=Escrow Completed')).toBeVisible();
  });

  test('instalment schedule shows monthly payments', async ({ page }) => {
    await page.goto('/rent-instalments');
    await expect(page.locator('text=Instalment Plan')).toBeVisible();
    await expect(page.locator('text=Monthly rent payment schedule')).toBeVisible();
    await expect(page.locator('text=₦208,333/mo')).toBeVisible();
  });

  test('instalment list shows pay button for unpaid items', async ({ page }) => {
    await page.goto('/rent-instalments');
    await expect(page.getByRole('button', { name: 'Pay Now' }).first()).toBeVisible();
    await expect(page.getByText('Paid', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Scheduled', { exact: true }).first()).toBeVisible();
  });
});
