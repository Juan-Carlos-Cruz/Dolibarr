const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class PriceLevelPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.tableLocator = this.byCss('table.liste, table#tablelines');
  }

  async open() {
    const urls = [
      '/admin/dict.php?mainmenu=home&leftmenu=admindict&dictionnary=product_pricelevel',
      '/admin/dict.php?mainmenu=setup&leftmenu=admindict&dictionnary=product_pricelevel',
      '/admin/dict.php?dictionnary=product_pricelevel'
    ];

    for (const url of urls) {
      await this.visit(url);
      const tables = await this.driver.findElements(this.tableLocator);
      if (tables.length > 0) {
        await this.waitForVisible(this.tableLocator);
        return;
      }
    }

    await this.waitForVisible(this.tableLocator);
  }

  async ensurePriceLevel(name) {
    await this.open();
    const normalized = name.trim();
    const sanitized = normalized.replace(/"/g, '\\"');
    const existing = await this.driver.findElements(
      By.xpath(`//table[contains(@class,'liste') or @id='tablelines']//tr[.//td[normalize-space()="${sanitized}"]]`)
    );
    if (existing.length > 0) {
      return;
    }

    await this.typeFirst([
      this.byCss('input[name="label"], input[name="libelle"], input[name="label_new"]')
    ], normalized);
    await this.typeFirst([
      this.byCss('input[name="price"], input[name="value"]')
    ], '0');
    await this.clickFirst([
      this.byCss('input[type="submit"][name="add"], button[name="add"], button[type="submit"]')
    ]);
    await this.waitForAny([
      this.byCss('div.ok, div.notice, div.confirm'),
      this.tableLocator
    ]);
  }
}

module.exports = PriceLevelPage;
