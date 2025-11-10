/**
 * Configuración centralizada para las pruebas funcionales con Selenium.
 *
 * Esta configuración mantiene los valores descritos en el informe de pruebas
 * y permite ajustar rápidamente los parámetros de la ejecución UI.
 */
module.exports = {
    dolibarr: {
        url: process.env.DOLI_BASE_URL || 'http://localhost:8080',
        adminUser: process.env.DOLI_ADMIN_USER || 'admin',
        adminPass: process.env.DOLI_ADMIN_PASS || 'admin'
    },
    selenium: {
        browser: process.env.SELENIUM_BROWSER || 'MicrosoftEdge',
        headless: process.env.SELENIUM_HEADLESS === 'true',
        implicitWait: Number(process.env.SELENIUM_IMPLICIT_WAIT || 10000),
        pageLoadTimeout: Number(process.env.SELENIUM_PAGELOAD_TIMEOUT || 30000),
        scriptTimeout: Number(process.env.SELENIUM_SCRIPT_TIMEOUT || 30000),
        windowSize: {
            width: Number(process.env.SELENIUM_WINDOW_WIDTH || 1366),
            height: Number(process.env.SELENIUM_WINDOW_HEIGHT || 768)
        },
        driverPath: process.env.MSEDGEDRIVER_PATH || process.env.EDGE_DRIVER_PATH || null
    },
    evidence: {
        screenshots: process.env.SCREENSHOT_DIR || './reports/screenshots',
        traces: process.env.TRACE_DIR || './reports/traces'
    }
};
