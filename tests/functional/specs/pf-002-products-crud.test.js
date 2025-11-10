const { By, Key } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible, locators } = require('../helpers/assertions');
const data = require('../data/test-data');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-002 – CRUD de productos físicos', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-002-products-crud';
        await base.teardown(testName);
    });

    test('HU-002: Crear, editar y desactivar producto físico', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, locators.menuLink('Productos'))).click();
        await (await expectVisible(driver, locators.button('Nuevo producto'))).click();

        await (await expectVisible(driver, By.css("input[name='label']"))).sendKeys(data.products.physicalSample.label);
        await (await expectVisible(driver, By.css("input[name='ref']"))).sendKeys(data.products.physicalSample.ref);
        await (await expectVisible(driver, By.css("select[name='type']"))).sendKeys('0');
        await (await expectVisible(driver, By.css("input[name='weight']"))).clear();
        await (await expectVisible(driver, By.css("input[name='weight']"))).sendKeys(data.products.physicalSample.weight);
        await (await expectVisible(driver, By.css("input[name='size']"))).sendKeys(data.products.physicalSample.size);
        await (await expectVisible(driver, By.css("input[name='customcode']"))).sendKeys(data.products.physicalSample.hts);
        await (await expectVisible(driver, locators.button('Crear'))).click();

        await expectVisible(driver, By.xpath(`//h1[contains(., "${data.products.physicalSample.label}")]`));

        await (await expectVisible(driver, locators.button('Modificar'))).click();
        const labelField = await expectVisible(driver, By.css("input[name='label']"));
        await labelField.sendKeys(Key.END, ' - editado');
        await (await expectVisible(driver, locators.button('Guardar'))).click();

        await expectVisible(driver, By.xpath(`//h1[contains(., "${data.products.physicalSample.label} - editado")]`));

        await (await expectVisible(driver, locators.button('Desactivar'))).click();
        await (await expectVisible(driver, locators.button('Confirmar'))).click();

        await expectVisible(
            driver,
            By.xpath("//*[contains(., 'Estado') and contains(., 'Inactivo')]")
        );
    });
});
