const BasePage = require('./BasePage');

class ProductVariantPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.variantTab = this.byCssOr(
      'a[href*="&tab=variants"]',
      'a[data-target="tab-variants"]',
      'button[data-target="variants"]',
      'a[href*="tab=variant"]'
    );
    this.createAttributeButton = this.byCssOr(
      'a[href*="/variants/card.php?action=create"]',
      'button[name="addattribute"]',
      'button[data-action="add-attribute"]'
    );
    this.attributeNameInput = this.byCssOr('#label', 'input[name="label"]', 'input[data-testid="attribute-label"]');
    this.attributeValueTextarea = this.byCssOr('#variants', 'textarea[name="variants"]', 'textarea[data-testid="attribute-values"]');
    this.submitButton = this.byCssOr(
      'input[type="submit"][name="save"]',
      'button[name="save"]',
      'button[data-role="save-attribute"]'
    );
    this.generateVariantButton = this.byCssOr(
      'button[name="generatevariants"]',
      'input[name="generatevariants"]',
      'button[data-role="generate-variants"]',
      'a[data-action="generatevariants"]'
    );
  }

  async open() {
    await this.click(this.variantTab);
    await this.waitForVisible(this.createAttributeButton);
  }

  async createAttribute(label, values) {
    await this.click(this.createAttributeButton);
    await this.waitForVisible(this.attributeNameInput);
    await this.type(this.attributeNameInput, label);
    await this.type(this.attributeValueTextarea, values.join('\n'));
    await this.click(this.submitButton);
  }

  async generateVariants() {
    await this.click(this.generateVariantButton);
  }
}

module.exports = ProductVariantPage;
