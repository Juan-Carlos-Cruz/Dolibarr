# Dolibarr Functional Automation Suite

Automatización de pruebas funcionales para Dolibarr ERP utilizando Selenium WebDriver con Microsoft Edge, siguiendo la Matriz de Requerimientos de Pruebas PF-001 a PF-012.

## Requisitos

- Node.js 18+
- Docker y Docker Compose (para desplegar Dolibarr con la imagen `dolibarr/dolibarr:latest`)
- Microsoft Edge y su WebDriver (`msedgedriver`) disponible en `PATH` o configurado mediante `MSEDGEDRIVER_PATH` / `EDGE_DRIVER_PATH`
- `ffmpeg` instalado en el sistema (puedes definir `FFMPEG_PATH` si no está en el `PATH`) y un servidor X11/Xvfb disponible para la captura de vídeo

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
- `SCREENSHOT_DIR`, `VIDEO_DIR`, `VIDEO_RESOLUTION`, `VIDEO_FRAMERATE`, `DISPLAY`: personalización de artefactos multimedia.

## Estructura principal

```
config/
  testConfig.js        # Configuración general y rutas de artefactos
src/
  pages/               # Page Objects para cada módulo de Dolibarr
  utils/               # Driver factory, gestión multimedia y orquestador de pruebas
tests/
  functional/          # Casos PF-001 ... PF-012
  resources/           # Datos auxiliares (ej. sample.pdf)
```

## Ejecución de pruebas

```bash
# Ejecutar la suite completa (Jest en modo secuencial)
npm test
```

> **Nota:** las pruebas generan automáticamente capturas en `screenshots/` y vídeos en `videos/` con la convención `PF-XXX_ok_TIMESTAMP.png` y `PF-XXX.mp4`.

## Grabación de vídeo y capturas

- Cada prueba inicia un proceso de captura mediante `ffmpeg` (usando el binario definido en `FFMPEG_PATH` o detectado automáticamente).
- Es necesario contar con un servidor X11/Xvfb disponible (por defecto se usa `DISPLAY=:99`).
- Los screenshots se guardan al finalizar la prueba, tanto en caso de éxito como de fallo.

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
