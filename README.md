# Dolibarr Functional Automation Suite

Automatización de pruebas funcionales para Dolibarr ERP utilizando Selenium WebDriver con Microsoft Edge, siguiendo la Matriz de Requerimientos de Pruebas PF-001 a PF-012.

## Requisitos

- Node.js 18+
- Docker y Docker Compose (para desplegar Dolibarr con la imagen `dolibarr/dolibarr:latest`)
- Microsoft Edge y su WebDriver (`msedgedriver`) disponible en `PATH` o configurado mediante `MSEDGEDRIVER_PATH` / `EDGE_DRIVER_PATH`

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/RoseRossi/dolibarr-orthogonal-testing.git
cd dolibarr-orthogonal-testing

# Instalar dependencias de Node.js
npm install

# (Opcional) Levantar Dolibarr con Docker
docker-compose up -d
```

## Variables de entorno clave

- `DOLIBARR_BASE_URL`: URL base de Dolibarr (por defecto `http://localhost:8080`).
- `DOLIBARR_ADMIN_USER` y `DOLIBARR_ADMIN_PASSWORD`: credenciales de administración.
- `MSEDGEDRIVER_PATH` o `EDGE_DRIVER_PATH`: ruta al ejecutable de Edge WebDriver si no está en `PATH`.
- `SCREENSHOT_DIR`: directorio donde se almacenan las capturas de pantalla generadas automáticamente.

## Estructura principal

```
config/
  testConfig.js        # Configuración general y rutas de artefactos
src/
  pages/               # Page Objects para cada módulo de Dolibarr
  utils/               # Driver factory, utilidades y orquestador de pruebas
tests/
  functional/          # Casos PF-001 ... PF-012
  resources/           # Datos auxiliares (ej. sample.pdf)
```

## Ejecución de pruebas

```bash
# Ejecutar la suite completa (Jest en modo secuencial)
npm test
```

> **Nota:** las pruebas generan automáticamente capturas en `screenshots/` con la convención `PF-XXX_ok_TIMESTAMP.png` o `PF-XXX_error_TIMESTAMP.png` según el resultado de cada caso.

## Capturas de pantalla

- Cada prueba guarda una captura final, diferenciando éxito (`ok`) o fallo (`error`).
- Puedes personalizar el directorio de salida mediante la variable `SCREENSHOT_DIR`.
- En caso de error dentro del flujo de prueba, la captura se toma inmediatamente antes de propagar la excepción para facilitar el análisis.

## Cobertura de la MRP

| ID     | Descripción resumida                              | Técnica principal |
|--------|---------------------------------------------------|-------------------|
| PF-001 | Activación de módulos necesarios                  | TD + PE           |
| PF-002 | CRUD producto físico + pesos/HTS                  | PE + VL           |
| PF-003 | Visibilidad en stock para productos vs servicios  | TD               |
| PF-004 | Listado con filtros, orden, vista rejilla/lista   | AO + TD          |
| PF-005 | Consulta de precios de venta e histórico          | VL + TD          |
| PF-006 | Modificación de precios base/mínimo/IVA           | PE + VL          |
| PF-007 | Multiprecios por segmento                         | TD + AO          |
| PF-008 | Variantes talla/color                             | TD + PE          |
| PF-009 | Documentos vinculados                             | PE               |
| PF-010 | Consulta de inventario                            | PE               |
| PF-011 | Movimientos de inventario                         | VL + TD          |
| PF-012 | Creación y validación de BOM                      | TD               |

Cada caso cuenta con su prueba automatizada nombrada con el patrón `test_pf_XXX_*`.
