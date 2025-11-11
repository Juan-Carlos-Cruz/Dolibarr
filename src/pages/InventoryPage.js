const BasePage = require('./BasePage');

class InventoryPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.inventoryTab = this.byCssOr(
      'a[href*="/product/stock/card.php?id="]',
      'a[data-target="tab-inventory"]',
      'button[data-target="inventory"]'
    );
    this.movementsTable = this.byCssOr(
      'table#tablelines',
      'table.liste',
      'table[data-role="stock-movements"]',
      'div.table-responsive table'
    );
    this.filterWarehouseSelect = this.byCssOr(
      'select[name="search_warehouseid"]',
      'select[name="search_entrepot"]',
      'input[name="search_warehouse"]',
      'input[data-role="warehouse-filter"]'
    );
  }

  async open(productId) {
    await this.visit(`/product/stock/card.php?id=${productId}`);
    await this.waitForVisible(this.movementsTable);
  }

  async filterByWarehouse(name) {
    const filterElement = await this.findFirstElement([this.filterWarehouseSelect]);
    if (!filterElement) {
      return;
    }

    const tag = await filterElement.getTagName();
    if (tag === 'select') {
      await this.type(this.filterWarehouseSelect, name);
      const select = await this.driver.findElement(this.filterWarehouseSelect);
      await select.sendKeys('\uE007');
      return;
    }

    await filterElement.clear();
    await filterElement.sendKeys(name, '\uE007');
  }
}

module.exports = InventoryPage;
