import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('PF-001 – Configuración del módulo Products', () => {
  test('HU-001: activar módulo Products y persistir parámetros', async ({ page }) => {
    await loginAsAdmin(page);

    await test.step('Navegar a Configuración → Módulos', async () => {
      await page.getByRole('link', { name: /Configuración|Setup/i }).click();
      await page.getByRole('link', { name: /Módulos|Modules/i }).click();
    });

    await test.step('Activar módulo Products', async () => {
      await page.getByRole('button', { name: /Products|Productos/i }).click();
      const toggle = page.getByRole('button', { name: /Activar|Enable/i });
      if (await toggle.isVisible()) {
        await toggle.click();
      }
      await page.getByRole('button', { name: /Guardar|Save/i }).click();
    });

    await test.step('Validar estado activo', async () => {
      await expect(page.getByText(/Estado: Activo|Enabled/i)).toBeVisible();
    });
  });
});
