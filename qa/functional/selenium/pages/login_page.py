from __future__ import annotations

import allure
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class LoginPage:
    """Page Object que modela el formulario de autenticación de Dolibarr."""

    _username = (By.ID, "username")
    _password = (By.ID, "password")
    _submit = (By.CSS_SELECTOR, "button[type='submit']")
    _error = (By.CSS_SELECTOR, "div.error, div.errorbox")

    def __init__(self, driver: WebDriver, base_url: str) -> None:
        self.driver = driver
        self.base_url = f"{base_url}/index.php"
        self.wait = WebDriverWait(driver, 20)

    @allure.step("Abrir pantalla de inicio de sesión")
    def open(self) -> "LoginPage":
        self.driver.get(self.base_url)
        self.wait.until(EC.visibility_of_element_located(self._username))
        return self

    @allure.step("Autenticar usuario {username}")
    def login(self, username: str, password: str) -> None:
        user_field = self.wait.until(EC.element_to_be_clickable(self._username))
        user_field.clear()
        user_field.send_keys(username)

        password_field = self.driver.find_element(*self._password)
        password_field.clear()
        password_field.send_keys(password)

        self.driver.find_element(*self._submit).click()

    @allure.step("Validar acceso correcto")
    def assert_authenticated(self) -> None:
        self.wait.until(EC.url_contains("/index.php?mainmenu="))

    @allure.step("Validar credenciales rechazadas")
    def assert_authentication_failed(self) -> None:
        self.wait.until(EC.visibility_of_element_located(self._error))
