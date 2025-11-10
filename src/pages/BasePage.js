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

  async waitForAny(locators, timeout = config.defaultTimeout) {
    const end = Date.now() + timeout;
    let lastError;
    while (Date.now() < end) {
      for (const locator of locators) {
        try {
          const elements = await this.driver.findElements(locator);
          if (elements.length > 0) {
            const element = elements[0];
            if (await element.isDisplayed().catch(() => false)) {
              return element;
            }
          }
        } catch (error) {
          lastError = error;
        }
      }
      await this.driver.sleep(250);
    }
    if (lastError) {
      throw lastError;
    }
    throw new Error('None of the expected locators became visible in time.');
  }

  async click(locator, timeout) {
    const element = await this.waitForVisible(locator, timeout);
    await element.click();
  }

  async type(locator, value, timeout) {
    const element = await this.waitForVisible(locator, timeout);
    const tag = await element.getTagName().catch(() => 'input');
    if (tag === 'select') {
      await element.sendKeys(value);
    } else {
      await element.clear();
      await element.sendKeys(value);
    }
  }

  async fillIfPresent(locator, value) {
    const elements = await this.driver.findElements(locator);
    if (elements.length === 0) {
      return;
    }
    const element = elements[0];
    const tag = await element.getTagName().catch(() => 'input');
    if (tag === 'select') {
      await element.sendKeys(value);
    } else {
      await element.clear();
      await element.sendKeys(value);
    }
  }

  async clickIfPresent(locator) {
    const elements = await this.driver.findElements(locator);
    if (elements.length > 0) {
      await elements[0].click();
    }
  }

  async typeFirst(locators, value) {
    for (const locator of locators) {
      const elements = await this.driver.findElements(locator);
      if (elements.length > 0) {
        const element = elements[0];
        const tag = await element.getTagName().catch(() => 'input');
        if (tag === 'select') {
          await element.sendKeys(value);
        } else {
          await element.clear();
          await element.sendKeys(value);
        }
        return;
      }
    }
    throw new Error('No element found to type value into.');
  }

  async clickFirst(locators) {
    for (const locator of locators) {
      const elements = await this.driver.findElements(locator);
      if (elements.length > 0) {
        await elements[0].click();
        return;
      }
    }
    throw new Error('No clickable element found for provided locators.');
  }

  byCss(selector) {
    return By.css(selector);
  }

  byId(id) {
    return By.id(id);
  }

  async scrollIntoView(element) {
    await this.driver.executeScript('arguments[0].scrollIntoView({block: "center"});', element);
  }
}

module.exports = BasePage;
