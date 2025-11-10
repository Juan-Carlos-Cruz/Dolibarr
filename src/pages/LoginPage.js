const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.usernameField = this.byCss('input[name="username"], input#username');
    this.passwordField = this.byCss('input[name="password"], input#password');
    this.loginButton = this.byCss('input[type="submit"][value], button[type="submit"]');
    this.postLoginMarker = this.byCss('#mainmenu, nav#topmenu, #id-right, div.tmenu');
  }

  async login(username, password) {
    await this.visit('/');
    await this.type(this.usernameField, username);
    await this.type(this.passwordField, password);
    await this.click(this.loginButton);
    await this.waitForVisible(this.postLoginMarker);
  }
}

module.exports = LoginPage;
