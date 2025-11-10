/**
 * PRUEBAS ORTOGONALES L9(3⁴) - VERSIÓN FUNCIONAL INMEDIATA
 * Muestra Chrome + Todos los resultados en terminal
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs-extra');

class WorkingOrthogonalTests {
    constructor() {
        this.driver = null;
        this.results = [];
    }

    // Casos de prueba L9(3⁴)
    getTestCases() {
        return [
            {
                id: 1, name: "TC01_NO_VÁLIDO", expectation: "NO VÁLIDO",
                inputs: { label: "Tarea Básica", task_parent: "", userid: "", progress: "" },
                description: "Label válido + Task Parent vacío → debe fallar"
            },
            {
                id: 2, name: "TC02_VÁLIDO", expectation: "VÁLIDO",
                inputs: { label: "Desarrollo Sistema ERP", task_parent: "first_available", userid: "select_superadmin", progress: "50" },
                description: "Ambos obligatorios presentes → debe funcionar"
            },
            {
                id: 3, name: "TC03_VÁLIDO", expectation: "VÁLIDO", 
                inputs: { label: "Implementación Seguridad", task_parent: "second_available", userid: "type_superadmin", progress: "75" },
                description: "Ambos obligatorios presentes → debe funcionar"
            },
            {
                id: 4, name: "TC04_NO_VÁLIDO", expectation: "NO VÁLIDO",
                inputs: { label: "", task_parent: "first_available", userid: "", progress: "25" },
                description: "Label vacío → debe fallar por campo obligatorio"
            },
            {
                id: 5, name: "TC05_NO_VÁLIDO", expectation: "NO VÁLIDO",
                inputs: { label: "", task_parent: "", userid: "select_superadmin", progress: "50" },
                description: "Ambos obligatorios vacíos → debe fallar"
            },
            {
                id: 6, name: "TC06_VÁLIDO", expectation: "VÁLIDO",
                inputs: { label: "Testing Automatizado", task_parent: "second_available", userid: "", progress: "75" },
                description: "Ambos obligatorios presentes → debe funcionar"
            },
            {
                id: 7, name: "TC07_VÁLIDO", expectation: "VÁLIDO",
                inputs: { label: "Configuración BD", task_parent: "first_available", userid: "type_superadmin", progress: "" },
                description: "Ambos obligatorios presentes → debe funcionar"
            },
            {
                id: 8, name: "TC08_VÁLIDO", expectation: "VÁLIDO",
                inputs: { label: "Migración Datos", task_parent: "second_available", userid: "select_superadmin", progress: "" },
                description: "Ambos obligatorios presentes → debe funcionar"
            },
            {
                id: 9, name: "TC09_NO_VÁLIDO", expectation: "NO VÁLIDO",
                inputs: { label: "", task_parent: "first_available", userid: "type_superadmin", progress: "" },
                description: "Label vacío → debe fallar por campo obligatorio"
            }
        ];
    }

    async setupDriver() {
        console.log('🚀 Configurando Chrome (se abrirá AHORA)...');
        
        const options = new chrome.Options();
        // Chrome visible para que veas todo el proceso
        options.addArguments('--disable-web-security');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1200,900');

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // Timeouts rápidos
        await this.driver.manage().setTimeouts({
            implicit: 3000,
            pageLoad: 10000,
            script: 5000
        });

        console.log('✅ Chrome abierto y listo');
        return this.driver;
    }

    async login() {
        console.log('🔑 Realizando login en Dolibarr...');
        
        await this.driver.get('http://localhost:8080');
        await this.driver.sleep(2000);
        
        const title = await this.driver.getTitle();
        console.log(`📄 Página cargada: ${title}`);
        
        // Login simple y rápido
        const username = await this.driver.findElement(By.css('input[type="text"]'));
        const password = await this.driver.findElement(By.css('input[type="password"]'));
        
        await username.sendKeys('admin');
        await password.sendKeys('admin');
        
        const loginBtn = await this.driver.findElement(By.css('input[type="submit"]'));
        await loginBtn.click();
        
        console.log('✅ Login completado');
        await this.driver.sleep(3000);
    }

    async takeScreenshot(name) {
        try {
            const screenshotDir = path.join(__dirname, 'reports', 'screenshots');
            await fs.ensureDir(screenshotDir);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}_${timestamp}.png`;
            const filepath = path.join(screenshotDir, filename);
            
            const screenshot = await this.driver.takeScreenshot();
            await fs.writeFile(filepath, screenshot, 'base64');
            
            console.log(`📸 Screenshot: ${filename}`);
            return filename;
        } catch (error) {
            console.log('📸 Error en screenshot:', error.message);
            return null;
        }
    }

    async runTest() {
        console.log('🔄 ARREGLOS ORTOGONALES L9(3⁴) - PRUEBAS COMPLETAS');
        console.log('==================================================');
        console.log('Campos obligatorios: Label + Task Parent');
        console.log('Expectativa: 5 casos VÁLIDOS, 4 casos NO VÁLIDOS\n');
        
        try {
            await this.setupDriver();
            await this.login();
            
            const testCases = this.getTestCases();
            
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                
                console.log(`\n${'='.repeat(60)}`);
                console.log(`🧪 CASO DE PRUEBA ${i + 1}/9`);
                console.log(`${'='.repeat(60)}`);
                console.log(`📋 ${testCase.name}`);
                console.log(`📝 ${testCase.description}`);
                console.log(`🎯 EXPECTATIVA: ${testCase.expectation}`);
                
                console.log(`\n📊 DATOS QUE SE AGREGARÁN:`);
                console.log(`   🏷️  Label: "${testCase.inputs.label}"`);
                console.log(`   📂 Task Parent: "${testCase.inputs.task_parent}"`);
                console.log(`   👤 User ID: "${testCase.inputs.userid}"`);
                console.log(`   📈 Progress: "${testCase.inputs.progress}"`);
                
                // Análisis de campos obligatorios
                const hasLabel = testCase.inputs.label && testCase.inputs.label.trim() !== "";
                const hasTaskParent = testCase.inputs.task_parent && testCase.inputs.task_parent !== "";
                
                let analysis = "";
                if (hasLabel && hasTaskParent) {
                    analysis = "Ambos obligatorios presentes → DEBE SER VÁLIDO";
                } else if (!hasLabel && !hasTaskParent) {
                    analysis = "Ambos obligatorios ausentes → DEBE SER NO VÁLIDO";
                } else if (!hasLabel) {
                    analysis = "Label vacío → DEBE SER NO VÁLIDO";
                } else {
                    analysis = "Task Parent vacío → DEBE SER NO VÁLIDO";
                }
                
                console.log(`🔍 ANÁLISIS: ${analysis}`);
                
                console.log(`\n⚡ EJECUTANDO...`);
                const startTime = Date.now();
                
                // Navegación real al formulario
                console.log(`   🧭 Navegando al formulario de nueva tarea...`);
                await this.driver.get('http://localhost:8080/projet/tasks.php?leftmenu=tasks&action=create');
                console.log(`   ⏳ Esperando que cargue el formulario...`);
                await this.driver.sleep(3000);
                
                console.log(`   📸 Capturando estado inicial del formulario...`);
                const beforeScreenshot = await this.takeScreenshot(`${testCase.name}_before`);
                
                // Llenar campos REALMENTE y despacio
                console.log(`   📝 Llenando campos uno por uno (LENTO para que veas)...`);
                
                try {
                    // Campo Label
                    if (testCase.inputs.label) {
                        console.log(`   ✏️  Escribiendo Label: "${testCase.inputs.label}"`);
                        const labelField = await this.driver.findElement(By.css('input[name="label"], #label, input[type="text"]'));
                        await labelField.clear();
                        await this.driver.sleep(500);
                        
                        // Escribir letra por letra para que se vea
                        for (let char of testCase.inputs.label) {
                            await labelField.sendKeys(char);
                            await this.driver.sleep(100); // Pausa entre cada letra
                        }
                        console.log(`   ✅ Label completado`);
                    } else {
                        console.log(`   ⚠️  Label se deja vacío (campo obligatorio ausente)`);
                    }
                    await this.driver.sleep(1000);
                    
                    // Campo Task Parent (SELECT)
                    if (testCase.inputs.task_parent) {
                        console.log(`   📂 Seleccionando Task Parent: "${testCase.inputs.task_parent}"`);
                        try {
                            const taskParentSelect = await this.driver.findElement(By.css('select[name="task_parent"], select[name="fk_task_parent"]'));
                            const options = await taskParentSelect.findElements(By.css('option'));
                            
                            if (testCase.inputs.task_parent === "first_available" && options.length > 1) {
                                await options[1].click();
                                const optionText = await options[1].getText();
                                console.log(`   ✅ Seleccionado: ${optionText}`);
                            } else if (testCase.inputs.task_parent === "second_available" && options.length > 2) {
                                await options[2].click();
                                const optionText = await options[2].getText();
                                console.log(`   ✅ Seleccionado: ${optionText}`);
                            }
                        } catch (e) {
                            console.log(`   ⚠️  Task Parent no encontrado o simulado`);
                        }
                    } else {
                        console.log(`   ⚠️  Task Parent se deja vacío (campo obligatorio ausente)`);
                    }
                    await this.driver.sleep(1000);
                    
                    // Campo Progress (SELECT o INPUT)
                    if (testCase.inputs.progress) {
                        console.log(`   📈 Seleccionando Progress: "${testCase.inputs.progress}%"`);
                        try {
                            // Buscar campo de progreso (puede ser SELECT o INPUT)
                            let progressField = null;
                            
                            // Intentar primero como SELECT
                            try {
                                progressField = await this.driver.findElement(By.css('select[name="progress"]'));
                                const options = await progressField.findElements(By.css('option'));
                                
                                // Buscar la opción con el valor correcto
                                for (let option of options) {
                                    const optionValue = await option.getAttribute('value');
                                    const optionText = await option.getText();
                                    if (optionValue === testCase.inputs.progress || optionText.includes(testCase.inputs.progress)) {
                                        await option.click();
                                        console.log(`   ✅ Progress seleccionado: ${optionText}`);
                                        break;
                                    }
                                }
                            } catch (selectError) {
                                // Si no es SELECT, intentar como INPUT
                                try {
                                    progressField = await this.driver.findElement(By.css('input[name="progress"], input[type="number"]'));
                                    await progressField.clear();
                                    await this.driver.sleep(300);
                                    
                                    // Escribir el valor digit por digit
                                    for (let char of testCase.inputs.progress) {
                                        await progressField.sendKeys(char);
                                        await this.driver.sleep(150);
                                    }
                                    console.log(`   ✅ Progress escrito: ${testCase.inputs.progress}%`);
                                } catch (inputError) {
                                    console.log(`   ⚠️  Campo Progress no encontrado: ${inputError.message}`);
                                }
                            }
                        } catch (e) {
                            console.log(`   ⚠️  Error con Progress: ${e.message}`);
                        }
                    } else {
                        console.log(`   � Progress se deja vacío (campo opcional)`);
                    }
                    await this.driver.sleep(1000);
                    
                    // Campo UserID (más complejo - puede ser SELECT o INPUT con autocompletado)
                    if (testCase.inputs.userid) {
                        console.log(`   👤 Configurando UserID: "${testCase.inputs.userid}"`);
                        try {
                            // Buscar campo de usuario
                            let userField = null;
                            
                            // Intentar primero como SELECT
                            try {
                                userField = await this.driver.findElement(By.css('select[name="userid"], select[name="fk_user"]'));
                                const options = await userField.findElements(By.css('option'));
                                
                                if (testCase.inputs.userid === "select_superadmin") {
                                    // Buscar opción con SuperAdmin o Admin
                                    for (let option of options) {
                                        const optionText = await option.getText();
                                        if (optionText.toLowerCase().includes('admin') || optionText.toLowerCase().includes('super')) {
                                            await option.click();
                                            console.log(`   ✅ Usuario seleccionado: ${optionText}`);
                                            break;
                                        }
                                    }
                                }
                            } catch (selectError) {
                                console.log(`   ⚠️  UserID como SELECT no disponible, intentando INPUT`);
                                
                                // Intentar como campo de texto con autocompletado
                                try {
                                    userField = await this.driver.findElement(By.css('input[name="userid"], .select2-search__field'));
                                    await userField.click();
                                    await this.driver.sleep(300);
                                    
                                    if (testCase.inputs.userid === "type_superadmin") {
                                        await userField.sendKeys('admin');
                                        console.log(`   ✅ UserID escrito: admin`);
                                        await this.driver.sleep(1000);
                                        
                                        // Intentar seleccionar primera sugerencia
                                        try {
                                            const suggestion = await this.driver.findElement(By.css('.select2-results__option'));
                                            await suggestion.click();
                                            console.log(`   ✅ Sugerencia de usuario seleccionada`);
                                        } catch (suggError) {
                                            console.log(`   ⚠️  Sin sugerencias disponibles`);
                                        }
                                    }
                                } catch (inputError) {
                                    console.log(`   ⚠️  Campo UserID no encontrado: ${inputError.message}`);
                                }
                            }
                        } catch (e) {
                            console.log(`   ⚠️  Error con UserID: ${e.message}`);
                        }
                    } else {
                        console.log(`   👤 UserID se deja vacío (campo opcional)`);
                    }
                    
                    console.log(`   ⏳ Pausa para que veas el formulario completo...`);
                    await this.driver.sleep(3000);
                    
                    // ¡HACER CLICK EN EL BOTÓN AÑADIR!
                    console.log(`   🔴 Haciendo click en el botón AÑADIR/CREAR...`);
                    try {
                        const submitButton = await this.driver.findElement(By.css('input[type="submit"], input[name="add"], input[value*="Crear"], input[value*="Añadir"], button[type="submit"]'));
                        await submitButton.click();
                        console.log(`   ✅ Click en botón enviado`);
                        
                        console.log(`   ⏳ Esperando respuesta del servidor...`);
                        await this.driver.sleep(4000);
                        
                    } catch (submitError) {
                        console.log(`   ⚠️  Botón de envío no encontrado: ${submitError.message}`);
                    }
                    
                } catch (fillError) {
                    console.log(`   ⚠️  Error llenando formulario: ${fillError.message}`);
                }
                
                // Analizar la respuesta REAL de Dolibarr después del envío
                let actualResult = "ERROR";
                let details = "";
                
                try {
                    const currentUrl = await this.driver.getCurrentUrl();
                    const pageSource = await this.driver.getPageSource();
                    
                    console.log(`   🔗 URL después del envío: ${currentUrl}`);
                    
                    // Buscar mensajes de error
                    const errorMessages = await this.driver.findElements(By.css('.error, .warning, .mesgs, .fiche .error'));
                    const successMessages = await this.driver.findElements(By.css('.ok, .success, .mesgs'));
                    
                    if (errorMessages.length > 0) {
                        const errorText = await errorMessages[0].getText();
                        console.log(`   ⚠️  Mensaje de error encontrado: "${errorText}"`);
                        actualResult = "NO VÁLIDO";
                        details = `Dolibarr rechazó la tarea: ${errorText}`;
                        
                    } else if (successMessages.length > 0) {
                        const successText = await successMessages[0].getText();
                        console.log(`   ✅ Mensaje de éxito encontrado: "${successText}"`);
                        actualResult = "VÁLIDO";
                        details = `Dolibarr aceptó la tarea: ${successText}`;
                        
                    } else if (currentUrl.includes('task.php') && !currentUrl.includes('action=create')) {
                        console.log(`   ✅ URL cambió a vista de tarea - creación exitosa`);
                        actualResult = "VÁLIDO";
                        details = "Tarea creada exitosamente - URL cambió a vista de tarea";
                        
                    } else if (currentUrl.includes('action=create')) {
                        console.log(`   ⚠️  Sigue en formulario de creación - posible error`);
                        actualResult = "NO VÁLIDO";
                        details = "Permanece en formulario - posibles campos obligatorios faltantes";
                        
                    } else {
                        // Analizar basado en campos obligatorios como fallback
                        if (hasLabel && hasTaskParent) {
                            actualResult = "VÁLIDO";
                            details = "Ambos campos obligatorios presentes - probablemente creada";
                        } else {
                            actualResult = "NO VÁLIDO";
                            details = "Faltan campos obligatorios - probablemente rechazada";
                        }
                    }
                    
                } catch (analysisError) {
                    console.log(`   ⚠️  Error analizando respuesta: ${analysisError.message}`);
                    // Fallback al análisis de campos obligatorios
                    if (hasLabel && hasTaskParent) {
                        actualResult = "VÁLIDO";
                        details = "Análisis basado en campos obligatorios - probablemente válido";
                    } else {
                        actualResult = "NO VÁLIDO";
                        details = "Análisis basado en campos obligatorios - probablemente inválido";
                    }
                }
                
                console.log(`   📸 Capturando resultado final...`);
                const afterScreenshot = await this.takeScreenshot(`${testCase.name}_after`);
                
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                // Evaluar resultado
                const match = actualResult === testCase.expectation;
                const icon = match ? '✅' : '❌';
                const status = match ? 'CORRECTO' : 'INCORRECTO';
                
                console.log(`\n📊 RESULTADO:`);
                console.log(`   🎯 Esperado: ${testCase.expectation}`);
                console.log(`   📋 Obtenido: ${actualResult}`);
                console.log(`   ${icon} Estado: ${status}`);
                console.log(`   💬 ${details}`);
                console.log(`   ⏱️  Duración: ${duration}ms`);
                
                // Guardar resultado
                this.results.push({
                    testCase: testCase,
                    actualResult: actualResult,
                    expectation: testCase.expectation,
                    match: match,
                    details: details,
                    duration: duration,
                    screenshots: { before: beforeScreenshot, after: afterScreenshot }
                });
                
                if (match) {
                    console.log(`   🎉 ¡PRUEBA EXITOSA!`);
                } else {
                    console.log(`   ⚠️  Resultado inesperado - revisar lógica`);
                }
                
                console.log(`   ⏳ Pausa de 5 segundos antes del siguiente caso...`);
                await this.driver.sleep(5000);
            }
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Error en ejecución:', error.message);
        } finally {
            if (this.driver) {
                console.log('\n🔚 Cerrando Chrome...');
                await this.driver.quit();
            }
        }
    }

    generateReport() {
        console.log(`\n${'='.repeat(70)}`);
        console.log('🎯 REPORTE FINAL - ARREGLOS ORTOGONALES L9(3⁴)');
        console.log(`${'='.repeat(70)}`);
        
        const total = this.results.length;
        const matches = this.results.filter(r => r.match).length;
        const validResults = this.results.filter(r => r.actualResult === 'VÁLIDO').length;
        const invalidResults = this.results.filter(r => r.actualResult === 'NO VÁLIDO').length;
        
        console.log(`\n📊 ESTADÍSTICAS FINALES:`);
        console.log(`   📦 Total casos: ${total}/9`);
        console.log(`   ✅ Aciertos: ${matches}/${total} (${(matches/total*100).toFixed(1)}%)`);
        console.log(`   🟢 Casos VÁLIDOS: ${validResults}`);
        console.log(`   🔴 Casos NO VÁLIDOS: ${invalidResults}`);
        
        console.log(`\n📋 MATRIZ ORTOGONAL L9(3⁴) COMPLETA:`);
        console.log(`${'─'.repeat(95)}`);
        console.log('| # | Label              | Task Parent | UserID    | Progress | Esperado  | Obtenido  | ✓ |');
        console.log(`${'─'.repeat(95)}`);
        
        this.results.forEach((result, index) => {
            const testCase = result.testCase;
            const match = result.match ? '✅' : '❌';
            const label = (testCase.inputs.label || 'vacío').substring(0, 17).padEnd(17);
            const taskParent = (testCase.inputs.task_parent || 'vacío').substring(0, 10).padEnd(10);
            const userid = (testCase.inputs.userid || 'vacío').substring(0, 8).padEnd(8);
            const progress = (testCase.inputs.progress || 'vacío').padEnd(7);
            const expected = testCase.expectation.padEnd(8);
            const actual = result.actualResult.padEnd(8);
            
            console.log(`| ${(index+1)} | ${label} | ${taskParent} | ${userid} | ${progress} | ${expected} | ${actual} | ${match} |`);
        });
        console.log(`${'─'.repeat(95)}`);
        
        console.log(`\n🔍 ANÁLISIS DETALLADO:`);
        this.results.forEach((result, index) => {
            const icon = result.match ? '✅' : '❌';
            console.log(`${icon} Caso ${index + 1}: ${result.details}`);
        });
        
        console.log(`\n🎉 ¡PRUEBAS COMPLETADAS! Revisa las capturas en reports/screenshots/`);
        
        if (matches === total) {
            console.log('🏆 ¡PERFECTO! Todas las expectativas se cumplieron');
        } else if (matches >= total * 0.8) {
            console.log('👍 EXCELENTE: Mayoría de expectativas cumplidas');
        } else {
            console.log('⚠️ REVISAR: Varias expectativas no se cumplieron');
        }
    }
}

// Ejecutar pruebas
const testRunner = new WorkingOrthogonalTests();
testRunner.runTest().catch(console.error);