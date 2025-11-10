/**
 * Generador de dataset ortogonal PF-004 integrado con Playwright.
 *
 * Permite exportar los casos del arreglo ortogonal L9(3^4) a un archivo JSON que puede
 * ser consumido por pipelines o reportes de trazabilidad.
 */

const fs = require('fs-extra');
const path = require('path');
const orthogonalDesign = require('./config/orthogonal-design');

async function exportDataset() {
    const cases = orthogonalDesign.generateTestCases();
    const coverage = orthogonalDesign.getCoverageAnalysis();

    const payload = {
        generatedAt: new Date().toISOString(),
        coverage,
        cases
    };

    const outputDir = path.join(__dirname, 'reports');
    await fs.ensureDir(outputDir);

    const outputPath = path.join(outputDir, 'pf-004-orthogonal-cases.json');
    await fs.writeJson(outputPath, payload, { spaces: 2 });

    console.log('📁 Archivo generado:', outputPath);
    console.log('🧮 Casos exportados:', cases.length);
    console.log('📊 Reducción:', coverage.reductionPercentage);
}

exportDataset().catch(error => {
    console.error('❌ Error generando dataset ortogonal:', error);
    process.exitCode = 1;
});
