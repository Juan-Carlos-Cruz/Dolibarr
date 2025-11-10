const fs = require('fs');
const path = require('path');

let cachedBinaryPath = null;

function pathExists(candidate) {
    if (!candidate) {
        return false;
    }

    try {
        return fs.existsSync(candidate);
    } catch (error) {
        return false;
    }
}

async function getPuppeteerExecutable() {
    try {
        const imported = await import('puppeteer');
        const puppeteerModule = imported.default || imported;

        if (puppeteerModule && typeof puppeteerModule.executablePath === 'function') {
            const executablePath = await puppeteerModule.executablePath();
            if (executablePath) {
                return executablePath;
            }
        }
    } catch (error) {
        // Ignored: Puppeteer might not be installed
    }

    return null;
}

async function resolveChromeBinaryPath() {
    if (cachedBinaryPath) {
        return cachedBinaryPath;
    }

    const environmentCandidates = [
        process.env.CHROME_PATH,
        process.env.CHROME_BIN,
        process.env.GOOGLE_CHROME_BIN,
        process.env.BROWSER_BIN
    ];

    for (const candidate of environmentCandidates) {
        if (pathExists(candidate)) {
            cachedBinaryPath = candidate;
            return cachedBinaryPath;
        }
    }

    const knownLocations = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        path.join(process.env.HOME || '', 'AppData/Local/Google/Chrome/Application/chrome.exe'),
        path.join(process.env.ProgramFiles || '', 'Google/Chrome/Application/chrome.exe'),
        path.join(process.env['ProgramFiles(x86)'] || '', 'Google/Chrome/Application/chrome.exe')
    ].filter(Boolean);

    for (const candidate of knownLocations) {
        if (pathExists(candidate)) {
            cachedBinaryPath = candidate;
            return cachedBinaryPath;
        }
    }

    const puppeteerExecutable = await getPuppeteerExecutable();
    if (pathExists(puppeteerExecutable)) {
        cachedBinaryPath = puppeteerExecutable;
        return cachedBinaryPath;
    }

    throw new Error(
        'No se encontró un binario de Chrome o Chromium. ' +
        'Instala Google Chrome/Chromium, configura la variable de entorno CHROME_PATH ' +
        'o instala la dependencia opcional "puppeteer" para obtener un binario portable.'
    );
}

module.exports = {
    resolveChromeBinaryPath
};
