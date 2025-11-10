const BasePage = require('./BasePage');

class StockMovementPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.newMovementButton = this.byCss('a[href*="/product/stock/movement_card.php?action=create"], a.button-create');
    this.quantityInput = this.byId('qty');
    this.movementTypeSelect = this.byCss('select[name="movementtype"]');
    this.warehouseSelect = this.byCss('select[name="fk_entrepot"]');
    this.reasonInput = this.byCss('input[name="label"], textarea[name="label"]');
    this.saveButton = this.byCss('input[type="submit"][name="save"], button[name="save"]');
  }

  async open(productId) {
    await this.visit(`/product/stock/movement_list.php?id=${productId}`);
    await this.waitForVisible(this.newMovementButton);
  }

  async createMovement({ quantity, type, warehouse, reason }) {
    await this.click(this.newMovementButton);
    await this.waitForVisible(this.quantityInput);
    await this.type(this.quantityInput, quantity.toString());
    await this.type(this.movementTypeSelect, type);
    await this.type(this.warehouseSelect, warehouse);
    await this.type(this.reasonInput, reason);
    await this.click(this.saveButton);
  }
}

module.exports = StockMovementPage;
