const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');
const data = require('../data/test-data');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-012 – Gestión de listas de materiales (BOM)', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-012-bom';
        await base.teardown(testName);
    });

    test('HU-010 al HU-014: Crear, añadir líneas y validar BOM', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Producción') or contains(., 'Manufacturing')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'bom_card.php')]")
        )).click();

        await expectVisible(driver, By.xpath(`//h1[contains(., "${data.bom.label}")]`));
        // TODO: Implementar oráculo verificando generación de documento .odt.
    });
});
