import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  const loginField = page.getByLabel(/Login|Usuario/i);
  const passwordField = page.getByLabel(/Password|Contraseña/i);

  await expect(loginField).toBeVisible();
  await loginField.fill(process.env.ADMIN_USER || 'admin');
  await passwordField.fill(process.env.ADMIN_PASS || 'admin');
  await page.getByRole('button', { name: /Login|Conectar|Entrar/i }).click();
  await expect(page.getByRole('link', { name: /Inicio|Home/i })).toBeVisible();
}
