const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class WarehousePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.listTable = this.byCss('table.liste, table#tablelines');
    this.createButton = this.byCss('a[href*="warehouse/card.php?action=create"], a.button-create, a.add-button');
    this.labelInput = this.byCss('input[name="label"], input#label');
    this.saveButton = this.byCss('input[type="submit"][name="save"], button[name="save"]');
  }

  async openList() {
    await this.visit('/product/stock/warehouse/list.php?mainmenu=products&leftmenu=stock');
    await this.waitForVisible(this.listTable);
  }

  async ensureWarehouse(name) {
    await this.openList();
    const sanitized = name.replace(/"/g, '\\"');
    const existing = await this.driver.findElements(
      By.xpath(`//table[contains(@class,'liste') or @id='tablelines']//a[contains(@href,'warehouse/card.php?id')][normalize-space()="${sanitized}"]`)
    );
    if (existing.length > 0) {
      return;
    }
    await this.click(this.createButton);
    await this.type(this.labelInput, name);
    await this.fillIfPresent(this.byCss('textarea[name="address"]'), 'Dirección automática');
    await this.fillIfPresent(this.byCss('input[name="town"]'), 'Ciudad');
    await this.fillIfPresent(this.byCss('input[name="zip"]'), '00000');
    await this.fillIfPresent(this.byCss('select[name="fk_country"]'), 'Spain');
    await this.fillIfPresent(this.byCss('select[name="type"]'), 'Warehouse');
    await this.fillIfPresent(this.byCss('select[name="type"]'), 'Almacén');
    await this.click(this.saveButton);
    await this.waitForAny([
      this.byCss('div.ok, div.confirm, div.success, div.notice'),
      this.listTable
    ]);
  }
}

module.exports = WarehousePage;
