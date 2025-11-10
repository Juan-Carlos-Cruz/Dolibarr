const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');
const config = require('../../config/testConfig');

class ModuleManagerPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.modulesSearch = this.byCss('input#search_module, input[name="search_module"]');
  }

  async open() {
    await this.visit('/admin/modules.php?mainmenu=home&leftmenu=setup');
    await this.waitForAny([
      this.modulesSearch,
      this.byCss('div#modules, div.modulelist, table.liste'),
      this.byCss('form[name="formmodules"]')
    ]);
  }

  async enableModule(identifier) {
    const row = await this.findModuleRow(identifier);
    const disableSelectors = [
      this.byCss('a.module-disable'),
      this.byCss('button[data-action="disable"]'),
      this.byCss('a[href*="action=disable"]')
    ];
    const enableSelectors = [
      this.byCss('a.module-enable'),
      this.byCss('button[data-action="enable"]'),
      this.byCss('a[href*="action=enable"]')
    ];

    const disableButton = await this.findFirstInRow(row, disableSelectors);
    if (disableButton) {
      return;
    }

    const enableButton = await this.findFirstInRow(row, enableSelectors);
    if (!enableButton) {
      throw new Error(`Enable control not found for module ${identifier.key || identifier.label}`);
    }

    await this.scrollIntoView(enableButton);
    await enableButton.click();
    await this.driver.wait(async () => {
      const refreshedDisableButton = await this.findFirstInRow(row, disableSelectors);
      return Boolean(refreshedDisableButton);
    }, config.defaultTimeout);
  }

  async isModuleEnabled(identifier) {
    const row = await this.findModuleRow(identifier);
    const disableButton = await this.findFirstInRow(row, [
      this.byCss('a.module-disable'),
      this.byCss('button[data-action="disable"]'),
      this.byCss('a[href*="action=disable"]')
    ]);
    return Boolean(disableButton);
  }

  async findModuleRow(identifier) {
    const locators = [];
    if (identifier.key) {
      locators.push(this.byCss(`tr[data-module="${identifier.key}"]`));
      locators.push(this.byCss(`tr[data-modulename="${identifier.key}"]`));
      locators.push(this.byCss(`tr[id*="${identifier.key}"]`));
      locators.push(By.xpath(`//tr[contains(@data-module, "${identifier.key}")]`));
    }

    if (identifier.label) {
      const normalized = identifier.label.toLowerCase();
      locators.push(By.xpath(`//tr[.//a[contains(@class,'modulelabel')][contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${normalized}")]]`));
      locators.push(By.xpath(`//tr[.//strong[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), "${normalized}")]]`));
    }

    if (locators.length === 0) {
      throw new Error('Module identifier requires key or label');
    }

    return this.waitForAny(locators);
  }

  async findFirstInRow(row, locators) {
    for (const locator of locators) {
      const elements = await row.findElements(locator);
      if (elements.length > 0) {
        return elements[0];
      }
    }
    return null;
  }
}

module.exports = ModuleManagerPage;
