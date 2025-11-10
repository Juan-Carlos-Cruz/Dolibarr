import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
const orthogonalDesign = require('../../config/orthogonal-design');

test.describe('PF-004 – Listado de productos con arreglo ortogonal', () => {
  const cases = orthogonalDesign.generateTestCases();

  for (const testCase of cases) {
    test(`Ejecutar ${testCase.id}: ${testCase.description}`, async ({ page }) => {
      await loginAsAdmin(page);
      await page.getByRole('link', { name: /Productos|Products/i }).click();

      await page.getByRole('button', { name: /Opciones de vista/i }).click();
      await page.getByRole('menuitem', { name: new RegExp(testCase.factorLevels.viewMode, 'i') }).click();

      await page.getByRole('combobox', { name: /Ordenar/i }).selectOption(testCase.inputs.sortField);
      await page.getByRole('combobox', { name: /Orden/i }).selectOption(testCase.inputs.sortOrder);

      if (testCase.inputs.tag) {
        await page.getByRole('combobox', { name: /Etiqueta|Tag/i }).selectOption({ label: testCase.inputs.tag });
      } else {
        await page.getByRole('combobox', { name: /Etiqueta|Tag/i }).selectOption({ label: /Todos|All/i });
      }

      await page.getByRole('combobox', { name: /Por página|Per page/i }).selectOption(`${testCase.inputs.pageSize}`);
      await expect(page.getByRole('link', { name: /Referencia/i })).toBeVisible();
    });
  }
});
