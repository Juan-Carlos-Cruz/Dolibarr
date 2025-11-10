module.exports = {
  baseUrl: process.env.DOLIBARR_BASE_URL || 'http://localhost:8080',
  adminUser: process.env.DOLIBARR_ADMIN_USER || 'admin',
  adminPassword: process.env.DOLIBARR_ADMIN_PASSWORD || 'admin',
  defaultTimeout: 15000,
  media: {
    screenshotDir: process.env.SCREENSHOT_DIR || 'screenshots'
  }
};
