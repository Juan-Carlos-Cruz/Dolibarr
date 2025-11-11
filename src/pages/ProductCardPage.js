const BasePage = require('./BasePage');

class ProductCardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.labelInput = this.byCssOr(
      '#label',
      'input[name="label"]',
      'input[name="productlabel"]',
      'input[data-testid="product-label"]'
    );
    this.refInput = this.byCssOr('#ref', 'input[name="ref"]', 'input[name="ref_ext"]', 'input[data-testid="product-ref"]');
    this.typeSelect = this.byCssOr('select[name="type"]', 'select#product_type');
    this.weightInput = this.byCssOr('#weight', 'input[name="weight"]', 'input[name="weight_unity"]');
    this.lengthInput = this.byCssOr('#size1', 'input[name="length"]', 'input[name="size1"]');
    this.widthInput = this.byCssOr('#size2', 'input[name="width"]', 'input[name="size2"]');
    this.heightInput = this.byCssOr('#size3', 'input[name="height"]', 'input[name="size3"]');
    this.htsInput = this.byCssOr('input[name="customcode"]', 'input[name="hs_code"]', 'input[data-testid="hts-code"]');
    this.statusSwitch = this.byCssOr('input[name="statut"]', 'input#switchstatut', 'button[data-action="toggle-status"]');
    this.submitButton = this.byCssOr(
      'input[type="submit"][name="save"]',
      'button[name="save"]',
      'button[type="submit"].butAction',
      'button[type="submit"][data-role="save"]'
    );
    this.disableButton = this.byCssOr(
      'a[href*="action=confirm_disable"]',
      'button[name="disable"]',
      'button[data-action="disable"]',
      'button[data-role="disable-product"]',
      'a[data-action="disable"]'
    );
  }

  async createProduct({ reference, label, type, weight, length, width, height, hts }) {
    await this.waitForVisible(this.labelInput);
    await this.type(this.refInput, reference);
    await this.type(this.labelInput, label);
    if (type) {
      await this.selectProductType(type);
    }
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
    const confirmation = await this.findFirstElement(
      [
        this.byCss('button.confirm'),
        this.byCss('input[type="submit"][name="confirm"]'),
        this.byCss('button[name="confirm"]'),
        this.byCss('button[data-role="confirm"]'),
        this.byXPath('//button[contains(normalize-space(.), "Confirm")]'),
        this.byXPath('//button[contains(normalize-space(.), "Confirmar")]'),
        this.byXPath('//span[contains(normalize-space(.), "Confirm")]//ancestor::button[1]')
      ]
    );
    if (confirmation) {
      await confirmation.click();
    }
  }

  async selectProductType(type) {
    const normalizedType = type.toLowerCase();
    const selectElement = await this.findFirstElement([this.typeSelect]);
    if (selectElement) {
      await this.type(this.typeSelect, type);
      return;
    }

    const radioValue = normalizedType.includes('service') ? '1' : '0';
    const radio = await this.findFirstElement(
      [
        this.byCss(`input[name="type"][value="${radioValue}"]`),
        this.byCss(`input[name="fk_product_type"][value="${radioValue}"]`),
        this.byXPath(`//input[@type='radio' and (@name='type' or @name='fk_product_type') and @value='${radioValue}']`)
      ]
    );
    if (radio) {
      await radio.click();
      return;
    }

    throw new Error('Unable to locate product type selector');
  }
}

module.exports = ProductCardPage;
