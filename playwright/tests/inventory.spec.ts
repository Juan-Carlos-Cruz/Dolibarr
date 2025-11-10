import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { baseProduct } from '../fixtures/test-data';

test.describe('PF-010/011 – Inventario y movimientos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: baseProduct.reference }).click();
  });

  test('Consultar niveles por almacén y movimientos recientes', async ({ page }) => {
    await page.getByRole('link', { name: /Stock/i }).click();
    await expect(page.getByRole('table')).toContainText(/Almacén/);
    await expect(page.getByRole('table')).toContainText(/Movimiento/);
  });

  test('Registrar entrada, salida y transferencia', async ({ page }) => {
    await page.getByRole('link', { name: /Stock/i }).click();
    await page.getByRole('button', { name: /Nuevo movimiento/i }).click();

    const movements = [
      { type: 'in', qty: '10', reason: 'Reposición' },
      { type: 'out', qty: '5', reason: 'Venta' },
      { type: 'transfer', qty: '2', reason: 'Traslado' }
    ];

    for (const movement of movements) {
      await page.getByLabel(/Tipo/i).selectOption(movement.type);
      await page.getByLabel(/Cantidad/i).fill(movement.qty);
      await page.getByLabel(/Motivo/i).fill(movement.reason);
      await page.getByRole('button', { name: /Guardar/i }).click();
      await expect(page.getByText(movement.reason)).toBeVisible();
    }
  });
});
