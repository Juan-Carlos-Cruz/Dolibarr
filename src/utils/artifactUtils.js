const path = require('path');
const fs = require('fs-extra');
const config = require('../../config/testConfig');

function sanitize(value) {
  return String(value || 'unknown').replace(/[^a-z0-9-_]+/gi, '_');
}

async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
}

function buildTimestampLabel(customLabel) {
  if (customLabel) {
    return customLabel;
  }
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function captureScreenshot(driver, caseId, status, timestampLabel) {
  if (!driver) {
    return null;
  }

  const dir = config.artifacts.screenshotDir;
  await ensureDir(dir);

  const timestamp = buildTimestampLabel(timestampLabel);
  const filename = `${sanitize(caseId)}_${sanitize(status)}_${timestamp}.png`;
  const filePath = path.join(dir, filename);

  try {
    const screenshot = await driver.takeScreenshot();
    await fs.writeFile(filePath, screenshot, 'base64');
    return filePath;
  } catch (error) {
    console.warn(`⚠️ No se pudo capturar screenshot para ${caseId}: ${error.message}`);
    return null;
  }
}

async function capturePageSource(driver, caseId, status, timestampLabel) {
  if (!driver) {
    return null;
  }

  const dir = config.artifacts.pageSourceDir;
  await ensureDir(dir);

  const timestamp = buildTimestampLabel(timestampLabel);
  const filename = `${sanitize(caseId)}_${sanitize(status)}_${timestamp}.html`;
  const filePath = path.join(dir, filename);

  try {
    const source = await driver.getPageSource();
    await fs.writeFile(filePath, source, 'utf8');
    return filePath;
  } catch (error) {
    console.warn(`⚠️ No se pudo capturar el HTML de ${caseId}: ${error.message}`);
    return null;
  }
}

async function captureBrowserLogs(driver, caseId, status, timestampLabel) {
  if (!driver || !driver.manage || !driver.manage().logs) {
    return null;
  }

  let entries;
  try {
    entries = await driver.manage().logs().get('browser');
  } catch (error) {
    console.warn(`⚠️ No se pudieron obtener logs del navegador para ${caseId}: ${error.message}`);
    return null;
  }

  if (!entries || entries.length === 0) {
    return null;
  }

  const dir = config.artifacts.logDir;
  await ensureDir(dir);

  const timestamp = buildTimestampLabel(timestampLabel);
  const filename = `${sanitize(caseId)}_${sanitize(status)}_${timestamp}_browser.json`;
  const filePath = path.join(dir, filename);

  const normalized = entries.map((entry) => ({
    level: entry.level && entry.level.name ? entry.level.name : entry.level,
    message: entry.message,
    timestamp: entry.timestamp
  }));

  await fs.writeJson(filePath, normalized, { spaces: 2 });
  return filePath;
}

async function collectArtifacts(driver, caseId, status, metadata = {}) {
  const timestamp = buildTimestampLabel(metadata.timestampLabel);

  await ensureDir(config.artifacts.baseDir);

  const screenshotPath = await captureScreenshot(driver, caseId, status, timestamp);
  const pageSourcePath = await capturePageSource(driver, caseId, status, timestamp);
  const browserLogPath = await captureBrowserLogs(driver, caseId, status, timestamp);

  const result = {
    status,
    timestamp,
    screenshotPath,
    pageSourcePath,
    browserLogPath
  };

  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value !== null && value !== undefined)
  );
}

module.exports = {
  captureScreenshot,
  capturePageSource,
  captureBrowserLogs,
  collectArtifacts
};
