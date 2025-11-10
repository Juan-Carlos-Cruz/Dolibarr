const { Builder } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const config = require('../../config/testConfig');

async function createEdgeDriver() {
  const options = new edge.Options();
  options.addArguments('--disable-web-security');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');

  const driverPath = process.env.MSEDGEDRIVER_PATH || process.env.EDGE_DRIVER_PATH || null;
  const serviceBuilder = driverPath ? new edge.ServiceBuilder(driverPath) : new edge.ServiceBuilder();

  const driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .setEdgeService(serviceBuilder)
    .build();

  await driver.manage().setTimeouts({
    implicit: 0,
    pageLoad: config.defaultTimeout,
    script: config.defaultTimeout
  });

  return driver;
}

module.exports = {
  createEdgeDriver
};
