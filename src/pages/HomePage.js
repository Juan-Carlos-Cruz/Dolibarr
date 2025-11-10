const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.avatarMenu = this.byCss('a#topmenu-avatar, #topmenu-avatar');
    this.logoutLink = this.byCss('a[href*="/user/logout"]');
  }

  async openSetupMenu() {
    await this.click(this.byCss('#mainmenutd_setup a.tmenulink, #mainmenutd_setup a[href*="/admin/index.php"]'));
  }

  async openProductsMenu() {
    await this.click(this.byCss('#mainmenutd_products a.tmenulink, #mainmenutd_products a[href*="/product/index.php"]'));
  }

  async openStockMenu() {
    await this.click(this.byCss('#mainmenutd_stock a.tmenulink, #mainmenutd_stock a[href*="/product/stock/stockmovement.php"]'));
  }

  async openManufacturingMenu() {
    await this.click(this.byCss('#mainmenutd_mrp a.tmenulink, #mainmenutd_mrp a[href*="/mrp/index.php"]'));
  }
}

module.exports = HomePage;
