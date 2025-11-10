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
        driverPath: process.env.MSEDGEDRIVER_PATH || process.env.EDGE_DRIVER_PATH || null,
        windowSize: {
            width: 1366,
            height: 768
        }
    },

    // Configuración de pruebas
    testing: {
        screenshotOnError: true,
        screenshotDirectory: './reports/screenshots',
        videoDirectory: './reports/videos',
        recordVideo: true,
        video: {
            format: 'mp4',
            ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
            frameRate: 12,
            display: process.env.DISPLAY || ':99',
            resolution: {
                width: 1366,
                height: 768
            }
        },
        retryAttempts: 2,
        delayBetweenTests: 1000
    }
};