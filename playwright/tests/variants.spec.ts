import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { baseProduct, variantAttributes } from '../fixtures/test-data';

test.describe('PF-008 – Gestión de variantes', () => {
  test('Crear atributos y generar variantes para documentos', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: baseProduct.reference }).click();
    await page.getByRole('link', { name: /Variantes/i }).click();

    for (const [attribute, values] of Object.entries(variantAttributes)) {
      await page.getByRole('button', { name: /Nuevo atributo/i }).click();
      await page.getByLabel(/Nombre del atributo/i).fill(attribute);
      await page.getByLabel(/Valores/i).fill(values.join('\n'));
      await page.getByRole('button', { name: /Guardar/i }).click();
      await expect(page.getByText(attribute)).toBeVisible();
    }

    await page.getByRole('button', { name: /Generar variantes/i }).click();
    await expect(page.getByRole('table')).toContainText('Rojo');
    await expect(page.getByRole('table')).toContainText('Azul');
  });
});
