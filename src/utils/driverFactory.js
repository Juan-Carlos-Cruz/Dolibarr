const http = require('http');
const https = require('https');
const { URL } = require('url');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const edge = require('selenium-webdriver/edge');
const firefox = require('selenium-webdriver/firefox');
const config = require('../../config/testConfig');

function buildChromeOptions(settings) {
  const options = new chrome.Options();
  options.addArguments('--disable-web-security');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');

  if (settings.windowSize) {
    options.addArguments(`--window-size=${settings.windowSize}`);
  }

  if (settings.headless) {
    options.addArguments('--headless=new');
  }

  options.set('goog:loggingPrefs', { browser: 'ALL', performance: 'ALL' });
  return options;
}

function buildEdgeOptions(settings) {
  const options = new edge.Options();
  options.addArguments('--disable-web-security');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  if (settings.windowSize) {
    options.addArguments(`--window-size=${settings.windowSize}`);
  }

  if (settings.headless) {
    options.addArguments('--headless');
  }

  options.set('ms:loggingPrefs', { browser: 'ALL' });
  return options;
}

function buildFirefoxOptions(settings) {
  const options = new firefox.Options();
  if (settings.headless) {
    options.headless();
  }
  if (settings.windowSize) {
    const [width, height] = settings.windowSize.split(',').map(Number);
    if (Number.isFinite(width) && Number.isFinite(height)) {
      options.windowSize({ width, height });
    }
  }
  return options;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestStatus(urlObject, path) {
  return new Promise((resolve, reject) => {
    const client = urlObject.protocol === 'https:' ? https : http;
    const request = client.request(
      {
        hostname: urlObject.hostname,
        port: urlObject.port,
        path,
        method: 'GET',
        timeout: 5000
      },
      (response) => {
        const { statusCode } = response;
        response.resume();
        if (statusCode && statusCode >= 200 && statusCode < 400) {
          resolve(true);
        } else {
          reject(new Error(`Estado HTTP ${statusCode}`));
        }
      }
    );

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy(new Error('Timeout consultando /status'));
    });
    request.end();
  });
}

async function waitForRemoteServer(remoteUrl, timeout) {
  if (!remoteUrl) {
    return;
  }

  const start = Date.now();
  const deadline = start + timeout;
  const urlObject = new URL(remoteUrl);
  const basePath = urlObject.pathname.replace(/\/+$/, '');
  const candidates = [];

  if (basePath) {
    candidates.push(`${basePath}/status`);
  }
  candidates.push('/status');

  let lastError = null;

  while (Date.now() < deadline) {
    /* eslint-disable no-await-in-loop */
    for (const candidate of candidates) {
      try {
        await requestStatus(urlObject, candidate);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    await delay(1000);
    /* eslint-enable no-await-in-loop */
  }

  const errorMessage = lastError ? lastError.message : 'Timeout agotado';
  throw new Error(`No se pudo conectar con Selenium remoto (${remoteUrl}): ${errorMessage}`);
}

async function createWebDriver(overrides = {}) {
  const settings = { ...config.selenium, ...overrides };
  const browser = (settings.browser || 'chrome').toLowerCase();

  let builder = new Builder();

  if (settings.remoteUrl) {
    await waitForRemoteServer(settings.remoteUrl, settings.remoteReadyTimeout || 45000);
    builder = builder.usingServer(settings.remoteUrl);
  }

  switch (browser) {
    case 'chrome':
      builder = builder.forBrowser('chrome').setChromeOptions(buildChromeOptions(settings));
      break;
    case 'edge':
    case 'microsoftedge':
      builder = builder.forBrowser('MicrosoftEdge').setEdgeOptions(buildEdgeOptions(settings));
      break;
    case 'firefox':
      builder = builder.forBrowser('firefox').setFirefoxOptions(buildFirefoxOptions(settings));
      break;
    default:
      throw new Error(`Browser no soportado: ${settings.browser}`);
  }

  if (settings.acceptInsecureCerts) {
    builder = builder.setAcceptInsecureCerts(true);
  }

  const driver = await builder.build();

  await driver.manage().setTimeouts({
    implicit: settings.implicitTimeout ?? 0,
    pageLoad: config.defaultTimeout,
    script: config.defaultTimeout
  });

  return driver;
}

async function createEdgeDriver(overrides = {}) {
  return createWebDriver({ browser: 'edge', ...overrides });
}

module.exports = {
  createWebDriver,
  createEdgeDriver
};
