const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-010 – Consulta de inventario por almacén', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-010-inventory-overview';
        await base.teardown(testName);
    });

    test('HU-025: Visualizar niveles de inventario y movimientos recientes', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Almacén') or contains(., 'Stock')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'fiche.php') and contains(., 'Central')]")
        )).click();

        await expectVisible(driver, By.xpath("//*[contains(., 'Movimientos') or contains(., 'Movements')]")
        );
    });
});
