const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.usernameField = this.byCss('input[name="username"], input#username');
    this.passwordField = this.byCss('input[name="password"], input#password');
    this.loginButton = this.byCss('input[type="submit"][value], button[type="submit"]');
  }

  async login(username, password) {
    await this.visit('/');
    await this.type(this.usernameField, username);
    await this.type(this.passwordField, password);
    await this.click(this.loginButton);
  }
}

module.exports = LoginPage;
