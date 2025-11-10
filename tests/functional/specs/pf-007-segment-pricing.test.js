const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-007 – Multiprecios por segmento de clientes', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-007-segment-pricing';
        await base.teardown(testName);
    });

    test('HU-006: Validar regla de fallback al segmento 1', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Productos')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'multiprices.php')]")
        )).click();

        // TODO: Implementar tabla de decisión para validar segmentos 1..5.
        await expectVisible(driver, By.xpath("//*[contains(., 'Segmento 1') or contains(., 'Level 1')]")
        );
    });
});
