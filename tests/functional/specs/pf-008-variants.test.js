const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-008 – Gestión de variantes de productos', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-008-variants';
        await base.teardown(testName);
    });

    test('HU-008: Crear y listar variantes talla/color', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Productos')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'variants.php')]")
        )).click();

        await expectVisible(driver, By.xpath("//*[contains(., 'Variantes') or contains(., 'Variants')]")
        );
        // TODO: Completar creación de atributos y validación en documentos.
    });
});
