const BasePage = require('./BasePage');

class ProductsListPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.createProductButton = this.byCss('a[href*="/product/card.php?action=create"], a#create-product-button');
    this.filterTagSelect = this.byCss('select[name="search_tag"]');
    this.viewToggleList = this.byCss('button[data-view="list"], a.viewmode-list');
    this.viewToggleGrid = this.byCss('button[data-view="card"], a.viewmode-card');
    this.orderByReference = this.byCss('a[href*="sortfield=p.ref"], th a[href*="p.ref"]');
  }

  async open(type = 'product') {
    const typeParam = type === 'service' ? 1 : 0;
    await this.visit(`/product/list.php?type=${typeParam}`);
    await this.waitForVisible(this.createProductButton);
  }

  async goToCreateProduct() {
    await this.click(this.createProductButton);
  }

  async applyTagFilter(tagName) {
    await this.type(this.filterTagSelect, tagName);
    await this.driver.findElement(this.filterTagSelect).then((select) => select.sendKeys('\uE007'));
  }

  async toggleView(mode) {
    if (mode === 'grid') {
      await this.click(this.viewToggleGrid);
    } else {
      await this.click(this.viewToggleList);
    }
  }

  async sortByReference(desc = false) {
    await this.click(this.orderByReference);
    if (desc) {
      await this.click(this.orderByReference);
    }
  }
}

module.exports = ProductsListPage;
