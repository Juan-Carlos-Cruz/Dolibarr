const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');
const data = require('../data/test-data');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-006 – Modificación de precios base y mínimos', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-006-price-update';
        await base.teardown(testName);
    });

    test('HU-022: Actualizar precio base dentro de valores límite', async () => {
        const driver = base.driver;
        await (await expectVisible(driver, By.xpath("//a[contains(., 'Productos')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'card.php')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(., 'Modificar precio') or contains(., 'Modify price')]")
        )).click();

        const priceField = await expectVisible(driver, By.css("input[name='price']"));
        await priceField.clear();
        await priceField.sendKeys(data.pricing.basePrice);
        await (await expectVisible(driver, By.css("input[name='price_min']"))).clear();
        await (await expectVisible(driver, By.css("input[name='price_min']"))).sendKeys(data.pricing.minPrice);
        await (await expectVisible(driver, By.css("input[name='tva_tx']"))).clear();
        await (await expectVisible(driver, By.css("input[name='tva_tx']"))).sendKeys(data.pricing.vatRate);
        await (await expectVisible(driver, By.css("input[type='submit']"))).click();

        await expectVisible(driver, By.xpath("//*[contains(., 'Precio base') or contains(., 'Base price')]"));
    });
});
