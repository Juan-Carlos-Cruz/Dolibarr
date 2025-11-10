let driver;
const { By, until } = require('selenium-webdriver');
const { createEdgeDriver } = require('../../src/utils/driverFactory');
const { runWithArtifacts } = require('../../src/utils/testOrchestrator');
const LoginPage = require('../../src/pages/LoginPage');
const HomePage = require('../../src/pages/HomePage');
const ModuleManagerPage = require('../../src/pages/ModuleManagerPage');
const ProductsListPage = require('../../src/pages/ProductsListPage');
const ProductCardPage = require('../../src/pages/ProductCardPage');
const ProductPricePage = require('../../src/pages/ProductPricePage');
const ProductMultipricePage = require('../../src/pages/ProductMultipricePage');
const ProductVariantPage = require('../../src/pages/ProductVariantPage');
const ProductAttachmentPage = require('../../src/pages/ProductAttachmentPage');
const InventoryPage = require('../../src/pages/InventoryPage');
const StockMovementPage = require('../../src/pages/StockMovementPage');
const BomPage = require('../../src/pages/BomPage');
const WarehousePage = require('../../src/pages/WarehousePage');
const PriceLevelPage = require('../../src/pages/PriceLevelPage');
const config = require('../../config/testConfig');
const testData = require('./testData');

jest.setTimeout(600000);

const context = {
  product: { id: null, reference: testData.products.physical.reference },
  service: { id: null, reference: testData.products.service.reference }
};

describe('Dolibarr Functional Regression PF-001 to PF-012', () => {
  let loginPage;
  let homePage;
  let moduleManagerPage;
  let productsListPage;
  let productCardPage;
  let productPricePage;
  let productMultipricePage;
  let productVariantPage;
  let productAttachmentPage;
  let inventoryPage;
  let stockMovementPage;
  let bomPage;
  let warehousePage;
  let priceLevelPage;

  beforeAll(async () => {
    driver = await createEdgeDriver();
    loginPage = new LoginPage(driver);
    homePage = new HomePage(driver);
    moduleManagerPage = new ModuleManagerPage(driver);
    productsListPage = new ProductsListPage(driver);
    productCardPage = new ProductCardPage(driver);
    productPricePage = new ProductPricePage(driver);
    productMultipricePage = new ProductMultipricePage(driver);
    productVariantPage = new ProductVariantPage(driver);
    productAttachmentPage = new ProductAttachmentPage(driver);
    inventoryPage = new InventoryPage(driver);
    stockMovementPage = new StockMovementPage(driver);
    bomPage = new BomPage(driver);
    warehousePage = new WarehousePage(driver);
    priceLevelPage = new PriceLevelPage(driver);

    await loginPage.login(config.adminUser, config.adminPassword);
    await driver.wait(until.urlContains('index.php'), config.defaultTimeout);
  });

  async function ensureWarehouses() {
    for (const warehouseName of testData.warehouses) {
      await warehousePage.ensureWarehouse(warehouseName);
    }
  }

  async function ensurePriceSegments() {
    for (const segment of testData.segments) {
      await priceLevelPage.ensurePriceLevel(segment);
    }
  }

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('test_pf_001_activar_modulo_products', async () => {
    await runWithArtifacts('PF-001', driver, async () => {
      await moduleManagerPage.open();
      const modulesToEnable = [
        { key: 'modProduct', label: 'Products' },
        { key: 'modService', label: 'Services' },
        { key: 'modStock', label: 'Stock' },
        { key: 'modProductBatch', label: 'Batch' },
        { key: 'modProductVariant', label: 'Variants' },
        { key: 'modCategorie', label: 'Categories' },
        { key: 'modMargin', label: 'Margin' },
        { key: 'modBom', label: 'BOM' },
        { key: 'modMrp', label: 'MRP' }
      ];

      for (const module of modulesToEnable) {
        await moduleManagerPage.enableModule(module);
      }

      for (const module of modulesToEnable) {
        const enabled = await moduleManagerPage.isModuleEnabled(module);
        expect(enabled).toBe(true);
      }

      await ensureWarehouses();
      await ensurePriceSegments();
    });
  });

  test('test_pf_002_crear_producto_fisico', async () => {
    await runWithArtifacts('PF-002', driver, async () => {
      await productsListPage.open('product');
      await productsListPage.goToCreateProduct();

      const { physical } = testData.products;
      await productCardPage.createProduct({
        reference: physical.reference,
        label: physical.label,
        type: 'Product',
        weight: physical.weightValues[1],
        length: physical.dimensions.length,
        width: physical.dimensions.width,
        height: physical.dimensions.height,
        hts: physical.htsValid
      });

      await driver.wait(untilUrlContainsId(), config.defaultTimeout);
      const productUrl = await driver.getCurrentUrl();
      context.product.id = getIdFromUrl(productUrl);

      const header = await driver.findElement(By.css('div.fiche div.fichehead h2, div.fiche h2, h1'));
      const headerText = await header.getText();
      expect(headerText).toContain(physical.label);

      for (const weight of physical.weightValues) {
        await openProductEditTab();
        await productCardPage.type(productCardPage.weightInput, weight.toString());
        await productCardPage.click(productCardPage.submitButton);
        const alert = await driver.findElement(By.css('div.ok, div.warning, div.error'));
        expect(await alert.getText()).toMatch(/(Saved|Modificado|Guardado)/i);
      }

      await openProductEditTab();
      await productCardPage.type(productCardPage.htsInput, physical.htsInvalid);
      await productCardPage.click(productCardPage.submitButton);
      const errorBox = await driver.findElement(By.css('div.error'));
      expect(await errorBox.getText()).toMatch(/HTS|custom/i);

      await productCardPage.type(productCardPage.htsInput, physical.htsValid);
      await productCardPage.click(productCardPage.submitButton);

      await productCardPage.disableProduct();
      const statusBadge = await driver.findElement(By.css('span.badge-status, span.badge-status2, span.statusbadge'));
      expect(await statusBadge.getText()).toMatch(/Inactive|Inactivo/i);
    });
  });

  test('test_pf_003_visibilidad_stock_shipment', async () => {
    await runWithArtifacts('PF-003', driver, async () => {
      if (!context.service.id) {
        await productsListPage.open('service');
        await productsListPage.goToCreateProduct();
        await productCardPage.createProduct({
          reference: testData.products.service.reference,
          label: testData.products.service.label,
          type: 'Service'
        });
        await driver.wait(untilUrlContainsId(), config.defaultTimeout);
        context.service.id = getIdFromUrl(await driver.getCurrentUrl());
      }

      await inventoryPage.open(context.product.id);
      const productBreadcrumb = await driver.findElement(By.css('div.tabsAction span'));
      expect(await productBreadcrumb.getText()).toContain(testData.products.physical.reference);

      await expectElementNotPresent(By.css(`a[href*="id=${context.service.id}"]`));
    });
  });

  test('test_pf_004_listado_productos', async () => {
    await runWithArtifacts('PF-004', driver, async () => {
      await productsListPage.open('product');
      const combinations = [
        { tag: 'General', order: 'asc', view: 'list' },
        { tag: 'General', order: 'desc', view: 'grid' },
        { tag: 'Sin etiqueta', order: 'asc', view: 'grid' }
      ];

      for (const combo of combinations) {
        await productsListPage.applyTagFilter(combo.tag);
        await productsListPage.sortByReference(combo.order === 'desc');
        await productsListPage.toggleView(combo.view);
        const rows = await driver.findElements(By.css('table.liste tbody tr, div.fichecenter div.fichehalfleft div.tagtr'));
        expect(rows.length).toBeGreaterThan(0);
      }

      const referenceLink = await driver.findElement(By.css(`a[href*="card.php?id=${context.product.id}"]`));
      await referenceLink.click();
      await driver.wait(untilUrlContainsId(), config.defaultTimeout);
      const url = await driver.getCurrentUrl();
      expect(url).toContain(`id=${context.product.id}`);
    });
  });

  test('test_pf_005_consultar_precios_venta', async () => {
    await runWithArtifacts('PF-005', driver, async () => {
      await driver.get(`${config.baseUrl}/product/card.php?id=${context.product.id}`);
      await productPricePage.openSellPriceTab();
      const table = await driver.findElement(productPricePage.historicalTable);
      const headers = await table.findElements(By.css('thead th'));
      const headerText = (await Promise.all(headers.map((h) => h.getText()))).join(' ');
      expect(headerText).toMatch(/Price|IVA|Date/i);
      const bodyRows = await table.findElements(By.css('tbody tr'));
      expect(bodyRows.length).toBeGreaterThan(0);
    });
  });

  test('test_pf_006_modificar_precios_base', async () => {
    await runWithArtifacts('PF-006', driver, async () => {
      await driver.get(`${config.baseUrl}/product/card.php?id=${context.product.id}`);
      await productPricePage.openSellPriceTab();
      await productPricePage.createPrice({ price: 100, priceMin: 80, vatRate: 19 });
      let notice = await driver.findElement(By.css('div.ok'));
      expect(await notice.getText()).toMatch(/Price added|Precio añadido/i);

      await productPricePage.createPrice({ price: 50, priceMin: 40, vatRate: 0 });
      notice = await driver.findElement(By.css('div.ok'));
      expect(await notice.getText()).toMatch(/Price added|Precio añadido/i);

      await productPricePage.createPrice({ price: 200, priceMin: 150, vatRate: 30 });
      const error = await driver.findElement(By.css('div.error'));
      expect(await error.getText()).toMatch(/VAT|IVA/i);
    });
  });

  test('test_pf_007_multiprecios_por_segmento', async () => {
    await runWithArtifacts('PF-007', driver, async () => {
      await ensurePriceSegments();
      await driver.get(`${config.baseUrl}/product/card.php?id=${context.product.id}`);
      await productMultipricePage.open();
      for (let i = 0; i < testData.segments.length; i += 1) {
        await productMultipricePage.setSegmentPrice(i + 1, 100 + i * 10);
      }
      await productMultipricePage.saveSegmentPrices();
      const notice = await driver.findElement(By.css('div.ok'));
      expect(await notice.getText()).toMatch(/Saved|Guardado/i);
      const rows = await driver.findElements(By.css('table#tablelines tbody tr'));
      expect(rows.length).toBeGreaterThanOrEqual(testData.segments.length);
    });
  });

  test('test_pf_008_variantes_talla_color', async () => {
    await runWithArtifacts('PF-008', driver, async () => {
      await driver.get(`${config.baseUrl}/product/card.php?id=${context.product.id}`);
      await productVariantPage.open();
      await productVariantPage.createAttribute('Talla', ['S', 'M']);
      await productVariantPage.createAttribute('Color', ['Rojo', 'Azul']);
      await productVariantPage.generateVariants();
      const table = await driver.findElement(By.css('table#tablevariants, table.liste')); 
      const rows = await table.findElements(By.css('tbody tr'));
      expect(rows.length).toBeGreaterThanOrEqual(4);
    });
  });

  test('test_pf_009_documentos_vinculados_producto', async () => {
    await runWithArtifacts('PF-009', driver, async () => {
      await driver.get(`${config.baseUrl}/product/card.php?id=${context.product.id}`);
      await productAttachmentPage.open();
      await productAttachmentPage.uploadDocument('tests/resources/sample.pdf', 'General');
      const rows = await driver.findElements(By.css('table#tablelines tbody tr'));
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  test('test_pf_010_inventario_consultar_niveles', async () => {
    await runWithArtifacts('PF-010', driver, async () => {
      await inventoryPage.open(context.product.id);
      const headers = await driver.findElements(By.css('table#tablelines thead th'));
      const text = (await Promise.all(headers.map((h) => h.getText()))).join(' ');
      expect(text).toMatch(/Stock|Warehouse|Movimiento/i);
    });
  });

  test('test_pf_011_registrar_movimientos', async () => {
    await runWithArtifacts('PF-011', driver, async () => {
      await ensureWarehouses();
      await stockMovementPage.open(context.product.id);
      const movements = [
        { quantity: 1, type: 'Entrada', warehouse: testData.warehouses[0], reason: 'Ingreso prueba' },
        { quantity: 0, type: 'Salida', warehouse: testData.warehouses[0], reason: 'Salida nula' },
        { quantity: 9999, type: 'Entrada', warehouse: testData.warehouses[1], reason: 'Maximo' }
      ];

      for (const movement of movements) {
        await stockMovementPage.createMovement(movement);
        const alert = await driver.findElement(By.css('div.ok, div.error'));
        const message = await alert.getText();
        if (movement.quantity <= 0) {
          expect(message).toMatch(/error|inval/i);
        } else {
          expect(message).toMatch(/Movement|Movimiento/i);
        }
      }
    });
  });

  test('test_pf_012_bom_crear_y_validar', async () => {
    await runWithArtifacts('PF-012', driver, async () => {
      await bomPage.openList();
      await bomPage.createBom({ reference: 'BOM-PF-001', label: 'BOM Producto PF' });
      await bomPage.addComponent({ productName: testData.products.physical.reference, quantity: 1 });
      await bomPage.addComponent({ productName: testData.products.service.reference, quantity: 1 });
      await bomPage.validateBom();
      await bomPage.openGeneratedDocument();
      const tabs = await driver.getAllWindowHandles();
      expect(tabs.length).toBeGreaterThan(0);
    });
  });
});

function untilUrlContainsId() {
  return async (driverInstance) => {
    const url = await driverInstance.getCurrentUrl();
    return /id=\d+/.test(url);
  };
}

function getIdFromUrl(url) {
  const parsed = new URL(url);
  return parsed.searchParams.get('id');
}

async function openProductEditTab() {
  const editLinks = await driver.findElements(By.css('a[href*="action=edit"], a#editproduct'));
  if (editLinks.length > 0) {
    await editLinks[0].click();
  }
}

async function expectElementNotPresent(locator) {
  const elements = await driver.findElements(locator);
  expect(elements.length).toBe(0);
}
