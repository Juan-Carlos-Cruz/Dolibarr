import { test, expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { pairwise, Factors, Row } from '../../oa/pairwise';

// ----------------------
// Definición de factores
// ----------------------
const factors: Factors = {
  TipoEntidad: ['Company', 'Individual'],
  Customer: ['Yes', 'No'],
  Supplier: ['Yes', 'No'],
  Prospect: ['Yes', 'No'],
  Pais: ['Spain', 'France', 'United States', 'Colombia'],
  Email: ['valid', 'empty'],
  Telefono: ['local', 'intl'],
};

// ----------------------
// Restricciones de negocio
// ----------------------
function constraint(r: Row): boolean {
  // Prospect sólo si también es Customer
  if (r.Prospect === 'Yes' && r.Customer === 'No') return false;
  return true;
}

const casos = pairwise(factors, constraint);

// ----------------------
// Utilidades
// ----------------------
function telDe(tipo: string) {
  return tipo === 'intl' ? '+1 202 555 0101' : '555123456';
}

const labelPais: Record<string, string> = {
  Spain: 'Spain',
  France: 'France',
  'United States': 'United States',
  Colombia: 'Colombia',
};

async function setCheckboxByLabel(page: Page, re: RegExp, checked: boolean) {
  const lab = page.getByLabel(re).first();
  if (await lab.isVisible().catch(() => false)) {
    if (checked) await lab.check({ force: true });
    else await lab.uncheck({ force: true });
    return;
  }

  // fallback: texto clicable
  const txt = page.getByText(re).first();
  if (await txt.isVisible().catch(() => false)) {
    await txt.click();
  }
}

async function ensureThirdPartyModuleEnabled(page: Page) {
  console.log('ℹ️ Verificando que el módulo de terceros esté activo...');

  await page.goto('/admin/modules.php');
  await page.waitForLoadState('domcontentloaded');

  const foundationTabSelectors = [
    'a[href="#modulelistfoundation"]',
    'button[data-bs-target="#modulelistfoundation"]',
    'a[data-target="#modulelistfoundation"]',
  ];

  for (const selector of foundationTabSelectors) {
    const tab = page.locator(selector).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(250);
      break;
    }
  }

  const disableSelectors = [
    'a[href*="value=modSociete"][href*="action=disable"]',
    'a[href*="value=modSociete"][href*="action=deactivate"]',
  ];

  for (const selector of disableSelectors) {
    const disableLink = page.locator(selector).first();
    if ((await disableLink.count()) > 0) {
      console.log('✅ El módulo de terceros ya estaba activo.');
      return;
    }
  }

  const activationStrategies = [
    'a[href*="value=modSociete"][href*="action=activate"]',
    'form[action*="value=modSociete"] button[name="activate"]',
    'form[action*="value=modSociete"] input[type="submit"]',
  ];

  for (const selector of activationStrategies) {
    const activator = page.locator(selector).first();
    if ((await activator.count()) === 0) continue;

    await expect(
      activator,
      'No encontré un control visible para activar el módulo de terceros (modSociete).'
    ).toBeVisible({ timeout: 10000 });

    await activator.click();
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ Módulo de terceros activado desde la página de configuración.');
    return;
  }

  throw new Error(
    '❌ No fue posible activar el módulo de terceros. Revisa la página /admin/modules.php para ver si cambió el selector.'
  );
}

/**
 * Login robusto:
 * - Usa usuario/clave de variables de entorno si existen.
 * - Verifica URL después del login.
 */
async function loginIfNeeded(page: Page, user?: string, pass?: string) {
  const u = user ?? process.env.DOLI_USER ?? 'admin';
  const p = pass ?? process.env.DOLI_PASS ?? 'admin';

  await page.goto('/user/login.php');
  await page.waitForLoadState('domcontentloaded');

  const currentUrl = page.url();

  // Si ya estamos en otra página distinta a login, asumimos sesión iniciada
  if (!currentUrl.includes('login.php')) {
    console.log('🔓 Ya estás logueado (no se mostró login.php, URL:', currentUrl, ')');
    return;
  }

  const loginInput = page.getByLabel(/login|usuario/i).first();
  const passwordInput = page.getByLabel(/password|contraseña|mot de passe/i).first();

  const isLoginVisible = await loginInput.isVisible().catch(() => false);
  if (!isLoginVisible) {
    console.log('🔓 Ya estás logueado (formulario login no visible)');
    return;
  }

  console.log('➡️ Intentando login como', u);
  await loginInput.fill(u);
  await passwordInput.fill(p);

  const loginButton = page
    .getByRole('button', { name: /login|connexion|iniciar sesión|se connecter/i })
    .first();

  await loginButton.click();
  await page.waitForLoadState('networkidle');

  // Si seguimos en login, algo está mal (credenciales o baseURL)
  if (page.url().includes('login.php')) {
    throw new Error(
      '❌ Login fallido: revisa usuario/contraseña o que BASE_URL apunte a Dolibarr.\n' +
        `URL actual tras login: ${page.url()}`
    );
  }

  console.log('✅ Login exitoso. URL actual:', page.url());
}

/**
 * Abre el formulario "Nuevo tercero" y devuelve el locator del campo name.
 * - Navega a lista de terceros
 * - Click en "New third party"/"Nuevo tercero"/etc
 * - Verifica que existe input[name="name"]
 */
async function openCreateThirdPartyForm(page: Page) {
  // 2) Ir a la lista de Terceros
  await page.goto('/societe/list.php?type=0');
  await page.waitForLoadState('domcontentloaded');

  const accessDenied = page
    .getByText(/Access denied\.?|Acceso denegado/i, { exact: false })
    .first();
  if (await accessDenied.isVisible().catch(() => false)) {
    console.log('⚠️ Acceso denegado al listado de terceros. Intentando activar el módulo...');
    await ensureThirdPartyModuleEnabled(page);

    await page.goto('/societe/list.php?type=0');
    await page.waitForLoadState('domcontentloaded');

    if (await accessDenied.isVisible().catch(() => false)) {
      throw new Error(
        '❌ Seguimos sin acceso al listado de terceros incluso después de intentar activar el módulo.'
      );
    }
  }

  // 3) Localizar botón/enlace "Nuevo tercero"
  const candidates = [
    page
      .getByRole('link', {
        name: /new third party|nuevo tercero|nouveau tiers|crear tercero|create third party/i,
      })
      .first(),
    page
      .getByRole('button', {
        name: /new third party|nuevo tercero|nouveau tiers|crear tercero|create third party/i,
      })
      .first(),
    page
      .locator(
        'a[href*="/societe/card.php?action=create"], a[href*="/societe/soc.php?action=create"]'
      )
      .first(),
    page.locator('[data-role="action"] a[href*="societe/card.php?action=create"]').first(),
    page.locator('a[class*="butActionNew"][href*="societe/"]').first(),
  ];

  let newThird;
  for (const candidate of candidates) {
    if (await candidate.isVisible().catch(() => false)) {
      newThird = candidate;
      break;
    }
  }

  if (!newThird) {
    console.log(
      '⚠️ No encontré el enlace/botón para crear un nuevo tercero tras revisar selectores conocidos. Navegando directamente a la ficha de creación.'
    );
    await page.goto('/societe/card.php?action=create');
    await page.waitForLoadState('domcontentloaded');
  } else {
    await expect(
      newThird,
      'No encontré el enlace/botón para crear un nuevo tercero en la lista de terceros'
    ).toBeVisible({ timeout: 15000 });

    await newThird.click();
    await page.waitForLoadState('domcontentloaded');
  }

  console.log('➡️ Navegación al formulario de creación de tercero. URL:', page.url());

  // Campo "ThirdPartyName" (name)
  const nameField = page.locator('input[name="name"], #name').first();
  const count = await nameField.count();

  if (!count) {
    // Forzamos captura para debug (aunque Playwright ya genera otra al fallar)
    await page.screenshot({
      path: `debug-create-thirdparty-${Date.now()}.png`,
      fullPage: true,
    });

    throw new Error(
      `❌ No encontré el campo de nombre (input[name="name"]) en el formulario de creación de tercero.\n` +
        `URL actual: ${page.url()}\n` +
        'Revisa:\n' +
        ' - Que el usuario tenga permiso para crear terceros (módulo terceros activo).\n' +
        ' - Que BASE_URL en Playwright apunte al mismo Dolibarr que ves en el navegador.\n' +
        ' - Que no haya un canvas personalizado sustituyendo el formulario.'
    );
  }

  await expect(nameField).toBeVisible({ timeout: 10000 });
  return nameField;
}

// ----------------------
// Test principal
// ----------------------
test.describe('Terceros > Crear tercero (pairwise t=2)', () => {
  for (let i = 0; i < casos.length; i++) {
    const row = casos[i];

    test(
      `[${i + 1}/${casos.length}] ${row.TipoEntidad} / C:${row.Customer} / S:${row.Supplier} / P:${row.Prospect} / ${row.Pais} / ${row.Email} / ${row.Telefono}`,
      async ({ page }, info: TestInfo) => {
        info.annotations.push({ type: 'feature', description: 'Third parties' });
        info.annotations.push({ type: 'severity', description: 'critical' });

        // 1) Login si es necesario
        await loginIfNeeded(page);

        // 2) Abrir formulario "Nuevo tercero" y obtener campo nombre
        const nameField = await openCreateThirdPartyForm(page);

        // 3) Nombre corto (único)
        const shortName = `QA-OA-${Date.now()}-${i}`;
        await nameField.fill(shortName);

        // Alias name (opcional)
        const aliasField = page
          .locator('#name_alias_input, input[name="name_alias"]')
          .first();
        if (await aliasField.isVisible().catch(() => false)) {
          await aliasField.fill(`Alias ${shortName}`);
        }

        // 5) Tipo de entidad
        const persona = page.getByLabel(/individual|persona/i).first();
        const empresa = page.getByLabel(/company|empresa|société/i).first();

        if (
          (await persona.isVisible().catch(() => false)) &&
          (await empresa.isVisible().catch(() => false))
        ) {
          if (row.TipoEntidad === 'Individual') {
            await persona.check({ force: true });

            const ap = page.getByLabel(/lastname|apellidos|nom/i).first();
            const nom = page.getByLabel(/firstname|nombre|prénom/i).first();
            if (await ap.isVisible().catch(() => false)) await ap.fill(`Tester${i}`);
            if (await nom.isVisible().catch(() => false)) await nom.fill(`QA${i}`);
          } else {
            await empresa.check({ force: true });
          }
        }

        // 6) País
        const selPais = page.getByLabel(/country|país|pays/i).first();
        if (await selPais.isVisible().catch(() => false)) {
          await selPais.selectOption({ label: labelPais[row.Pais] });
        }

        // 7) Roles
        await setCheckboxByLabel(
          page,
          /customer|cliente|client/i,
          row.Customer === 'Yes'
        );
        await setCheckboxByLabel(
          page,
          /supplier|proveedor|fournisseur|vendor/i,
          row.Supplier === 'Yes'
        );
        await setCheckboxByLabel(page, /prospect/i, row.Prospect === 'Yes');

        // 8) Combos obligatorios si existen
        const prospectCombo = page.getByLabel(/prospect.*customer/i).first();
        if (await prospectCombo.isVisible().catch(() => false)) {
          await prospectCombo.selectOption({ index: 1 }).catch(() => {});
        }

        const vendorCombo = page.getByLabel(/^vendor$/i).first();
        if (await vendorCombo.isVisible().catch(() => false)) {
          await vendorCombo.selectOption({ index: 1 }).catch(() => {});
        }

        // 9) Email y Teléfono
        const email = page.getByLabel(/email/i).first();
        if (await email.isVisible().catch(() => false)) {
          if (row.Email === 'valid') await email.fill(`qa.${i}@example.com`);
          else await email.fill('');
        }

        const tel = page.getByLabel(/phone|tel/i).first();
        if (await tel.isVisible().catch(() => false)) {
          await tel.fill(telDe(row.Telefono));
        }

        // Dirección mínima
        const zip = page.getByLabel(/zip|postal/i).first();
        if (await zip.isVisible().catch(() => false)) await zip.fill('28001');

        const city = page.getByLabel(/city|ciudad|ville/i).first();
        if (await city.isVisible().catch(() => false)) await city.fill('Madrid');

        // 10) Guardar
        const saveButton = page
          .getByRole('button', {
            name: /create third party|create|save|guardar|créer|enregistrer/i,
          })
          .first();
        const saveLink = page
          .getByRole('link', {
            name: /create third party|create|save|guardar|créer|enregistrer/i,
          })
          .first();

        const save = saveButton.or(saveLink);
        await expect(save).toBeVisible({ timeout: 10000 });
        await save.click();

        // 11) Verificación
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        if (currentUrl.includes('card.php?action=create') || currentUrl.includes('soc.php?action=create')) {
          throw new Error(
            '❌ La creación del tercero falló: el formulario no redirigió. Revisa campos obligatorios / errores en pantalla.'
          );
        }

        await expect(page.getByText(shortName)).toBeVisible({ timeout: 30000 });
      }
    );
  }
});
