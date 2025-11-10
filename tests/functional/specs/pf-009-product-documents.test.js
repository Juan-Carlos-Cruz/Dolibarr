const { By } = require('selenium-webdriver');
const BaseTest = require('../core/baseTest');
const { expectVisible } = require('../helpers/assertions');

const describeIf = process.env.RUN_FUNCTIONAL_TESTS === 'true' ? describe : describe.skip;

describeIf('PF-009 – Gestión de documentos vinculados a productos', () => {
    let base;

    beforeEach(async () => {
        base = new BaseTest();
        await base.setupDriver();
        await base.loginAsAdmin();
    });

    afterEach(async () => {
        const state = expect.getState();
        const testName = state.currentTestName || 'pf-009-product-documents';
        await base.teardown(testName);
    });

    test('HU-028: Subir y categorizar documentos', async () => {
        const driver = base.driver;

        await (await expectVisible(driver, By.xpath("//a[contains(., 'Productos')]")
        )).click();
        await (await expectVisible(driver, By.xpath("//a[contains(@href, 'document.php')]")
        )).click();

        await expectVisible(driver, By.xpath("//*[contains(., 'Documentos vinculados') or contains(., 'Linked files')]")
        );
        // TODO: Automatizar carga de archivos cuando se habilite el storage en CI.
    });
});
