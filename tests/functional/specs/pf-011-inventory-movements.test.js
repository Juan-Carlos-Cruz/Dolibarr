const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-011 – Registro de movimientos de inventario', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-011-inventory-movements';
        await base.teardown(testName);
    });

    test('HU-026: Registrar entrada y salida respetando valores límite', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Almacén') or contains(., 'Stock')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'movement.php')]")
        )).click();

        await expectVisible(driver, By.xpath("//form[contains(@name, 'movement')]"));
        // TODO: Completar matriz de valores límite {-1,0,1,9999} en datos parametrizados.
    });
});
