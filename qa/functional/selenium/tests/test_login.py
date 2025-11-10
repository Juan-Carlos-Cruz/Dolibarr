import allure

from pages.login_page import LoginPage


@allure.feature("Autenticación")
class TestLogin:
    """Escenarios basados en el flujo de acceso documentado por Dolibarr."""

    @allure.story("Acceso con credenciales válidas")
    def test_login_success(self, driver, base_url, credentials):
        username, password = credentials
        login_page = LoginPage(driver, base_url)
        login_page.open()
        login_page.login(username, password)
        login_page.assert_authenticated()

    @allure.story("Bloqueo ante credenciales inválidas")
    def test_login_failure(self, driver, base_url):
        login_page = LoginPage(driver, base_url)
        login_page.open()
        login_page.login("usuario_incorrecto", "password_invalido")
        login_page.assert_authentication_failed()
