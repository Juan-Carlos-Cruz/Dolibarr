const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class ModuleManagerPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.modulesSearch = this.byCssOr(
      'input#search_module',
      'input[name="search_module"]',
      'input[name="module_search"]',
      'input[name="search"]',
      'input[data-testid="module-search"]',
      'input[placeholder*="Module"]',
      'form[name*="search"] input[type="search"]'
    );
  }

  async open() {
    await this.visit('/admin/modules.php');
    await this.waitForVisible(this.modulesSearch);
  }

  async enableModule(identifier) {
    const row = await this.resolveModuleRow(identifier);
    if (!row) {
      throw new Error(`Unable to locate module row for ${JSON.stringify(identifier)}`);
    }

    if (!(await this.isModuleRowEnabled(row))) {
      const enableButton = await this.findFirstElement(
        [
          this.byCss('a.module-enable'),
          this.byCss('button[data-action="enable"]'),
          this.byCss('button[data-target="enable"]'),
          this.byCss('button[data-role="enable-module"]'),
          this.byCss('button.module-enable'),
          this.byXPath('.//button[contains(normalize-space(.), "Enable")]'),
          this.byXPath('.//a[contains(normalize-space(.), "Enable")]'),
          this.byXPath('.//button[contains(normalize-space(.), "Activar")]'),
          this.byXPath('.//a[contains(normalize-space(.), "Activar")]')
        ],
        row
      );
      if (!enableButton) {
        throw new Error(`Enable button not found for module ${JSON.stringify(identifier)}`);
      }
      await enableButton.click();
      await this.driver.wait(async () => this.isModuleRowEnabled(row), 10000);
    }
  }

  async resolveModuleRow(identifier) {
    if (!identifier || (!identifier.key && !identifier.label)) {
      throw new Error('Module identifier requires key or label');
    }

    if (identifier.key) {
      const row = await this.findFirstElement(
        [
          this.byCss(`tr[data-module="${identifier.key}"]`),
          this.byCss(`tr[data-modulename="${identifier.key}"]`),
          this.byCss(`tr[data-module-name="${identifier.key}"]`),
          this.byCss(`tr[data-key="${identifier.key}"]`),
          this.byCss(`tr[id="${identifier.key}"]`),
          this.byCss(`tr[id$="${identifier.key}"]`),
          this.byCss(`tr[data-target="${identifier.key}"]`),
          this.byCss(`tr[data-module_ref="${identifier.key}"]`)
        ]
      );
      if (row) {
        return row;
      }
    }

    const label = identifier.label || identifier.key;
    if (!label) {
      return null;
    }

    const labelLiteral = this.toXPathLiteral(label.toLowerCase());
    const rowByLabel = this.byXPath(
      `//tr[@data-module or contains(@class, 'module') or contains(@id, 'module')]
        [.//a[contains(@class, 'modulelabel') or contains(@class, 'module-name') or contains(@class, 'module-title')]
            [contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜÑ', 'abcdefghijklmnopqrstuvwxyzáéíóúüñ'), ${labelLiteral})]
         or .//span[contains(@class, 'module-name') or contains(@class, 'module-title')]
            [contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÜÑ', 'abcdefghijklmnopqrstuvwxyzáéíóúüñ'), ${labelLiteral})]
      ]`
        .replace(/\s+/g, ' ')
    );
    return this.findFirstElement([rowByLabel]);
  }

  async isModuleRowEnabled(row) {
    const className = (await row.getAttribute('class')) || '';
    if (/(^|\s)(line-enabled|enabled|active)(\s|$)/i.test(className)) {
      return true;
    }
    const dataStatus = (await row.getAttribute('data-status')) || '';
    if (/enabled|active|on/i.test(dataStatus)) {
      return true;
    }
    return false;
  }
}

module.exports = ModuleManagerPage;
