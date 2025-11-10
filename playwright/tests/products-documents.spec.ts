import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { baseProduct } from '../fixtures/test-data';

test.describe('PF-009 – Documentos vinculados', () => {
  test('Adjuntar documentos y asignar categorías', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: /Productos|Products/i }).click();
    await page.getByRole('link', { name: baseProduct.reference }).click();
    await page.getByRole('link', { name: /Documentos/i }).click();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /Subir documento/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'ficha.pdf', mimeType: 'application/pdf', buffer: Buffer.from('PDF') });

    await page.getByLabel(/Categoría/i).fill('Catálogo');
    await page.getByRole('button', { name: /Guardar/i }).click();
    await expect(page.getByText('ficha.pdf')).toBeVisible();
    await expect(page.getByText('Catálogo')).toBeVisible();
  });
});
