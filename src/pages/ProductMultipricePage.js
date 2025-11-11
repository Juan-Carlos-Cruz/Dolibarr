const BasePage = require('./BasePage');

class ProductMultipricePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.multiPriceTab = this.byCss('a[href*="&tab=multiprices"]');
    this.segmentRows = this.byCss('table#tablelines tr');
  }

  async open() {
    await this.click(this.multiPriceTab);
    await this.waitForVisible(this.segmentRows);
  }

  async setSegmentPrice(segmentIndex, price) {
    const input = this.byCss(`input[name="multiprices[${segmentIndex}][price]"]`);
    await this.type(input, price.toString());
  }

  async saveSegmentPrices() {
    await this.click(this.byCss('input[type="submit"][name="save_multiprices"], button[name="save_multiprices"]'));
  }
}

module.exports = ProductMultipricePage;
