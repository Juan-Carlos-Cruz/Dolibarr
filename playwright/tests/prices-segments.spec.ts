import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { baseProduct, priceSegments } from '../fixtures/test-data';

test.describe('PF-007 – Multiprecios por segmento', () => {
  test('Aplicar precios diferenciados por segmento y fallback al segmento 1', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: baseProduct.reference }).click();
    await page.getByRole('link', { name: /Precios específicos/i }).click();

    for (const segment of priceSegments) {
      await page.getByRole('button', { name: /Nuevo precio específico/i }).click();
      await page.getByLabel(/Segmento/i).selectOption(segment.segment);
      await page.getByLabel(/Precio/i).fill(segment.price);
      await page.getByRole('button', { name: /Guardar/i }).click();
      await expect(page.getByText(`Segmento ${segment.segment}`)).toBeVisible();
    }

    await page.getByRole('link', { name: /Clientes/i }).click();
    await page.getByRole('link', { name: /Lista de clientes/i }).click();
    await page.getByRole('button', { name: /Nuevo cliente/i }).click();
    await page.getByLabel(/Nombre/i).fill('Cliente sin segmento');
    await page.getByRole('button', { name: /Guardar/i }).click();

    await page.getByRole('link', { name: /Cotizaciones|Proposals/i }).click();
    await page.getByRole('button', { name: /Nueva|New/i }).click();
    await page.getByRole('combobox', { name: /Cliente/i }).fill('Cliente sin segmento');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: /Agregar producto/i }).click();
    await page.getByRole('combobox', { name: /Producto/i }).fill(baseProduct.reference);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('spinbutton', { name: /Precio unitario/i })).toHaveValue(priceSegments[0].price);
  });
});
