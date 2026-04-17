import { test, expect } from '@playwright/test';

test.describe('SpectaSyncAI E2E Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should render the main dashboard with stat cards', async ({ page }) => {
    await expect(page.getByText('SpectaSyncAI')).toBeVisible();
    await expect(page.getByText('Active Surge Zones')).toBeVisible();
    await expect(page.getByText('System Status')).toBeVisible();
  });

  test('should navigate to Tactical View and interact with heatmap', async ({ page }) => {
    await page.click('text=Tactical View');
    await expect(page.getByText('Venue Mesh Heatmap')).toBeVisible();
    
    // Click a zone cell (mocked by its class)
    const zone = page.locator('.zone-cell').first();
    await zone.click();
    await expect(page.getByText('Recommended Staff Shift:')).toBeVisible();
  });

  test('should navigate to Crisis Mesh and expand agent details', async ({ page }) => {
    await page.click('text=Crisis Mesh');
    await expect(page.getByText('Perimeter Macro Agent')).toBeVisible();
    
    await page.click('text=Perimeter Macro Agent');
    await expect(page.getByText('Last Intervention:')).toBeVisible();
  });

  test('should handle language switching in Tactical View', async ({ page }) => {
    await page.click('text=Tactical View');
    const select = page.locator('select');
    await select.selectOption('JA');
    await expect(page.getByText('マルチモーダル・インテリジェンス')).toBeVisible();
  });
});
