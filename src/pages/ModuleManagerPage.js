const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ModuleManagerPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.modulesSearch = this.byCss('input#search_module, input[name="search_module"]');
  }

  async open() {
    await this.visit('/admin/modules.php');
    await this.waitForVisible(this.modulesSearch);
  }

  async enableModule(identifier) {
    let cellLocator;
    if (identifier.key) {
      cellLocator = this.byCss(`tr[data-module="${identifier.key}"]`);
    } else if (identifier.label) {
      const label = identifier.label.replace(/"/g, '\\"');
      cellLocator = this.byCss(`tr[data-module] td a.modulelabel[title*="${label}"]`);
    } else {
      throw new Error('Module identifier requires key or label');
    }

    const element = await this.waitForVisible(cellLocator);
    const row = identifier.key
      ? element
      : await element.findElement(By.xpath('./ancestor::tr[1]'));

    const className = await row.getAttribute('class');
    if (!className.includes('line-enabled')) {
      const enableButton = await row.findElement(this.byCss('a.module-enable, button[data-action="enable"]'));
      await enableButton.click();
      await this.driver.wait(async () => {
        const cls = await row.getAttribute('class');
        return cls.includes('line-enabled');
      }, 10000);
    }
  }
}

module.exports = ModuleManagerPage;
