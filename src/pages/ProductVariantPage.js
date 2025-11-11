const BasePage = require('./BasePage');

class ProductVariantPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.variantTab = this.byCss('a[href*="&tab=variants"]');
    this.createAttributeButton = this.byCss('a[href*="/variants/card.php?action=create"], button[name="addattribute"]');
    this.attributeNameInput = this.byId('label');
    this.attributeValueTextarea = this.byId('variants');
    this.submitButton = this.byCss('input[type="submit"][name="save"], button[name="save"]');
    this.generateVariantButton = this.byCss('button[name="generatevariants"], input[name="generatevariants"]');
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
