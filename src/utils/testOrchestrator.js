const { captureScreenshot, VideoRecorder } = require('./mediaUtils');

async function runWithArtifacts(caseId, driver, testBody) {
  const recorder = new VideoRecorder(caseId);
  await recorder.start();
  try {
    await testBody();
    await captureScreenshot(driver, caseId, 'ok');
  } catch (error) {
    await captureScreenshot(driver, caseId, 'error');
    throw error;
  } finally {
    await recorder.stop();
  }
}

module.exports = {
  runWithArtifacts
};
