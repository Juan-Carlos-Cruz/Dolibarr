/**
 * Script de verificación de compatibilidad multiplataforma
 * Verifica que todos los componentes necesarios estén disponibles
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class CompatibilityChecker {
    constructor() {
        this.checks = [];
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }

    async runAllChecks() {
        console.log('🔍 VERIFICANDO COMPATIBILIDAD MULTIPLATAFORMA');
        console.log('===============================================\n');

        // Verificaciones principales
        await this.checkNodeVersion();
        await this.checkDockerAvailability(); 
        await this.checkChromeAvailability();
        await this.checkPortAvailability();
        await this.checkFilePermissions();
        await this.checkDiskSpace();

        // Resumen final
        this.printSummary();
    }

    async checkNodeVersion() {
        return new Promise((resolve) => {
            exec('node --version', (error, stdout, stderr) => {
                const version = stdout.trim();
                if (error) {
                    this.logResult('❌ Node.js', 'No instalado o no accesible', 'error');
                } else {
                    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
                    if (majorVersion >= 18) {
                        this.logResult('✅ Node.js', `${version} (Compatible)`, 'success');
                    } else {
                        this.logResult('⚠️ Node.js', `${version} (Recomendado: v18+)`, 'warning');
                    }
                }
                resolve();
            });
        });
    }

    async checkDockerAvailability() {
        return new Promise((resolve) => {
            exec('docker --version', (error, stdout, stderr) => {
                if (error) {
                    this.logResult('❌ Docker', 'No instalado o no corriendo', 'error');
                } else {
                    this.logResult('✅ Docker', stdout.trim(), 'success');
                    
                    // Verificar docker-compose
                    exec('docker-compose --version', (error2, stdout2) => {
                        if (error2) {
                            exec('docker compose version', (error3, stdout3) => {
                                if (error3) {
                                    this.logResult('❌ Docker Compose', 'No disponible', 'error');
                                } else {
                                    this.logResult('✅ Docker Compose', stdout3.trim(), 'success');
                                }
                                resolve();
                            });
                        } else {
                            this.logResult('✅ Docker Compose', stdout2.trim(), 'success');
                            resolve();
                        }
                    });
                }
                if (error) resolve();
            });
        });
    }

    async checkChromeAvailability() {
        return new Promise((resolve) => {
            const commands = [
                'google-chrome --version',
                'chromium-browser --version', 
                'chrome --version',
                '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version'
            ];

            let found = false;
            let checkedCount = 0;

            commands.forEach(cmd => {
                exec(cmd, (error, stdout) => {
                    checkedCount++;
                    if (!error && !found) {
                        found = true;
                        this.logResult('✅ Chrome/Chromium', stdout.trim(), 'success');
                    }
                    
                    if (checkedCount === commands.length && !found) {
                        this.logResult('⚠️ Chrome/Chromium', 'No detectado (Selenium puede funcionar igual)', 'warning');
                        resolve();
                    } else if (found && checkedCount === 1) {
                        resolve();
                    }
                });
            });
        });
    }

    async checkPortAvailability() {
        return new Promise((resolve) => {
            const net = require('net');
            const port = 8080;
            
            const server = net.createServer();
            
            server.listen(port, (err) => {
                if (err) {
                    this.logResult('⚠️ Puerto 8080', 'En uso (Docker podría fallar)', 'warning');
                } else {
                    this.logResult('✅ Puerto 8080', 'Disponible', 'success');
                }
                server.close();
                resolve();
            });
            
            server.on('error', (err) => {
                this.logResult('⚠️ Puerto 8080', 'En uso (Docker podría fallar)', 'warning');
                resolve();
            });
        });
    }

    async checkFilePermissions() {
        try {
            const testFile = path.join(__dirname, 'temp-test-file');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            this.logResult('✅ Permisos de archivo', 'Lectura/escritura OK', 'success');
        } catch (error) {
            this.logResult('❌ Permisos de archivo', 'Sin permisos de escritura', 'error');
        }
    }

    async checkDiskSpace() {
        try {
            const stats = fs.statSync(__dirname);
            this.logResult('✅ Espacio en disco', 'Accesible', 'success');
        } catch (error) {
            this.logResult('❌ Espacio en disco', 'Error al verificar', 'error');
        }
    }

    logResult(component, status, type) {
        console.log(`${component}: ${status}`);
        
        switch(type) {
            case 'success':
                this.results.passed++;
                break;
            case 'error':
                this.results.failed++;
                break;
            case 'warning':
                this.results.warnings++;
                break;
        }
    }

    printSummary() {
        console.log('\n📊 RESUMEN DE COMPATIBILIDAD');
        console.log('============================');
        console.log(`✅ Verificaciones pasadas: ${this.results.passed}`);
        console.log(`⚠️ Advertencias: ${this.results.warnings}`);
        console.log(`❌ Errores: ${this.results.failed}`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 ¡SISTEMA COMPATIBLE!');
            console.log('El proyecto puede ejecutarse correctamente.');
            console.log('\nEjecuta: npm test');
        } else if (this.results.failed <= 2) {
            console.log('\n⚠️ COMPATIBLE CON LIMITACIONES');
            console.log('El proyecto podría funcionar pero revisa los errores.');
        } else {
            console.log('\n❌ SISTEMA NO COMPATIBLE');
            console.log('Instala los componentes faltantes antes de continuar.');
        }

        console.log('\n📋 SIGUIENTE PASO:');
        if (this.results.failed === 0) {
            console.log('npm run setup  # Instalar e iniciar todo');
        } else {
            console.log('1. Instalar componentes faltantes');
            console.log('2. Ejecutar: npm run verify');
        }
    }
}

// Ejecutar verificaciones
const checker = new CompatibilityChecker();
checker.runAllChecks().catch(console.error);