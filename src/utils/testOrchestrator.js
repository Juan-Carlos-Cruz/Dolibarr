const { captureScreenshot } = require('./artifactUtils');
const { logTestError } = require('./errorLogger');

async function runWithArtifacts(caseId, driver, testBody) {
  try {
    await testBody();
    await captureScreenshot(driver, caseId, 'ok');
  } catch (error) {
    const screenshotPath = await captureScreenshot(driver, caseId, 'error');
    await logTestError(caseId, error, { screenshotPath });
    throw error;
  }
}

module.exports = {
  runWithArtifacts
};
