/**
 * Clase base compartida por las pruebas funcionales de caja negra.
 *
 * Implementa la inicialización y destrucción del driver de Selenium, así como
 * flujos reutilizables como la autenticación del usuario administrador. De esta
 * manera cada especificación puede concentrarse en los pasos y oráculos
 * descritos en la Matriz de Requerimientos de Pruebas (MRP).
 */
const { Builder, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

class BaseTest {
    constructor() {
        this.driver = null;
        this.config = config;
    }

    /**
     * Inicializa el WebDriver respetando los parámetros del informe.
     */
    async setupDriver() {
        const options = new edge.Options();

        if (this.config.selenium.headless) {
            options.addArguments('--headless');
            options.addArguments('--disable-gpu');
        }

        options.addArguments(`--window-size=${this.config.selenium.windowSize.width},${this.config.selenium.windowSize.height}`);
        options.addArguments('--disable-web-security');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');

        let serviceBuilder;
        if (this.config.selenium.driverPath) {
            serviceBuilder = new edge.ServiceBuilder(this.config.selenium.driverPath);
        } else {
            serviceBuilder = new edge.ServiceBuilder();
        }

        this.driver = await new Builder()
            .forBrowser(this.config.selenium.browser)
            .setEdgeOptions(options)
            .setEdgeService(serviceBuilder)
            .build();

        await this.driver.manage().setTimeouts({
            implicit: this.config.selenium.implicitWait,
            pageLoad: this.config.selenium.pageLoadTimeout,
            script: this.config.selenium.scriptTimeout
        });

        return this.driver;
    }

    /**
     * Autenticación estándar para los casos funcionales.
     */
    async loginAsAdmin() {
        await this.driver.get(this.config.dolibarr.url);

        // Permite absorber el wizard inicial en instalaciones nuevas
        await this.driver.sleep(2000);

        const usernameField = await this.driver.wait(
            until.elementLocated(By.css('#username, input[name="username"], input[type="text"]')),
            this.config.selenium.implicitWait
        );

        const passwordField = await this.driver.findElement(
            By.css('#password, input[name="password"], input[type="password"]')
        );

        await usernameField.clear();
        await usernameField.sendKeys(this.config.dolibarr.adminUser);

        await passwordField.clear();
        await passwordField.sendKeys(this.config.dolibarr.adminPass);

        const loginButton = await this.driver.findElement(
            By.css('input[type="submit"], button[type="submit"], input[value*="Login"], input[value*="Conectar"]')
        );

        await loginButton.click();
        await this.driver.wait(until.urlContains('index'), this.config.selenium.pageLoadTimeout);
    }

    /**
     * Limpia el estado del driver al finalizar cada caso.
     */
    async teardown(testName, hasFailed = false) {
        if (hasFailed) {
            await this.takeScreenshot(testName);
        }

        if (this.driver) {
            await this.driver.quit();
        }
    }

    async takeScreenshot(testName) {
        if (!this.driver) {
            return;
        }

        await fs.ensureDir(this.config.evidence.screenshots);
        const fileName = `${Date.now()}-${testName.replace(/\s+/g, '-').toLowerCase()}.png`;
        const filePath = path.join(this.config.evidence.screenshots, fileName);
        const image = await this.driver.takeScreenshot();
        await fs.writeFile(filePath, image, 'base64');
        return filePath;
    }
}

module.exports = BaseTest;
