import { test, expect } from '@playwright/test';

test.describe('Ask Awa AI assistant', () => {
  test('chat interface is visible', async ({ page }) => {
    await page.goto('/ask-awa');
    await expect(page.locator('text=Ask Awa')).toBeVisible();
    await expect(page.locator('text=Your AI property assistant')).toBeVisible();
  });

  test('shows welcome message', async ({ page }) => {
    await page.goto('/ask-awa');
    await expect(page.locator('text=your Awahouse AI assistant')).toBeVisible();
  });

  test('can type and send a message', async ({ page }) => {
    await page.goto('/ask-awa');
    await page.fill('input[placeholder="Ask Awa anything about Awahouse..."]', 'Hello Awa');
    await page.click('text=Send');
    await expect(page.locator('text=Hello Awa')).toBeVisible();
    await expect(page.locator('text=placeholder response')).toBeVisible({ timeout: 3000 });
  });
});
