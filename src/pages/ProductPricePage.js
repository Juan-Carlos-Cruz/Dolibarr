const BasePage = require('./BasePage');

class ProductPricePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.sellPriceTab = this.byCss('a[href*="&tab=prices"]');
    this.newPriceButton = this.byCss('a[href*="action=create_price"], button[name="addprice"]');
    this.priceField = this.byId('price');
    this.priceMinField = this.byId('price_min');
    this.vatSelect = this.byCss('select[name="tva_tx"]');
    this.submitButton = this.byCss('input[type="submit"][name="save"], button[name="save"]');
    this.historicalTable = this.byCss('#tablelines, table.liste');
  }

  async openSellPriceTab() {
    await this.click(this.sellPriceTab);
    await this.waitForVisible(this.newPriceButton);
  }

  async createPrice({ price, priceMin, vatRate }) {
    await this.click(this.newPriceButton);
    await this.waitForVisible(this.priceField);
    await this.type(this.priceField, price.toString());
    if (priceMin !== undefined) {
      await this.type(this.priceMinField, priceMin.toString());
    }
    if (vatRate !== undefined) {
      await this.type(this.vatSelect, `${vatRate}%`);
    }
    await this.click(this.submitButton);
  }
}

module.exports = ProductPricePage;
