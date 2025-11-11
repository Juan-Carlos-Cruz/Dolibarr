const BasePage = require('./BasePage');

class BomPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.createBomButton = this.byCssOr(
      'a[href*="/bom/card.php?action=create"]',
      'a.button-create',
      'button[data-action="create-bom"]'
    );
    this.refInput = this.byCssOr('#ref', 'input[name="ref"]', 'input[data-testid="bom-ref"]');
    this.labelInput = this.byCssOr('#label', 'input[name="label"]', 'input[data-testid="bom-label"]');
    this.statusSelect = this.byCssOr('select[name="status"]', 'select[name="fk_statut"]');
    this.saveButton = this.byCssOr(
      'input[type="submit"][name="save"]',
      'button[name="save"]',
      'button[data-role="save-bom"]'
    );
    this.addLineButton = this.byCssOr(
      'a[href*="action=addline"]',
      'button[name="addline"]',
      'button[data-action="add-component"]'
    );
    this.componentSearch = this.byCssOr(
      'input[name="productid"]',
      'input[name="fk_product"]',
      'input[data-role="component-search"]'
    );
    this.qtyInput = this.byCssOr('input[name="qty"]', 'input[name="qty_component"]');
    this.validateButton = this.byCssOr(
      'input[name="valid"]',
      'button[name="valid"]',
      'button[data-action="validate-bom"]'
    );
    this.generateDocumentButton = this.byCssOr(
      'a[href*="/document.php?modulepart=bom"]',
      'a[href*="/document.php?modulepart=mrp"]',
      'a[data-action="generate-document"]'
    );
  }

  async openList() {
    await this.visit('/bom/bom_list.php');
    await this.waitForVisible(this.createBomButton);
  }

  async createBom({ reference, label }) {
    await this.click(this.createBomButton);
    await this.waitForVisible(this.refInput);
    await this.type(this.refInput, reference);
    await this.type(this.labelInput, label);
    await this.click(this.saveButton);
  }

  async addComponent({ productName, quantity }) {
    await this.click(this.addLineButton);
    await this.waitForVisible(this.componentSearch);
    await this.type(this.componentSearch, productName);
    await this.driver.findElement(this.componentSearch).then((input) => input.sendKeys('\uE007'));
    await this.type(this.qtyInput, quantity.toString());
    await this.click(this.saveButton);
  }

  async validateBom() {
    await this.click(this.validateButton);
    try {
      const alert = await this.driver.switchTo().alert();
      await alert.accept();
    } catch (error) {
      const confirmButton = await this.findFirstElement(
        [
          this.byCss('button.confirm'),
          this.byCss('button[data-role="confirm"]'),
          this.byXPath('//button[contains(normalize-space(.), "Confirm")]'),
          this.byXPath('//button[contains(normalize-space(.), "Validar")]')
        ]
      );
      if (confirmButton) {
        await confirmButton.click();
      }
    }
  }

  async openGeneratedDocument() {
    await this.click(this.generateDocumentButton);
  }
}

module.exports = BomPage;
