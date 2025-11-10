# Arquitectura de Aseguramiento de Calidad

Este directorio concentra la automatización de pruebas de Dolibarr 22. La
estructura está dividida en pruebas funcionales (Selenium + Allure) y
pruebas unitarias (PHPUnit), permitiendo ejecutar cada tipo de validación en
contenedores independientes.

```
qa/
├── functional/
│   ├── Dockerfile              # Imagen con Python + Selenium + Firefox
│   └── selenium/
│       ├── conftest.py         # Configuración común de Pytest y Selenium
│       ├── pages/              # Objetos de página reutilizables
│       ├── tests/              # Casos de prueba funcionales
│       ├── utils/              # Utilidades compartidas
│       ├── pytest.ini          # Parámetros estándar de ejecución
│       └── requirements.txt    # Dependencias de automatización
└── unit/
    ├── composer.json           # Dependencias de PHPUnit
    ├── phpunit.xml             # Suite y reporter
    └── tests/                  # Casos unitarios PHP
```

Los escenarios funcionales siguen el flujo de autenticación descrito en la
[documentación oficial de Dolibarr](https://wiki.dolibarr.org/) para asegurar
una cobertura fiel al comportamiento esperado del producto.

## Variables de entorno comunes

| Variable         | Descripción                                            | Valor por defecto |
| ---------------- | ------------------------------------------------------ | ----------------- |
| `BASE_URL`       | URL base del contenedor de Dolibarr.                   | `http://dolibarr` |
| `DOLI_USER`      | Usuario administrador utilizado en las pruebas.        | `admin`           |
| `DOLI_PASS`      | Contraseña del usuario administrador.                  | `admin`           |
| `SELENIUM_HEADLESS` | Ejecuta Firefox en modo headless (`true`/`false`). | `true`            |

Para personalizar estos valores copie `qa/functional/selenium/.env.example`
a `qa/functional/selenium/.env`.

## Ejecución de pruebas funcionales

1. Construya los contenedores y levante la aplicación y Allure:
   ```bash
   docker compose up -d db dolibarr allure
   ```
2. Inicie el contenedor de automatización (dejándolo en segundo plano):
   ```bash
   docker compose up -d functional-tests
   ```
3. Ejecute los casos dentro del contenedor:
   ```bash
   docker compose exec functional-tests pytest -c selenium/pytest.ini selenium/tests
   ```
4. Genere el reporte estático para que sea visible desde Dolibarr:
   ```bash
   docker compose exec functional-tests allure generate --clean reports/allure-results -o reports/allure-report
   ```

Los resultados también quedan disponibles en el servicio `allure` mediante la
URL `http://localhost:5050/allure-docker-service/projects/default/reports/latest/index.html`.

## Ejecución de pruebas unitarias

1. Instale las dependencias:
   ```bash
   docker compose run --rm phpunit composer install
   ```
2. Ejecute PHPUnit:
   ```bash
   docker compose run --rm phpunit vendor/bin/phpunit -c phpunit.xml
   ```

El reporte JUnit queda almacenado en `qa/unit/reports/phpunit-junit.xml` y puede
ser integrado en pipelines de CI/CD.
