const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');
const data = require('../data/test-data');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-003 – Visibilidad de Stock/Shipment', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-003-stock-visibility';
        await base.teardown(testName);
    });

    test('HU-003: Productos visibles y servicios ocultos', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Almacén') or contains(., 'Stock')]")
        )).click();

        await expectVisible(driver, By.xpath(`//*[contains(@class, 'liste_titre') or contains(@class, 'tagtr')]//a[contains(., "${data.products.physicalSample.label}")]`));
        const services = await driver.findElements(By.xpath(`//*[contains(@class, 'liste_titre') or contains(@class, 'tagtr')]//a[contains(., "${data.products.serviceSample.label}")]`));
        expect(services.length).toBe(0);
    });
});
