const BasePage = require('./BasePage');

class ProductMultipricePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.multiPriceTab = this.byCssOr(
      'a[href*="&tab=multiprices"]',
      'a[data-target="tab-multiprices"]',
      'button[data-target="multiprices"]',
      'a[href*="tab=mprice"]'
    );
    this.segmentRows = this.byCssOr('table#tablelines tr', 'table[data-role="multiprices"] tr');
  }

  async open() {
    await this.click(this.multiPriceTab);
    await this.waitForVisible(this.segmentRows);
  }

  async setSegmentPrice(segmentIndex, price) {
    const input = this.byCssOr(
      `input[name='multiprices[${segmentIndex}][price]']`,
      `input[name='multiprices[${segmentIndex}][price_ht]']`,
      `input[data-segment-index='${segmentIndex}']`
    );
    await this.type(input, price.toString());
  }

  async saveSegmentPrices() {
    await this.click(
      this.byCssOr(
        'input[type="submit"][name="save_multiprices"]',
        'button[name="save_multiprices"]',
        'button[data-role="save-multiprices"]'
      )
    );
  }
}

module.exports = ProductMultipricePage;
