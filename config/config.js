/**
 * Configuración para las pruebas de Dolibarr
 */

module.exports = {
    // Configuración de Dolibarr
    dolibarr: {
        url: 'http://localhost:8080',
        adminUser: 'admin',
        adminPass: 'admin'
    },
    
    // Configuración de Selenium
    selenium: {
        headless: false,  // Cambiar a true si no quieres ver el navegador
        implicitWait: 10000,
        pageLoadTimeout: 30000,
        scriptTimeout: 30000,
        windowSize: {
            width: 1366,
            height: 768
        }
    },
    
    // Configuración de pruebas
    testing: {
        screenshotOnError: true,
        screenshotDirectory: './reports/screenshots',
        retryAttempts: 2,
        delayBetweenTests: 1000
    }
};