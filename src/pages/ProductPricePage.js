const BasePage = require('./BasePage');

class ProductPricePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.sellPriceTab = this.byCssOr(
      'a[href*="&tab=prices"]',
      'a[data-target="tab-prices"]',
      'button[data-target="prices"]',
      'a[href*="tab=pric"]'
    );
    this.newPriceButton = this.byCssOr(
      'a[href*="action=create_price"]',
      'button[name="addprice"]',
      'button[data-action="add-sell-price"]',
      'a[data-action="add-price"]'
    );
    this.priceField = this.byCssOr('#price', 'input[name="price"]', 'input[data-testid="price-value"]');
    this.priceMinField = this.byCssOr('#price_min', 'input[name="price_min"]', 'input[name="price_min_ht"]');
    this.vatSelect = this.byCssOr('select[name="tva_tx"]', 'select[name="vat_rate"]', 'input[name="tva_tx"]');
    this.submitButton = this.byCssOr(
      'input[type="submit"][name="save"]',
      'button[name="save"]',
      'button[type="submit"][name="save_price"]',
      'button[data-role="submit-price"]'
    );
    this.historicalTable = this.byCssOr('#tablelines', 'table.liste', 'table[data-role="price-history"]');
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
      const vatElement = await this.findFirstElement([this.vatSelect]);
      if (vatElement) {
        const tagName = await vatElement.getTagName();
        const formatted = vatRate % 1 === 0 ? `${vatRate}` : vatRate.toString();
        if (tagName === 'select') {
          await this.waitForVisible(this.vatSelect);
          await vatElement.sendKeys(`${formatted}%`);
          await vatElement.sendKeys(formatted);
        } else {
          await vatElement.clear();
          await vatElement.sendKeys(formatted);
        }
      }
    }
    await this.click(this.submitButton);
  }
}

module.exports = ProductPricePage;
