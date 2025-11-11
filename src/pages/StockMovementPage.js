const BasePage = require('./BasePage');

class StockMovementPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.newMovementButton = this.byCssOr(
      'a[href*="/product/stock/movement_card.php?action=create"]',
      'a.button-create',
      'button[data-action="create-movement"]'
    );
    this.quantityInput = this.byCssOr('#qty', 'input[name="qty"]', 'input[data-role="movement-qty"]');
    this.movementTypeSelect = this.byCssOr(
      'select[name="movementtype"]',
      'select[name="type_mouvement"]',
      'input[name="movementtype"]'
    );
    this.warehouseSelect = this.byCssOr(
      'select[name="fk_entrepot"]',
      'select[name="entrepot_id"]',
      'input[name="fk_entrepot"]',
      'input[data-role="warehouse-select"]'
    );
    this.reasonInput = this.byCssOr('input[name="label"]', 'textarea[name="label"]', 'textarea[data-role="movement-reason"]');
    this.saveButton = this.byCssOr(
      'input[type="submit"][name="save"]',
      'button[name="save"]',
      'button[data-role="save-movement"]'
    );
  }

  async open(productId) {
    await this.visit(`/product/stock/movement_list.php?id=${productId}`);
    await this.waitForVisible(this.newMovementButton);
  }

  async createMovement({ quantity, type, warehouse, reason }) {
    await this.click(this.newMovementButton);
    await this.waitForVisible(this.quantityInput);
    await this.type(this.quantityInput, quantity.toString());
    await this.selectMovementType(type);
    await this.selectWarehouse(warehouse);
    await this.type(this.reasonInput, reason);
    await this.click(this.saveButton);
  }

  async selectMovementType(type) {
    const typeElement = await this.findFirstElement([this.movementTypeSelect]);
    if (!typeElement) {
      return;
    }
    const tag = await typeElement.getTagName();
    if (tag === 'select') {
      await this.type(this.movementTypeSelect, type);
    } else {
      await typeElement.clear();
      await typeElement.sendKeys(type);
    }
  }

  async selectWarehouse(warehouse) {
    const warehouseElement = await this.findFirstElement([this.warehouseSelect]);
    if (!warehouseElement) {
      return;
    }
    const tag = await warehouseElement.getTagName();
    if (tag === 'select') {
      await this.type(this.warehouseSelect, warehouse);
      const element = await this.driver.findElement(this.warehouseSelect);
      await element.sendKeys('\uE007');
    } else {
      await warehouseElement.clear();
      await warehouseElement.sendKeys(warehouse, '\uE007');
    }
  }
}

module.exports = StockMovementPage;
