const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-005 – Consulta de precios de venta e histórico', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-005-price-consultation';
        await base.teardown(testName);
    });

    test('HU-021: Visualizar precio actual, mínimo e histórico', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Productos')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'card.php')]")
        )).click();

        await expectVisible(driver, By.xpath("//*[contains(., 'Precio mínimo') or contains(., 'Minimum price')]")
        );
        await expectVisible(driver, By.xpath("//*[contains(., 'Histórico') or contains(., 'History')]")
        );
    });
});
