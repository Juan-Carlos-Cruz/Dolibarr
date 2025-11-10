const path = require('path');
const fs = require('fs-extra');
const config = require('../../config/testConfig');

async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
}

async function captureScreenshot(driver, caseId, status) {
  const dir = config.media.screenshotDir;
  await ensureDir(dir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${caseId}_${status}_${timestamp}.png`;
  const filePath = path.join(dir, filename);
  const screenshot = await driver.takeScreenshot();
  await fs.writeFile(filePath, screenshot, 'base64');
  return filePath;
}

module.exports = {
  captureScreenshot
};
