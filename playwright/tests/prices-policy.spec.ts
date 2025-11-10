import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { baseProduct } from '../fixtures/test-data';

test.describe('PF-005/006 – Gestión de precios', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: baseProduct.reference }).click();
    await page.getByRole('link', { name: /Precio/i }).click();
  });

  test('Consultar precio vigente e histórico', async ({ page }) => {
    await expect(page.getByText(/Precio base/i)).toBeVisible();
    await expect(page.getByRole('table')).toContainText(/Histórico/);
  });

  test('Modificar precio base y validar límites de IVA', async ({ page }) => {
    await page.getByRole('button', { name: /Nuevo precio/i }).click();
    await page.getByLabel(/Precio base/i).fill('20000');
    await page.getByLabel(/Precio mínimo/i).fill('18000');
    await page.getByLabel(/IVA/i).fill('19');
    await page.getByRole('button', { name: /Crear|Guardar/i }).click();
    await expect(page.getByText(/Precio actualizado|Price updated/i)).toBeVisible();

    await page.getByRole('button', { name: /Nuevo precio/i }).click();
    await page.getByLabel(/IVA/i).fill('999');
    await page.getByRole('button', { name: /Crear|Guardar/i }).click();
    await expect(page.getByText(/IVA fuera de rango|VAT/i)).toBeVisible();
  });
});
