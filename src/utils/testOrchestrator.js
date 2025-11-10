const { captureScreenshot } = require('./mediaUtils');

async function runWithArtifacts(caseId, driver, testBody) {
  try {
    await testBody();
    await captureScreenshot(driver, caseId, 'ok');
  } catch (error) {
    await captureScreenshot(driver, caseId, 'error');
    throw error;
  }
}

module.exports = {
  runWithArtifacts
};
