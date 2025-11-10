const BasePage = require('./BasePage');
const path = require('path');

class ProductAttachmentPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.documentsTab = this.byCss('a[href*="&tab=documents"]');
    this.fileInput = this.byCss('input[type="file"][name="userfile"]');
    this.categorySelect = this.byCss('select[name="catid"]');
    this.uploadButton = this.byCss('input[type="submit"][name="sendit"], button[name="sendit"]');
    this.documentsTable = this.byCss('table#tablelines, table.liste');
  }

  async open() {
    await this.click(this.documentsTab);
    await this.waitForVisible(this.fileInput);
  }

  async uploadDocument(filePath, categoryName) {
    const absolutePath = path.resolve(filePath);
    const uploadInput = await this.driver.findElement(this.fileInput);
    await uploadInput.sendKeys(absolutePath);
    if (categoryName) {
      await this.type(this.categorySelect, categoryName);
    }
    await this.click(this.uploadButton);
    await this.waitForVisible(this.documentsTable);
  }
}

module.exports = ProductAttachmentPage;
