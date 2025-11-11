const BasePage = require('./BasePage');
const path = require('path');

class ProductAttachmentPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.documentsTab = this.byCssOr(
      'a[href*="&tab=documents"]',
      'a[data-target="tab-documents"]',
      'button[data-target="documents"]',
      'a[href*="tab=doc"]'
    );
    this.fileInput = this.byCssOr(
      'input[type="file"][name="userfile"]',
      'input[type="file"][name="upload"]',
      'input[type="file"][data-role="document-upload"]'
    );
    this.categorySelect = this.byCssOr(
      'select[name="catid"]',
      'select[name="document_category"]',
      'select[data-role="document-category"]'
    );
    this.uploadButton = this.byCssOr(
      'input[type="submit"][name="sendit"]',
      'button[name="sendit"]',
      'button[data-role="upload-document"]',
      'button[type="submit"][name="upload"]'
    );
    this.documentsTable = this.byCssOr('table#tablelines', 'table.liste', 'table[data-role="document-list"]');
    this.documentRows = this.byCssOr(
      'table#tablelines tbody tr',
      'table[data-role="document-list"] tbody tr',
      'div.document-list table tbody tr'
    );
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
      const categoryElement = await this.findFirstElement([this.categorySelect]);
      if (categoryElement) {
        const tag = await categoryElement.getTagName();
        if (tag === 'select') {
          await this.type(this.categorySelect, categoryName);
        } else {
          await categoryElement.clear();
          await categoryElement.sendKeys(categoryName, '\uE007');
        }
      }
    }
    await this.click(this.uploadButton);
    await this.waitForVisible(this.documentsTable);
    await this.driver
      .wait(async () => {
        const rows = await this.driver.findElements(this.documentRows);
        return rows.length > 0;
      }, 10000)
      .catch(() => {});
  }
}

module.exports = ProductAttachmentPage;
