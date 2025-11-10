import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { bomData } from '../fixtures/test-data';

test.describe('PF-012 – Bill of Materials', () => {
  test('Crear, validar BOM y generar documento', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Producción|Production|Fabricación/i }).click();
    await page.getByRole('link', { name: /BOM/i }).click();
    await page.getByRole('button', { name: /Nueva BOM|New BOM/i }).click();

    await page.getByLabel(/Referencia/i).fill(bomData.reference);
    await page.getByLabel(/Etiqueta|Label/i).fill(bomData.label);
    await page.getByRole('button', { name: /Guardar/i }).click();

    for (const component of bomData.components) {
      await page.getByRole('button', { name: /Agregar línea/i }).click();
      await page.getByRole('combobox', { name: /Producto/i }).fill(component.reference);
      await page.keyboard.press('Enter');
      await page.getByLabel(/Cantidad/i).fill(component.quantity);
      await page.getByRole('button', { name: /Guardar/i }).click();
    }

    await page.getByRole('button', { name: /Validar/i }).click();
    await expect(page.getByText(/Estado: Validado|Activated/i)).toBeVisible();

    await page.getByRole('link', { name: /Generar documento/i }).click();
    await expect(page.getByText(/odt/i)).toBeVisible();
  });
});
