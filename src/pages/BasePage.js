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

  byCssOr(...selectors) {
    const normalized = selectors.flat().filter(Boolean);
    if (!normalized.length) {
      throw new Error('byCssOr requires at least one selector');
    }
    return By.css(normalized.join(', '));
  }

  byXPath(expression) {
    return By.xpath(expression);
  }

  toXPathLiteral(text) {
    if (text.includes("'")) {
      if (text.includes('"')) {
        const parts = text
          .split("'")
          .map((part, index, array) => {
            const literal = `'${part}'`;
            if (index === array.length - 1) {
              return literal;
            }
            return `${literal}, "'", `;
          })
          .join('');
        return `concat(${parts})`;
      }
      return `"${text}"`;
    }
    return `'${text}'`;
  }

  byId(id) {
    return By.id(id);
  }

  async findFirstElement(locators, context = this.driver) {
    for (const locator of locators) {
      try {
        const elements = await context.findElements(locator);
        if (elements.length > 0) {
          return elements[0];
        }
      } catch (error) {
        // Ignore locator failures and try the next candidate
      }
    }
    return null;
  }
}

module.exports = BasePage;
