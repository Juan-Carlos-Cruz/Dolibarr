import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { baseProduct } from '../fixtures/test-data';

test.describe('PF-002 – CRUD de productos físicos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Crear producto físico con datos válidos', async ({ page }) => {
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('button', { name: /Nuevo producto|New product/i }).click();

    await page.getByLabel(/Etiqueta|Label/i).fill(baseProduct.label);
    await page.getByLabel(/Referencia/i).fill(baseProduct.reference);
    await page.getByLabel(/Tipo/i).selectOption({ label: /Producto físico|Product/i });
    await page.getByLabel(/Peso/i).fill(baseProduct.weight);
    await page.getByLabel(/Tamaño/i).fill(baseProduct.size);
    await page.getByLabel(/Código arancelario|Customs/i).fill(baseProduct.hts);
    await page.getByLabel(/Precio de venta|Selling price/i).fill(baseProduct.price);
    await page.getByRole('button', { name: /Guardar|Save/i }).click();

    await expect(page.getByRole('heading', { name: baseProduct.label })).toBeVisible();
    await expect(page.getByText(baseProduct.reference)).toBeVisible();
  });

  test('Validar límites para campos numéricos', async ({ page }) => {
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('textbox', { name: /Búsqueda/i }).fill(baseProduct.reference);
    await page.keyboard.press('Enter');
    await page.getByRole('link', { name: baseProduct.reference }).click();
    await page.getByRole('button', { name: /Modificar|Modify/i }).click();

    await page.getByLabel(/Peso/i).fill('-1');
    await page.getByRole('button', { name: /Guardar|Save/i }).click();
    await expect(page.getByText(/debe ser mayor que/i)).toBeVisible();

    await page.getByLabel(/Peso/i).fill('9999');
    await page.getByRole('button', { name: /Guardar|Save/i }).click();
    await expect(page.getByText(/Datos actualizados|Updated/i)).toBeVisible();
  });

  test('Desactivar producto evita su oferta en documentos nuevos', async ({ page, context }) => {
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: baseProduct.reference }).click();
    await page.getByRole('button', { name: /Desactivar|Disable/i }).click();
    await expect(page.getByText(/Estado: Inactivo|Disabled/i)).toBeVisible();

    const newPage = await context.newPage();
    await loginAsAdmin(newPage);
    await newPage.getByRole('link', { name: /Cotizaciones|Proposals/i }).click();
    await newPage.getByRole('button', { name: /Nueva|New/i }).click();
    await newPage.getByRole('combobox', { name: /Producto/i }).fill(baseProduct.reference);
    await expect(newPage.getByRole('option', { name: baseProduct.reference })).not.toBeVisible();
    await newPage.close();
  });
});
