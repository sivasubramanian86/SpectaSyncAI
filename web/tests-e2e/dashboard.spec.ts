import { test, expect } from '@playwright/test';

test.describe('SpectaSyncAI E2E Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Vite default dev port
    await page.goto('http://localhost:5173/');
  });

  test('should render the main dashboard with stat cards', async ({ page }) => {
    await expect(page.getByText('SpectaSyncAI', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Avg Density')).toBeVisible();
    await expect(page.getByText('Active Agents')).toBeVisible();
  });

  test('should navigate to Tactical View and interact with heatmap', async ({ page }) => {
    // Navigate via tab button
    await page.getByRole('button', { name: 'Tactical View' }).click();
    
    // Check for correct heading in multi-modal hub
    await expect(page.getByRole('heading', { name: 'Multi-Modal Intelligence' })).toBeVisible();
    
    // Check for heatmap title
    await expect(page.getByText('Tactical Asset Grid')).toBeVisible();
    
    // Click a zone cell
    const zone = page.locator('.zone-cell').first();
    await zone.click();
    
    // Verification of selected zone telemetry
    await expect(page.getByText('Recommended Staff Shift:')).toBeVisible();
  });

  test('should navigate to Crisis Mesh and expand agent details', async ({ page }) => {
    // Navigate via tab button
    await page.getByRole('button', { name: 'Crisis Mesh' }).click();
    
    // Check for crisis agent listed in the dashboard
    await expect(page.getByText('Perimeter Macro Agent')).toBeVisible();
    
    // Expand agent to see details
    await page.getByText('Perimeter Macro Agent').click();
    await expect(page.getByText('Last Intervention:')).toBeVisible();
  });

  test('should handle language switching in Tactical View', async ({ page }) => {
    // Navigate to Tactical View
    await page.getByRole('button', { name: 'Tactical View' }).click();
    
    // Select language from dropdown
    const select = page.locator('select');
    await select.selectOption('JA');
    
    // Verify translation of main heading
    await expect(page.getByText('マルチモーダル・インテリジェンス')).toBeVisible();
  });
});
