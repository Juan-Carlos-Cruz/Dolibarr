const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-004 – Listado de productos con filtros y ordenamientos', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-004-product-listing';
        await base.teardown(testName);
    });

    test('HU-017: Aplicar combinaciones de filtros utilizando arreglo ortogonal', async () => {
        const driver = base.driver;
        await (await expectVisible(driver, By.xpath("//a[contains(., 'Productos')]")
        )).click();

        // TODO: Implementar iteraciones L9 basadas en fixtures cuando los datos estén disponibles.
        // El siguiente assertion mantiene la estructura hasta que se agreguen los filtros.
        await expectVisible(driver, By.css('#id-right table.liste'));
    });
});
