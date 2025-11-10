import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { baseProduct, serviceProduct } from '../fixtures/test-data';

test.describe('PF-003 – Visibilidad en Stock/Shipment', () => {
  test('Solo los productos físicos se listan para movimientos de stock', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole('link', { name: /Almacén|Stock/i }).click();

    await expect(page.getByText(baseProduct.reference)).toBeVisible();
    await expect(page.getByText(serviceProduct.reference)).not.toBeVisible();
  });
});
