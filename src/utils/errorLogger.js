const path = require('path');
const fs = require('fs-extra');
const config = require('../../config/testConfig');

const defaultLogRelativePath = config.reporting?.errorLogPath || path.join('reports', 'functional-test-errors.json');
const logFilePath = path.resolve(defaultLogRelativePath);
let initialized = false;

function createBaseLog(metadata = {}) {
  const now = new Date().toISOString();
  const runId = metadata.runId || `run-${Date.now()}`;
  return {
    runId,
    generatedAt: now,
    metadata: { ...metadata, runId, generatedAt: now },
    errors: []
  };
}

async function writeLogFile(content) {
  await fs.ensureDir(path.dirname(logFilePath));
  await fs.writeJson(logFilePath, content, { spaces: 2 });
}

async function ensureLogInitialized() {
  if (initialized) {
    return;
  }

  if (await fs.pathExists(logFilePath)) {
    initialized = true;
    return;
  }

  await resetErrorLog();
}

function normalizeError(error) {
  if (!error) {
    return { message: 'Unknown error', name: 'Error', stack: null };
  }

  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack || null };
  }

  if (typeof error === 'string') {
    return { message: error, name: 'Error', stack: null };
  }

  try {
    return { message: JSON.stringify(error), name: error.name || 'Error', stack: error.stack || null };
  } catch (stringifyError) {
    return { message: String(error), name: error.name || 'Error', stack: error.stack || null };
  }
}

async function appendEntry(entry) {
  await ensureLogInitialized();

  let logContent;
  try {
    logContent = await fs.readJson(logFilePath);
  } catch (readError) {
    logContent = createBaseLog();
  }

  if (!Array.isArray(logContent.errors)) {
    logContent.errors = [];
  }

  logContent.errors.push(entry);
  await writeLogFile(logContent);
}

async function resetErrorLog(metadata = {}) {
  const baseLog = createBaseLog(metadata);
  await writeLogFile(baseLog);
  initialized = true;
  return logFilePath;
}

async function logTestError(caseId, error, extra = {}) {
  const normalized = normalizeError(error);
  const entry = {
    type: 'test',
    caseId,
    timestamp: new Date().toISOString(),
    message: normalized.message,
    name: normalized.name,
    stack: normalized.stack,
    ...extra
  };

  await appendEntry(entry);
  return entry;
}

async function logFrameworkError(context, error, extra = {}) {
  const normalized = normalizeError(error);
  const entry = {
    type: 'framework',
    context,
    timestamp: new Date().toISOString(),
    message: normalized.message,
    name: normalized.name,
    stack: normalized.stack,
    ...extra
  };

  await appendEntry(entry);
  return entry;
}

function getErrorLogPath() {
  return logFilePath;
}

module.exports = {
  resetErrorLog,
  logTestError,
  logFrameworkError,
  getErrorLogPath
};
