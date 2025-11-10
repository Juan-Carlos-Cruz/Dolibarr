const BasePage = require('./BasePage');

class InventoryPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.inventoryTab = this.byCss('a[href*="/product/stock/card.php?id="]');
    this.movementsTable = this.byCss('table#tablelines, table.liste');
    this.filterWarehouseSelect = this.byCss('select[name="search_warehouseid"]');
  }

  async open(productId) {
    await this.visit(`/product/stock/card.php?id=${productId}`);
    await this.waitForVisible(this.movementsTable);
  }

  async filterByWarehouse(name) {
    await this.type(this.filterWarehouseSelect, name);
    await this.driver.findElement(this.filterWarehouseSelect).then((select) => select.sendKeys('\uE007'));
  }
}

module.exports = InventoryPage;
