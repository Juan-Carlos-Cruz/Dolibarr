const BasePage = require('./BasePage');

class BomPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.createBomButton = this.byCss('a[href*="/bom/card.php?action=create"], a.button-create');
    this.refInput = this.byId('ref');
    this.labelInput = this.byId('label');
    this.statusSelect = this.byCss('select[name="status"]');
    this.saveButton = this.byCss('input[type="submit"][name="save"], button[name="save"]');
    this.addLineButton = this.byCss('a[href*="action=addline"], button[name="addline"]');
    this.componentSearch = this.byCss('input[name="productid"]');
    this.qtyInput = this.byCss('input[name="qty"]');
    this.validateButton = this.byCss('input[name="valid"], button[name="valid"]');
    this.generateDocumentButton = this.byCss('a[href*="/document.php?modulepart=bom"], a[href*="/document.php?modulepart=mrp"]');
  }

  async openList() {
    await this.visit('/bom/list.php');
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
    await this.driver.switchTo().alert().accept();
  }

  async openGeneratedDocument() {
    await this.click(this.generateDocumentButton);
  }
}

module.exports = BomPage;
