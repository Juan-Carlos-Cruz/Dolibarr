const BasePage = require('./BasePage');

class ProductsListPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.createProductButton = this.byCssOr(
      'a[href*="/product/card.php?action=create"]',
      'a#create-product-button',
      'a.button-create',
      'button[data-role="create-product"]',
      'button#create-product-button'
    );
    this.filterTagSelect = this.byCssOr(
      'select[name="search_tag"]',
      'select[name="search_categories"]',
      'select[data-testid="tag-filter"]',
      'div.select2-container input.select2-search__field'
    );
    this.viewToggleList = this.byCssOr(
      'button[data-view="list"]',
      'a.viewmode-list',
      'button[data-view="kanban-list"]',
      'button[data-role="view-list"]'
    );
    this.viewToggleGrid = this.byCssOr(
      'button[data-view="card"]',
      'a.viewmode-card',
      'button[data-view="grid"]',
      'button[data-role="view-grid"]'
    );
    this.orderByReference = this.byCssOr(
      'a[href*="sortfield=p.ref"]',
      'th a[href*="p.ref"]',
      'button[data-sort="ref"]',
      'a[data-sort="ref"]',
      'th button[data-sort-key="ref"]'
    );
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
    const select = await this.findFirstElement([this.filterTagSelect]);
    if (!select) {
      return;
    }

    try {
      await select.click();
    } catch (error) {
      // Ignore click failures (e.g., when element is a native select)
    }

    const tagInputSelectors = [
      this.byCss('div.select2-container input.select2-search__field'),
      this.byCss('input[data-role="tag-search"]')
    ];

    const selectTagInput = await this.findFirstElement(tagInputSelectors);
    if (selectTagInput) {
      await selectTagInput.clear();
      await selectTagInput.sendKeys(tagName, '\uE007');
      return;
    }

    await this.type(this.filterTagSelect, tagName);
    const element = await this.driver.findElement(this.filterTagSelect);
    await element.sendKeys('\uE007');
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
