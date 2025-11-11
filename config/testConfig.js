const path = require('path');

const defaultTimeout = Number(process.env.TEST_DEFAULT_TIMEOUT) || 15000;
const baseArtifactsDir = process.env.ARTIFACTS_DIR || path.join('reports', 'artifacts');
const screenshotDir = process.env.SCREENSHOT_DIR || path.join(baseArtifactsDir, 'screenshots');
const logDir = process.env.LOG_ARTIFACT_DIR || path.join(baseArtifactsDir, 'logs');
const pageSourceDir = process.env.PAGE_ARTIFACT_DIR || path.join(baseArtifactsDir, 'pagesource');

function parseBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return !['false', '0', 'no'].includes(String(value).toLowerCase());
}

module.exports = {
  baseUrl: process.env.DOLIBARR_BASE_URL || 'http://localhost:8080',
  adminUser: process.env.DOLIBARR_ADMIN_USER || 'admin',
  adminPassword: process.env.DOLIBARR_ADMIN_PASSWORD || 'admin',
  defaultTimeout,
  selenium: {
    browser: process.env.SELENIUM_BROWSER || 'chrome',
    remoteUrl: process.env.SELENIUM_REMOTE_URL || 'http://localhost:4444/wd/hub',
    headless: parseBoolean(process.env.SELENIUM_HEADLESS, true),
    windowSize: process.env.SELENIUM_WINDOW_SIZE || '1920,1080',
    implicitTimeout: Number(process.env.SELENIUM_IMPLICIT_TIMEOUT) || 0,
    acceptInsecureCerts: parseBoolean(process.env.SELENIUM_ACCEPT_INSECURE_CERTS, true),
    remoteReadyTimeout: Number(process.env.SELENIUM_REMOTE_READY_TIMEOUT) || 45000
  },
  artifacts: {
    baseDir: baseArtifactsDir,
    screenshotDir,
    logDir,
    pageSourceDir
  },
  reporting: {
    errorLogPath: process.env.ERROR_LOG_PATH || path.join('reports', 'functional-test-errors.json')
  }
};
