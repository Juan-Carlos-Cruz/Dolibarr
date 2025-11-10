/**
 * Script de apoyo para visualizar los casos generados por el arreglo ortogonal de productos.
 *
 * Este script no ejecuta pruebas UI. Se usa para revisar rápidamente las combinaciones
 * seleccionadas en HU-017 (listado de productos) y documentar la trazabilidad PF-004.
 */

const orthogonalDesign = require('./config/orthogonal-design');

function printOrthogonalPlan() {
    const cases = orthogonalDesign.generateTestCases();
    const coverage = orthogonalDesign.getCoverageAnalysis();

    console.log('🔄 PLAN ORTOGONAL – LISTADO DE PRODUCTOS');
    console.log('==========================================\n');

    cases.forEach(testCase => {
        console.log(`🧪 ${testCase.id}`);
        console.log(`   Iteración: ${testCase.iteration}`);
        console.log(`   Descripción: ${testCase.description}`);
        console.log('   Entrada:');
        console.log(`     • viewMode  → ${testCase.inputs.viewMode}`);
        console.log(`     • sortField → ${testCase.inputs.sortField}`);
        console.log(`     • sortOrder → ${testCase.inputs.sortOrder}`);
        console.log(`     • tag       → ${testCase.inputs.tag || '∅'}`);
        console.log(`     • pageSize  → ${testCase.inputs.pageSize}`);
        console.log('');
    });

    console.log('📊 Cobertura');
    console.log(`   Combinaciones evaluadas: ${coverage.selectedCombinations}`);
    console.log(`   Total teórico: ${coverage.totalPossibleCombinations}`);
    console.log(`   Reducción: ${coverage.reductionPercentage}`);
    console.log(`   Eficiencia: ${coverage.efficiency}`);
}

printOrthogonalPlan();
