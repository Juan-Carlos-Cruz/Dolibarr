import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.firefox.options import Options as FirefoxOptions


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption(
        "--base-url",
        action="store",
        default=None,
        help="URL base de Dolibarr sobre la que se ejecutan las pruebas funcionales.",
    )


@pytest.fixture(scope="session")
def base_url(pytestconfig: pytest.Config) -> str:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path, override=False)
    cli_value = pytestconfig.getoption("base_url")
    url = cli_value or os.getenv("BASE_URL", "http://dolibarr")
    if url.endswith("/"):
        url = url[:-1]
    return url


@pytest.fixture(scope="session")
def credentials() -> tuple[str, str]:
    username = os.getenv("DOLI_USER", "admin")
    password = os.getenv("DOLI_PASS", "admin")
    return username, password


@pytest.fixture(scope="session")
def driver() -> webdriver.Firefox:
    options = FirefoxOptions()
    if os.getenv("SELENIUM_HEADLESS", "true").lower() in {"1", "true", "yes"}:
        options.add_argument("-headless")
    options.set_preference("intl.accept_languages", "es-ES,es")
    driver = webdriver.Firefox(options=options)
    try:
        driver.maximize_window()
    except Exception:
        driver.set_window_size(1920, 1080)
    yield driver
    driver.quit()


@pytest.fixture(autouse=True)
def reset_state(driver: webdriver.Firefox, base_url: str) -> None:
    driver.delete_all_cookies()
    driver.get(base_url)
