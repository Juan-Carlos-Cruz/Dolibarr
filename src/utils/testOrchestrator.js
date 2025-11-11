const { collectArtifacts } = require('./artifactUtils');
const { logTestError } = require('./errorLogger');

async function runWithArtifacts(caseId, driver, testBody) {
  let artifacts = {};

  try {
    await testBody();
    artifacts = await collectArtifacts(driver, caseId, 'ok');
  } catch (error) {
    artifacts = await collectArtifacts(driver, caseId, 'error');
    await logTestError(caseId, error, { artifacts });
    throw error;
  } finally {
    if (Object.keys(artifacts).length > 0) {
      console.log(`🗂️  Artefactos generados para ${caseId}:\n${JSON.stringify(artifacts, null, 2)}`);
    }
  }
}

module.exports = {
  runWithArtifacts
};
