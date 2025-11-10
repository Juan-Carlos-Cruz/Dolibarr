const BasePage = require('./BasePage');

class ProductCardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.labelInput = this.byId('label');
    this.refInput = this.byId('ref');
    this.productTypeRadio = this.byCss('input[name="type"][value="0"], input#type0');
    this.serviceTypeRadio = this.byCss('input[name="type"][value="1"], input#type1');
    this.weightInput = this.byId('weight');
    this.lengthInput = this.byId('size1');
    this.widthInput = this.byId('size2');
    this.heightInput = this.byId('size3');
    this.htsInput = this.byCss('input[name="customcode"]');
    this.statusSwitch = this.byCss('input[name="statut"]');
    this.submitButton = this.byCss('input[type="submit"][name="save"], button[name="save"]');
    this.disableButton = this.byCss('a[href*="action=confirm_disable"], button[name="disable"]');
  }

  async createProduct({ reference, label, type, weight, length, width, height, hts }) {
    await this.waitForVisible(this.labelInput);
    await this.type(this.refInput, reference);
    await this.type(this.labelInput, label);
    await this.selectType(type);
    if (weight !== undefined) {
      await this.type(this.weightInput, String(weight));
    }
    if (length !== undefined) {
      await this.type(this.lengthInput, String(length));
    }
    if (width !== undefined) {
      await this.type(this.widthInput, String(width));
    }
    if (height !== undefined) {
      await this.type(this.heightInput, String(height));
    }
    if (hts) {
      await this.type(this.htsInput, hts);
    }
    await this.click(this.submitButton);
  }

  async disableProduct() {
    await this.click(this.disableButton);
    const confirmLocator = this.byCss('button.confirm, input[type="submit"][name="confirm"], button[name="confirm"], button[class*="confirm"]');
    await this.click(confirmLocator);
  }

  async selectType(type) {
    if (!type) {
      return;
    }
    const normalized = type.toLowerCase();
    const locator = normalized.includes('service') ? this.serviceTypeRadio : this.productTypeRadio;
    const element = await this.waitForVisible(locator);
    const selected = await element.isSelected();
    if (!selected) {
      await element.click();
    }
  }
}

module.exports = ProductCardPage;
