/**
 * App E2E Tests
 */

const { test, expect } = require('@playwright/test');

test.describe('PromtHubs App', () => {
    test('homepage should load correctly', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/PromtHubs/);

        // Check main elements exist
        await expect(page.locator('.brand-logo')).toBeVisible();
        await expect(page.locator('#promptInput')).toBeVisible();
        await expect(page.locator('#btnExport')).toBeVisible();
    });

    test('prompt input should work', async ({ page }) => {
        await page.goto('/');

        const promptInput = page.locator('#promptInput');
        await promptInput.fill('Test prompt text');

        // Check prompt text is displayed in preview
        await expect(page.locator('#promptText')).toContainText('Test prompt');
    });

    test('export button should exist', async ({ page }) => {
        await page.goto('/');

        const exportBtn = page.locator('#btnExport');
        await expect(exportBtn).toBeVisible();
        await expect(exportBtn).toContainText('PNG');
    });
});
