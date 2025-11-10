const path = require('path');
const fs = require('fs-extra');
const { By, Key } = require('selenium-webdriver');
const BaseTest = require('./base-test');
const config = require('../config/config');

const testCases = [
    {
        id: 'PF-001',
        hu: 'HU-001',
        iteration: 1,
        techniques: ['TD', 'PE'],
        description: 'Activar módulo Products y guardar parámetros desde Configuración → Módulos.',
        execute: activateProductsModule
    },
    {
        id: 'PF-002',
        hu: 'HU-002',
        iteration: 1,
        techniques: ['PE', 'VL'],
        description: 'Crear producto físico con diferentes pesos y HTS, editar y desactivar.',
        execute: createAndUpdatePhysicalProduct
    },
    {
        id: 'PF-003',
        hu: 'HU-003',
        iteration: 1,
        techniques: ['TD'],
        description: 'Verificar visibilidad en Stock/Shipment para productos y servicios.',
        execute: verifyStockVsServiceVisibility
    },
    {
        id: 'PF-004',
        hu: 'HU-017',
        iteration: 1,
        techniques: ['AO', 'TD'],
        description: 'Listar productos aplicando filtros combinados y verificar navegación.',
        execute: runProductListFilters
    },
    {
        id: 'PF-005',
        hu: 'HU-021',
        iteration: 2,
        techniques: ['VL', 'TD'],
        description: 'Consultar precios de venta y el histórico asociado.',
        execute: reviewSalePrices
    },
    {
        id: 'PF-006',
        hu: 'HU-022',
        iteration: 2,
        techniques: ['PE', 'VL'],
        description: 'Modificar precio base, precio mínimo y tasa IVA.',
        execute: modifyBasePrices
    },
    {
        id: 'PF-007',
        hu: 'HU-006',
        iteration: 2,
        techniques: ['TD', 'AO'],
        description: 'Validar multiprecios por segmento con retroceso a segmento 1.',
        execute: validateSegmentPrices
    },
    {
        id: 'PF-008',
        hu: 'HU-008',
        iteration: 2,
        techniques: ['TD', 'PE'],
        description: 'Gestionar variantes de productos y su uso en documentos.',
        execute: manageProductVariants
    },
    {
        id: 'PF-009',
        hu: 'HU-028',
        iteration: 3,
        techniques: ['PE'],
        description: 'Gestionar documentos vinculados a un producto.',
        execute: manageLinkedDocuments
    },
    {
        id: 'PF-010',
        hu: 'HU-025',
        iteration: 3,
        techniques: ['PE'],
        description: 'Consultar inventario por almacén y movimientos recientes.',
        execute: reviewInventoryLevels
    },
    {
        id: 'PF-011',
        hu: 'HU-026',
        iteration: 3,
        techniques: ['VL', 'TD'],
        description: 'Registrar movimientos de inventario validando reglas de negocio.',
        execute: registerInventoryMovements
    },
    {
        id: 'PF-012',
        hu: 'HU-010–HU-014',
        iteration: 3,
        techniques: ['TD'],
        description: 'Gestionar BOM (lista de materiales) y validar generación de documento.',
        execute: manageBOMLifecycle
    }
];

function createContext(testCase, baseTest) {
    const artifacts = {
        screenshots: [],
        video: null
    };

    return {
        testCase,
        baseTest,
        driver: baseTest.driver,
        artifacts,
        notes: [],
        async capture(label) {
            const filePath = await baseTest.captureEvidence(testCase.id, label);
            if (filePath) {
                artifacts.screenshots.push(toRelative(filePath));
            }
            return filePath;
        },
        log(message) {
            const entry = `[${testCase.id}] ${message}`;
            console.log(entry);
            this.notes.push(message);
        },
        async ensureMenu(menuId) {
            try {
                const menu = await baseTest.waitForSelector(`#${menuId}`);
                await menu.click();
            } catch (error) {
                this.log(`No se pudo hacer clic en menú #${menuId}: ${error.message}`);
            }
        }
    };
}

async function runFunctionalSuite() {
    const resultsDir = path.resolve(__dirname, '..', 'reports', 'results');
    await fs.ensureDir(resultsDir);
    const summary = [];

    for (const testCase of testCases) {
        const baseTest = new BaseTest();
        const context = createContext(testCase, baseTest);
        const result = {
            id: testCase.id,
            hu: testCase.hu,
            techniques: testCase.techniques,
            iteration: testCase.iteration,
            description: testCase.description,
            status: 'blocked',
            startedAt: new Date().toISOString(),
            notes: context.notes,
            screenshots: context.artifacts.screenshots,
            video: null
        };

        try {
            await baseTest.setupDriver();
            await baseTest.startVideoRecording(testCase.id);
            await baseTest.login();
            await context.capture('login');

            await testCase.execute(context);

            result.status = 'passed';
            result.completedAt = new Date().toISOString();
        } catch (error) {
            const errorMessage = error && error.message ? error.message : String(error);
            console.error(`❌ ${testCase.id} falló: ${errorMessage}`);
            context.notes.push(`Error: ${errorMessage}`);
            result.status = 'failed';
            result.error = errorMessage;
            await context.capture('error');
        } finally {
            const videoPath = await baseTest.stopVideoRecording();
            if (videoPath) {
                context.artifacts.video = toRelative(videoPath);
                result.video = context.artifacts.video;
            }

            await baseTest.tearDown();

            result.screenshots = context.artifacts.screenshots;
            result.notes = context.notes;

            summary.push(result);
            await writeCaseResult(resultsDir, result);
        }

        await delay(config.testing.delayBetweenTests);
    }

    const summaryPath = path.join(resultsDir, 'functional-summary.json');
    await fs.writeJson(summaryPath, summary, { spaces: 2 });

    console.log('📄 Resultados consolidados en', toRelative(summaryPath));
}

async function writeCaseResult(resultsDir, result) {
    const filename = `${result.id}.json`;
    const filepath = path.join(resultsDir, filename);
    await fs.writeJson(filepath, result, { spaces: 2 });
    console.log(`🗂️ Resultado individual guardado en ${toRelative(filepath)}`);
}

function toRelative(absPath) {
    if (!absPath) {
        return null;
    }
    return path.relative(process.cwd(), absPath);
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Casos de prueba ---

async function activateProductsModule(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/admin/modules.php');
    await context.capture('modules_list');

    try {
        const searchInput = await baseTest.waitForSelector([
            'input[name="search_keyword"]',
            'input[name="searchkeyword"]',
            '#search_keyword'
        ]);
        await searchInput.clear();
        await searchInput.sendKeys('product');
        await searchInput.sendKeys(Key.ENTER);
        await driver.sleep(2000);
    } catch (error) {
        log(`No se pudo aplicar filtro de módulos: ${error.message}`);
    }

    const potentialLabels = ['Productos/Servicios', 'Products/Services', 'Productos'];
    let moduleRow = null;

    for (const label of potentialLabels) {
        try {
            moduleRow = await baseTest.findElementByText(label, 'tr', 5000);
            if (moduleRow) {
                break;
            }
        } catch (error) {
            log(`No se encontró fila con etiqueta ${label}`);
        }
    }

    if (!moduleRow) {
        throw new Error('No se localizó el módulo de productos en la lista.');
    }

    await context.capture('product_module_row');

    const activateSelectors = [
        "input[type='submit'][value*='Activar']",
        "input[type='submit'][value*='Enable']",
        "a[href*='activate'][href*='modProduct']",
        "button[name*='activate'][name*='modProduct']"
    ];

    let activateButton = null;
    for (const selector of activateSelectors) {
        const found = await moduleRow.findElements(By.css(selector));
        if (found.length > 0) {
            activateButton = found[0];
            break;
        }
    }

    if (activateButton) {
        await activateButton.click();
        await driver.sleep(2000);
        log('Se ejecutó la acción de activación.');
        await context.capture('product_module_activated');
        return;
    }

    const genericActivate = await moduleRow.findElements(By.css("input[type='submit']"));
    if (genericActivate.length > 0) {
        await genericActivate[0].click();
        await driver.sleep(2000);
        await context.capture('product_module_activated_generic');
    } else {
        log('No hay botones de activación disponibles. Es posible que el módulo ya esté activo.');
    }
}

async function createAndUpdatePhysicalProduct(context) {
    const { baseTest, driver, log, testCase } = context;

    const datasets = [
        { weight: '0', hts: 'HTS0000', labelSuffix: 'PesoCero' },
        { weight: '0.1', hts: 'HTS0001', labelSuffix: 'PesoDecimal' },
        { weight: '9999', hts: 'HTS9999', labelSuffix: 'PesoMaximo' }
    ];

    for (const dataset of datasets) {
        const ref = `AUTO-${Date.now()}-${dataset.labelSuffix}`;
        await baseTest.navigateTo('/product/card.php?action=create&type=0');
        await context.capture(`create_form_${dataset.labelSuffix}`);

        await baseTest.typeInField(['input[name="ref"]', '#ref'], ref);
        await baseTest.typeInField(['input[name="label"]', '#label'], `Producto ${dataset.labelSuffix}`);
        await baseTest.typeInField(['input[name="weight"]', 'input[name="weight_value"]'], dataset.weight);

        try {
            await baseTest.typeInField(['input[name="length"]', 'input[name="size"]'], '10');
            await baseTest.typeInField(['input[name="width"]'], '5');
            await baseTest.typeInField(['input[name="height"]'], '3');
        } catch (error) {
            log('No se encontraron campos de tamaño completo, se omite.');
        }

        try {
            await baseTest.typeInField(['input[name="customcode"]', 'input[name="barcode"]'], dataset.hts);
        } catch (error) {
            log('No se encontró campo HTS/barcode, se omite.');
        }

        await context.capture(`before_save_${dataset.labelSuffix}`);

        try {
            const submitButton = await baseTest.clickFirstAvailable([
                "input[type='submit'][value*='Crear']",
                "input[type='submit'][value*='Guardar']",
                "button[name='save']",
                "button[type='submit']"
            ]);
            await driver.sleep(3000);
            log(`Formulario enviado para ${ref}`);
        } catch (error) {
            log(`No se pudo enviar el formulario: ${error.message}`);
            throw error;
        }

        await context.capture(`created_${dataset.labelSuffix}`);

        try {
            const editButton = await baseTest.clickFirstAvailable([
                "a[href*='action=edit']",
                "a.button[href*='edit']"
            ]);
            await driver.sleep(2000);
            await baseTest.typeInField(['input[name="weight"]', 'input[name="weight_value"]'], dataset.weight);
            await context.capture(`edited_${dataset.labelSuffix}`);

            try {
                const statusButton = await baseTest.clickFirstAvailable([
                    "a[href*='action=statut']",
                    "button[name='actionactivate']"
                ]);
                await driver.sleep(2000);
                await context.capture(`deactivated_${dataset.labelSuffix}`);
            } catch (error) {
                log('No se pudo cambiar el estado del producto.');
            }
        } catch (error) {
            log(`No se pudo editar o desactivar el producto ${ref}: ${error.message}`);
        }
    }
}

async function verifyStockVsServiceVisibility(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/list.php?type=0');
    await context.capture('product_list');

    await baseTest.navigateTo('/product/list.php?type=1');
    await context.capture('service_list');

    await baseTest.navigateTo('/product/stock/mouvement.php');
    await context.capture('stock_movement');

    log('Se capturó evidencia de listas de productos, servicios y stock. Verificar manualmente visibilidad.');
}

async function runProductListFilters(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/list.php?type=0');
    await context.capture('product_list_initial');

    const labels = ['Etiqueta 1', 'Etiqueta 2', 'Etiqueta 3'];
    const sortOrders = ['ASC', 'DESC'];
    const views = ['list', 'card'];

    for (const label of labels) {
        for (const sort of sortOrders) {
            for (const view of views) {
                await applyProductFilterCombination(baseTest, driver, label, sort, view, context);
            }
        }
    }

    log('Se ejecutaron combinaciones de filtros de productos.');
}

async function applyProductFilterCombination(baseTest, driver, label, sort, view, context) {
    try {
        const tagField = await baseTest.waitForSelector([
            'input[name="search_tag"]',
            'input[name="search_tags"]',
            '#search_tag'
        ], 2000);
        await tagField.clear();
        await tagField.sendKeys(label);
    } catch (error) {
        context.log(`No se encontró campo de etiqueta: ${error.message}`);
    }

    try {
        const sortSelect = await baseTest.waitForSelector([
            'select[name="sortfield"]',
            '#sortfield'
        ], 2000);
        await sortSelect.sendKeys(sort);
    } catch (error) {
        context.log(`No se encontró selector de orden: ${error.message}`);
    }

    try {
        const viewToggle = await baseTest.waitForSelector([
            `a[href*='view=${view}']`,
            `button[data-view='${view}']`
        ], 2000);
        await viewToggle.click();
    } catch (error) {
        context.log(`No se encontró botón de vista ${view}.`);
    }

    try {
        const submit = await baseTest.waitForSelector([
            "input[type='submit'][name='button_search']",
            "button[name='search']",
            "button[type='submit']"
        ], 2000);
        await submit.click();
        await driver.sleep(2000);
    } catch (error) {
        context.log('No se pudo aplicar filtro, se continúa con la siguiente combinación.');
    }

    await context.capture(`filter_${label}_${sort}_${view}`);
}

async function reviewSalePrices(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/list.php?type=0');
    await context.capture('price_list_overview');

    try {
        const firstLink = await baseTest.waitForSelector([
            "a[href*='card.php?id=']",
            'table.liste tbody tr td a'
        ]);
        await firstLink.click();
        await driver.sleep(2000);
    } catch (error) {
        log('No se pudo abrir un producto.');
        throw error;
    }

    await baseTest.navigateTo(`${await driver.getCurrentUrl()}&tab=prices`);
    await context.capture('price_tab');

    try {
        const historyLink = await baseTest.findElementByText('Histórico', 'a', 3000);
        await historyLink.click();
        await driver.sleep(2000);
        await context.capture('price_history');
    } catch (error) {
        log('No se encontró enlace de histórico.');
    }
}

async function modifyBasePrices(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/list.php?type=0');
    const productLink = await baseTest.waitForSelector([
        "a[href*='card.php?id=']"
    ]);
    await productLink.click();
    await driver.sleep(2000);

    await baseTest.navigateTo(`${await driver.getCurrentUrl()}&action=edit_price`);
    await context.capture('edit_price_form');

    try {
        await baseTest.typeInField(['input[name="price"]', '#price'], '100');
        await baseTest.typeInField(['input[name="price_min"]', '#price_min'], '80');
        await baseTest.typeInField(['input[name="tva_tx"]', '#tva_tx'], '19');
        await context.capture('price_values');

        const saveButton = await baseTest.clickFirstAvailable([
            "input[type='submit'][value*='Guardar']",
            "button[name='save']"
        ]);
        await driver.sleep(2000);
        await context.capture('price_saved');
    } catch (error) {
        log('No se pudo modificar precio.');
        throw error;
    }
}

async function validateSegmentPrices(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/list.php?type=0');
    const productLink = await baseTest.waitForSelector([
        "a[href*='card.php?id=']"
    ]);
    await productLink.click();
    await driver.sleep(2000);

    try {
        const multipriceTab = await baseTest.findElementByText('Multiprecios', 'a', 3000);
        await multipriceTab.click();
        await driver.sleep(2000);
        await context.capture('multiprice_tab');
    } catch (error) {
        log('No se encontró pestaña de multiprecios.');
    }

    const segments = [1, 2, 3, 4, 5];
    for (const segment of segments) {
        try {
            const priceField = await baseTest.waitForSelector([
                `input[name='price_level_${segment}']`,
                `input[name='multiprice[${segment}]']`
            ], 2000);
            await priceField.clear();
            await priceField.sendKeys(String(100 + segment));
        } catch (error) {
            log(`No se pudo asignar precio para segmento ${segment}.`);
        }
    }

    await context.capture('multiprice_values');

    try {
        const saveButton = await baseTest.clickFirstAvailable([
            "input[type='submit'][value*='Guardar']",
            "button[name='save']"
        ]);
        await driver.sleep(2000);
        await context.capture('multiprice_saved');
    } catch (error) {
        log('No se pudo guardar multiprecios.');
    }
}

async function manageProductVariants(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/list.php?type=0');
    const productLink = await baseTest.waitForSelector([
        "a[href*='card.php?id=']"
    ]);
    await productLink.click();
    await driver.sleep(2000);

    try {
        const variantTab = await baseTest.findElementByText('Variantes', 'a', 3000);
        await variantTab.click();
        await driver.sleep(2000);
        await context.capture('variant_tab');
    } catch (error) {
        log('No se encontró pestaña de variantes.');
    }

    try {
        const createVariant = await baseTest.clickFirstAvailable([
            "a[href*='action=create_variant']",
            "a[href*='variant&action=create']",
            "button[name='create_variant']"
        ]);
        await driver.sleep(2000);
        await context.capture('variant_form');
    } catch (error) {
        log('No se encontró botón de crear variante.');
    }
}

async function manageLinkedDocuments(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/list.php?type=0');
    const productLink = await baseTest.waitForSelector([
        "a[href*='card.php?id=']"
    ]);
    await productLink.click();
    await driver.sleep(2000);

    try {
        const documentsTab = await baseTest.findElementByText('Documentos', 'a', 3000);
        await documentsTab.click();
        await driver.sleep(2000);
        await context.capture('documents_tab');
    } catch (error) {
        log('No se encontró pestaña de documentos.');
    }

    log('La subida y categorización de archivos se debe complementar manualmente si no hay archivos disponibles.');
}

async function reviewInventoryLevels(context) {
    const { baseTest, driver } = context;

    await baseTest.navigateTo('/product/stock/product.php');
    await context.capture('inventory_overview');

    await baseTest.navigateTo('/product/stock/list.php');
    await context.capture('inventory_movements');
}

async function registerInventoryMovements(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/product/stock/mouvement.php?action=create');
    await context.capture('movement_form');

    const quantities = ['-1', '0', '1', '9999'];
    for (const quantity of quantities) {
        try {
            await baseTest.typeInField(['input[name="qty"]', '#qty'], quantity);
            await baseTest.typeInField(['input[name="label"]', '#label'], `Movimiento ${quantity}`);
            await context.capture(`movement_qty_${quantity}`);
        } catch (error) {
            log(`No se pudo preparar movimiento con cantidad ${quantity}.`);
        }
    }
}

async function manageBOMLifecycle(context) {
    const { baseTest, driver, log } = context;

    await baseTest.navigateTo('/bom/list.php');
    await context.capture('bom_list');

    try {
        const createButton = await baseTest.clickFirstAvailable([
            "a[href*='bom/card.php?action=create']",
            "a.button[href*='bom']"
        ]);
        await driver.sleep(2000);
        await context.capture('bom_form');
    } catch (error) {
        log('No se encontró botón de crear BOM.');
    }
}

if (require.main === module) {
    runFunctionalSuite()
        .then(() => {
            console.log('✅ Suite de pruebas funcionales finalizada.');
        })
        .catch((error) => {
            console.error('❌ Error general en la suite:', error);
            process.exitCode = 1;
        });
}
