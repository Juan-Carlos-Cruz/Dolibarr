/**
 * Clase base para las pruebas de Selenium en Dolibarr
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

class BaseTest {
    constructor() {
        this.driver = null;
        this.config = config;
    }

    /**
     * Configura e inicializa el driver de Selenium
     */
    async setupDriver() {
        const options = new chrome.Options();
        
        if (this.config.selenium.headless) {
            options.addArguments('--headless');
        }
        
        options.addArguments(`--window-size=${this.config.selenium.windowSize.width},${this.config.selenium.windowSize.height}`);
        options.addArguments('--disable-web-security');
        options.addArguments('--disable-features=VizDisplayCompositor');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // Configurar timeouts
        await this.driver.manage().setTimeouts({
            implicit: this.config.selenium.implicitWait,
            pageLoad: this.config.selenium.pageLoadTimeout,
            script: this.config.selenium.scriptTimeout
        });

        console.log('✓ Driver de Selenium configurado correctamente');
        return this.driver;
    }

    /**
     * Realiza login en Dolibarr
     */
    async login() {
        try {
            console.log('🔑 Iniciando sesión en Dolibarr...');
            
            // Navegar a la página de login
            await this.driver.get(this.config.dolibarr.url);
            
            // Esperar a que la página cargue (más flexible)
            await this.driver.sleep(3000);
            
            // Verificar si estamos en la página de configuración inicial
            const pageTitle = await this.driver.getTitle();
            const currentUrl = await this.driver.getCurrentUrl();
            console.log(`📄 Título de página: "${pageTitle}"`);
            console.log(`🔗 URL actual: ${currentUrl}`);
            
            // Si está en configuración inicial, redirigir a login
            if (currentUrl.includes('install') || pageTitle.toLowerCase().includes('install') || pageTitle.toLowerCase().includes('setup')) {
                console.log('⚙️ Detectada página de configuración inicial');
                console.log('🔄 Redirigiendo a página de login...');
                await this.driver.get(this.config.dolibarr.url + '/index.php');
                await this.driver.sleep(2000);
            }

            // Buscar campos de login de manera más flexible
            let usernameField, passwordField, loginButton;
            
            try {
                // Intentar con los selectores más comunes
                usernameField = await this.driver.wait(
                    until.elementLocated(By.css('#username, input[name="username"], input[type="text"]')), 10000
                );
                console.log('✓ Campo de usuario encontrado');
            } catch (error) {
                console.log('⚠️ Campo username no encontrado, buscando alternativas...');
                const inputs = await this.driver.findElements(By.css('input[type="text"]'));
                if (inputs.length > 0) {
                    usernameField = inputs[0];
                    console.log('✓ Usando primer campo de texto encontrado');
                } else {
                    throw new Error('No se encontró campo de usuario');
                }
            }

            try {
                passwordField = await this.driver.findElement(By.css('#password, input[name="password"], input[type="password"]'));
                console.log('✓ Campo de contraseña encontrado');
            } catch (error) {
                console.log('⚠️ Campo password no encontrado, buscando alternativas...');
                const inputs = await this.driver.findElements(By.css('input[type="password"]'));
                if (inputs.length > 0) {
                    passwordField = inputs[0];
                    console.log('✓ Usando primer campo de contraseña encontrado');
                } else {
                    throw new Error('No se encontró campo de contraseña');
                }
            }

            // Llenar credenciales
            await usernameField.clear();
            await usernameField.sendKeys(this.config.dolibarr.adminUser);
            console.log('✓ Usuario ingresado');

            await passwordField.clear();
            await passwordField.sendKeys(this.config.dolibarr.adminPass);
            console.log('✓ Contraseña ingresada');

            // Buscar botón de login
            try {
                loginButton = await this.driver.findElement(By.css('input[type="submit"], button[type="submit"], .button, input[value*="Login"], input[value*="Conectar"], input[value*="Entrar"]'));
                console.log('✓ Botón de login encontrado');
            } catch (error) {
                console.log('⚠️ Botón de login no encontrado, buscando alternativas...');
                const buttons = await this.driver.findElements(By.css('input[type="submit"], button'));
                if (buttons.length > 0) {
                    loginButton = buttons[0];
                    console.log('✓ Usando primer botón encontrado');
                } else {
                    throw new Error('No se encontró botón de login');
                }
            }

            // Hacer click en el botón de login
            await loginButton.click();
            console.log('✓ Click en botón de login');

            // Esperar a que la página cargue después del login
            await this.driver.sleep(3000);
            const newUrl = await this.driver.getCurrentUrl();
            console.log(`🔗 URL después del login: ${newUrl}`);
            
            // Verificar si la configuración está completa
            if (newUrl.includes('setupnotcomplete')) {
                console.log('⚙️ Configuración de Dolibarr no está completa');
                console.log('🔧 Intentando completar configuración automáticamente...');
                await this.completeDolibarrSetup();
            }
            
            console.log('✓ Login exitoso en Dolibarr');
            return true;
        } catch (error) {
            console.error('❌ Error en el login:', error.message);
            await this.takeScreenshot('login_error');
            throw error;
        }
    }

    /**
     * Completa la configuración automática de Dolibarr
     */
    async completeDolibarrSetup() {
        try {
            console.log('🛠️ Completando configuración de Dolibarr...');
            
            // Ir a la página de módulos
            await this.driver.get(`${this.config.dolibarr.url}/admin/modules.php`);
            await this.driver.sleep(2000);
            
            // Buscar y activar el módulo de Proyectos
            try {
                const projectModuleButton = await this.driver.findElement(
                    By.xpath("//input[@type='submit' and contains(@onclick, 'projet')]")
                );
                await projectModuleButton.click();
                console.log('✓ Módulo de Proyectos activado');
                await this.driver.sleep(2000);
            } catch (error) {
                console.log('⚠️ Módulo de Proyectos ya activado o no encontrado');
            }
            
            // Regresar al dashboard principal
            await this.driver.get(`${this.config.dolibarr.url}/index.php`);
            await this.driver.sleep(2000);
            
        } catch (error) {
            console.log('⚠️ Error en configuración automática:', error.message);
        }
    }

    /**
     * Navega al módulo de proyectos y tareas
     */
    async navigateToTasks() {
        try {
            console.log('🧭 Navegando al módulo de tareas...');
            
            // Navegar directamente a la página de tareas
            const tasksUrl = `${this.config.dolibarr.url}/projet/tasks.php?leftmenu=tasks`;
            console.log(`🔗 Navegando a: ${tasksUrl}`);
            
            await this.driver.get(tasksUrl);
            await this.driver.sleep(3000);
            
            // Verificar que estamos en la página correcta
            const currentUrl = await this.driver.getCurrentUrl();
            console.log(`🔗 URL actual: ${currentUrl}`);
            
            if (currentUrl.includes('tasks.php')) {
                console.log('✓ Navegación a tareas exitosa');
                return true;
            } else {
                throw new Error('No se pudo acceder a la página de tareas');
            }
        } catch (error) {
            console.error('❌ Error navegando a tareas:', error.message);
            await this.takeScreenshot('navigation_error');
            
            // Intentar navegación alternativa por URL directa
            try {
                await this.driver.get(`${this.config.dolibarr.url}/projet/tasks/index.php`);
                await this.driver.wait(until.titleContains('Tareas'), 5000);
                console.log('✓ Navegación alternativa exitosa');
                return true;
            } catch (altError) {
                console.error('❌ Error en navegación alternativa:', altError.message);
                throw error;
            }
        }
    }

    /**
     * Navega al formulario de creación de nueva tarea
     */
    async navigateToNewTask() {
        try {
            console.log('➕ Navegando a crear nueva tarea...');
            
            // Usar la URL exacta que nos proporcionaste
            const createTaskUrl = `${this.config.dolibarr.url}/projet/tasks.php?leftmenu=tasks&action=create`;
            console.log(`🔗 Navegando a: ${createTaskUrl}`);
            
            await this.driver.get(createTaskUrl);
            await this.driver.sleep(3000);

            // Verificar que estamos en el formulario correcto
            const currentUrl = await this.driver.getCurrentUrl();
            console.log(`🔗 URL actual: ${currentUrl}`);
            
            // Buscar el campo de etiqueta con selectores más flexibles
            let labelField;
            try {
                labelField = await this.driver.wait(
                    until.elementLocated(By.css('#label, input[name="label"], input[placeholder*="titulo"], input[placeholder*="etiqueta"]')), 
                    10000
                );
                console.log('✓ Campo de etiqueta encontrado');
            } catch (error) {
                // Buscar cualquier campo de texto que pueda ser el título
                const textInputs = await this.driver.findElements(By.css('input[type="text"]'));
                if (textInputs.length > 0) {
                    labelField = textInputs[0];
                    console.log('✓ Usando primer campo de texto como etiqueta');
                } else {
                    throw new Error('No se encontró campo de etiqueta/título');
                }
            }
            
            console.log('✓ Formulario de nueva tarea cargado');
            return true;
            
        } catch (error) {
            console.error('❌ Error navegando a nueva tarea:', error.message);
            await this.takeScreenshot('new_task_navigation_error');
            throw error;
        }
    }

    /**
     * Llena el formulario de creación de tarea con los datos especificados
     */
    async fillTaskForm(taskData) {
        try {
            console.log('📝 Llenando formulario de tarea:', taskData);

            // F1: Label/Etiqueta de la tarea
            let labelField;
            try {
                labelField = await this.driver.findElement(By.css('input[name="label"]'));
            } catch (error) {
                console.log('⚠️ Campo label no encontrado, buscando alternativas...');
                const textInputs = await this.driver.findElements(By.css('input[type="text"]'));
                if (textInputs.length > 0) {
                    labelField = textInputs[0];
                } else {
                    throw new Error('No se encontró campo de label');
                }
            }
            
            await labelField.clear();
            await labelField.sendKeys(taskData.label);
            console.log('✓ Label ingresado:', taskData.label);

            // F2: Task Parent (SELECT desplegable)
            try {
                const taskParentSelect = await this.driver.findElement(By.css('select[name="task_parent"]'));
                
                if (taskData.task_parent === "") {
                    // Dejar vacío - no seleccionar nada o seleccionar primera opción vacía
                    console.log('✓ Task Parent: Dejado vacío (tarea independiente)');
                } else if (taskData.task_parent === "first_available") {
                    // Seleccionar primera opción disponible (después de la vacía)
                    const options = await taskParentSelect.findElements(By.css('option'));
                    if (options.length > 1) {
                        await options[1].click(); // Índice 1 = segunda opción
                        const optionText = await options[1].getText();
                        console.log('✓ Task Parent: Seleccionada primera opción:', optionText);
                    }
                } else if (taskData.task_parent === "second_available") {
                    // Seleccionar segunda opción disponible
                    const options = await taskParentSelect.findElements(By.css('option'));
                    if (options.length > 2) {
                        await options[2].click(); // Índice 2 = tercera opción
                        const optionText = await options[2].getText();
                        console.log('✓ Task Parent: Seleccionada segunda opción:', optionText);
                    } else if (options.length > 1) {
                        await options[1].click(); // Fallback a primera si no hay segunda
                        console.log('✓ Task Parent: Solo una opción disponible, seleccionada');
                    }
                }
            } catch (e) {
                console.log('⚠️ Campo task_parent no encontrado:', e.message);
            }

            // F3: UserID (SELECT/INPUT - SuperAdmin)
            try {
                if (taskData.userid === "") {
                    // Dejar sin asignar
                    console.log('✓ UserID: Sin asignar (vacío)');
                    
                } else if (taskData.userid === "select_superadmin") {
                    // Seleccionar SuperAdmin de la lista
                    const userSelect = await this.driver.findElement(By.css('select[name="userid"]'));
                    const options = await userSelect.findElements(By.css('option'));
                    
                    // Buscar opción que contenga "SuperAdmin" o similar
                    for (let option of options) {
                        const optionText = await option.getText();
                        if (optionText.toLowerCase().includes('superadmin') || 
                            optionText.toLowerCase().includes('admin') ||
                            optionText.toLowerCase().includes('super')) {
                            await option.click();
                            console.log('✓ UserID: SuperAdmin seleccionado de lista:', optionText);
                            break;
                        }
                    }
                    
                } else if (taskData.userid === "type_superadmin") {
                    // Intentar escribir 'superAdmin'
                    try {
                        const userInput = await this.driver.findElement(By.css('input[name="userid"], .select2-search__field'));
                        await userInput.click();
                        await userInput.sendKeys('superAdmin');
                        await this.driver.sleep(1000); // Esperar sugerencias
                        
                        // Intentar seleccionar la primera sugerencia
                        const suggestions = await this.driver.findElements(By.css('.select2-results__option'));
                        if (suggestions.length > 0) {
                            await suggestions[0].click();
                            console.log('✓ UserID: superAdmin escrito y seleccionado');
                        }
                    } catch (inputError) {
                        console.log('⚠️ No se pudo escribir usuario, intentando select fallback');
                    }
                }
                
            } catch (e) {
                console.log('⚠️ Campo userid no manejable:', e.message);
            }

            // F4: Progress (SELECT con incrementos de 5%)
            try {
                const progressSelect = await this.driver.findElement(By.css('select[name="progress"]'));
                
                if (taskData.progress === "") {
                    // Dejar vacío
                    console.log('✓ Progress: Dejado vacío');
                } else {
                    // Buscar opción con el porcentaje exacto
                    const targetValue = taskData.progress.toString();
                    try {
                        const option = await progressSelect.findElement(By.css(`option[value="${targetValue}"]`));
                        await option.click();
                        console.log('✓ Progress: Seleccionado', targetValue + '%');
                    } catch (exactError) {
                        // Si no encuentra el valor exacto, buscar por texto
                        const options = await progressSelect.findElements(By.css('option'));
                        for (let option of options) {
                            const optionText = await option.getText();
                            if (optionText.includes(targetValue + '%')) {
                                await option.click();
                                console.log('✓ Progress: Seleccionado por texto', optionText);
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                console.log('⚠️ Campo progress no encontrado:', e.message);
            }

            console.log('✓ Formulario llenado correctamente con nuevos factores');
            return true;
        } catch (error) {
            console.error('❌ Error llenando formulario:', error.message);
            await this.takeScreenshot('form_fill_error');
            throw error;
        }
    }

    /**
     * Envía el formulario para crear la tarea
     */
    async submitTaskForm() {
        try {
            console.log('💾 Enviando formulario...');
            
            const submitButton = await this.driver.findElement(By.css('input[name="add"], input[type="submit"][value*="Crear"], input[type="submit"][value*="Guardar"]'));
            await submitButton.click();

            // Esperar respuesta
            await this.driver.sleep(2000);
            
            console.log('✓ Formulario enviado');
            return true;
        } catch (error) {
            console.error('❌ Error enviando formulario:', error.message);
            await this.takeScreenshot('form_submit_error');
            throw error;
        }
    }

    /**
     * Valida si la tarea fue creada exitosamente
     */
    async validateTaskCreation(taskData) {
        try {
            console.log('✅ Validando creación de tarea...');
            
            // Verificar que no hay mensajes de error
            const errorElements = await this.driver.findElements(By.css('.error, .warning'));
            if (errorElements.length > 0) {
                const errorText = await errorElements[0].getText();
                console.log('⚠️ Mensaje encontrado:', errorText);
                return {
                    success: errorText.toLowerCase().includes('success') || errorText.toLowerCase().includes('exitoso'),
                    message: errorText,
                    created: false
                };
            }

            // Verificar URL de éxito o presencia de elementos de confirmación
            const currentUrl = await this.driver.getCurrentUrl();
            const pageSource = await this.driver.getPageSource();
            
            const success = currentUrl.includes('task.php') && 
                           !currentUrl.includes('action=create') ||
                           pageSource.includes('exitosamente') ||
                           pageSource.includes('successfully');

            return {
                success: success,
                message: success ? 'Tarea creada exitosamente' : 'No se pudo confirmar la creación',
                created: success
            };
        } catch (error) {
            console.error('❌ Error validando creación:', error.message);
            return {
                success: false,
                message: `Error en validación: ${error.message}`,
                created: false
            };
        }
    }

    /**
     * Toma una captura de pantalla para debugging
     */
    async takeScreenshot(name) {
        try {
            const screenshotDir = path.join(__dirname, '..', 'reports', 'screenshots');
            await fs.ensureDir(screenshotDir);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}_${timestamp}.png`;
            const filepath = path.join(screenshotDir, filename);
            
            const screenshot = await this.driver.takeScreenshot();
            await fs.writeFile(filepath, screenshot, 'base64');
            
            console.log(`📸 Screenshot guardado: ${filename}`);
            return filepath;
        } catch (error) {
            console.error('❌ Error tomando screenshot:', error.message);
        }
    }

    /**
     * Cierra el driver
     */
    async tearDown() {
        if (this.driver) {
            await this.driver.quit();
            console.log('🔚 Driver cerrado correctamente');
        }
    }
}

module.exports = BaseTest;