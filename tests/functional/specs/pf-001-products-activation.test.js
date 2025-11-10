const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible, locators } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-001 – Activación de módulo Products', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-001-products-activation';
        await base.teardown(testName);
    });

    test('HU-001: Activar Products y guardar parámetros', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, locators.menuLink('Configuración'))).click();
        await (await expectVisible(driver, locators.menuLink('Módulos'))).click();

        await (await expectVisible(driver, By.xpath("//button[contains(., 'Products') or contains(., 'Productos')]"))).click();
        const enableButton = await expectVisible(
            driver,
            By.xpath("//button[contains(., 'Activar') or contains(., 'Enable')]")
        );
        await enableButton.click();
        const saveButton = await expectVisible(
            driver,
            By.xpath("//button[contains(., 'Guardar') or contains(., 'Save')]")
        );
        await saveButton.click();

        await expectVisible(
            driver,
            By.xpath("//*[contains(., 'Estado') and (contains(., 'Activo') or contains(., 'Enabled'))]")
        );
    });
});
