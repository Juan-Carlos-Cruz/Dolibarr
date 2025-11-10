const { until, By } = require('selenium-webdriver');

/**
 * Ayudantes de aserciones específicos para la interfaz de Dolibarr.
 */
module.exports = {
    async expectVisible(driver, locator, timeout = 10000) {
        const element = await driver.wait(until.elementLocated(locator), timeout);
        await driver.wait(until.elementIsVisible(element), timeout);
        return element;
    },

    async expectNotPresent(driver, locator, timeout = 5000) {
        try {
            await driver.wait(until.elementLocated(locator), timeout);
        } catch (error) {
            return true;
        }
        const elements = await driver.findElements(locator);
        return elements.length === 0;
    },

    locators: {
        menuLink: (text) => By.xpath(`//a[contains(normalize-space(.), "${text}")]`),
        button: (text) => By.xpath(`//button[contains(normalize-space(.), "${text}")] | //input[@type='submit' and contains(@value, "${text}")]`)
    }
};
