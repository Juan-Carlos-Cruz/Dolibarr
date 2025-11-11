const { By, until } = require('selenium-webdriver');
const config = require('../../config/testConfig');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async visit(path = '') {
    await this.driver.get(`${config.baseUrl}${path}`);
  }

  async waitForVisible(locator, timeout = config.defaultTimeout) {
    const element = await this.driver.wait(until.elementLocated(locator), timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  async click(locator, timeout) {
    const element = await this.waitForVisible(locator, timeout);
    await element.click();
  }

  async type(locator, value, timeout) {
    const element = await this.waitForVisible(locator, timeout);
    await element.clear();
    await element.sendKeys(value);
  }

  byCss(selector) {
    return By.css(selector);
  }

  byId(id) {
    return By.id(id);
  }
}

module.exports = BasePage;
