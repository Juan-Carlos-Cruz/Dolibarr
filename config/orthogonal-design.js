/**
 * Diseño de Arreglos Ortogonales L9(3^4) MEJORADO para Pruebas de Creación de Tareas en Dolibarr
 * 
 * OBJETIVO: Probar la funcionalidad de creación de tareas con 4 factores críticos
 * seleccionados mediante metodología formal multicriterio de 15 campos disponibles.
 * 
 * METODOLOGÍA: Análisis AHP (Analytic Hierarchy Process) con criterios ponderados:
 * - Impacto Funcional (40%), Variabilidad (25%), Complejidad Técnica (20%), Relevancia (15%)
 * 
 * FACTORES SELECCIONADOS (Top 4 de 15 campos):
 * F1: label (Score: 9.25) - Campo obligatorio, crítico para funcionalidad core
 * F2: task_parent (Score: 9.05) - Jerarquía de tareas, flujos de trabajo  
 * F3: userid (Score: 8.05) - Asignación de responsabilidades y permisos
 * F4: progress (Score: 8.25) - Estado fundamental de seguimiento
 */

const orthogonalDesign = {
    // Definición de factores críticos seleccionados mediante metodología formal
    factors: {
        F1_LABEL: {
            name: "Etiqueta de la Tarea",
            description: "Campo obligatorio - Título/nombre de la tarea",
            fieldName: "label",
            levels: {
                0: { name: "Corto", value: "Tarea A", description: "1-10 caracteres - Prueba límite mínimo" },
                1: { name: "Medio", value: "Desarrollo del Sistema ERP", description: "11-50 caracteres - Longitud típica" },
                2: { name: "Largo", value: "Implementación Completa del Sistema de Gestión Empresarial con Múltiples Módulos Integrados y Funcionalidades Avanzadas", description: "51+ caracteres - Prueba límite máximo" }
            }
        },
        F2_TASK_PARENT: {
            name: "Hilo de la Tarea",
            description: "SELECT desplegable - CAMPO OBLIGATORIO - Jerarquía de tareas",
            fieldName: "task_parent",
            fieldType: "select", 
            levels: {
                0: { name: "Vacío", value: "", description: "VACÍO - DEBE FALLAR (campo obligatorio)" },
                1: { name: "Opción 1", value: "first_available", description: "Seleccionar primera opción disponible - VÁLIDO" },
                2: { name: "Opción 2", value: "second_available", description: "Seleccionar segunda opción disponible - VÁLIDO" }
            }
        },
        F3_USERID: {
            name: "Asignado A",
            description: "SELECT/INPUT - Usuario responsable (vacío, SuperAdmin de lista, o escribir 'superAdmin')",
            fieldName: "userid",
            fieldType: "select_or_input",
            levels: {
                0: { name: "Sin Asignar", value: "", description: "Dejar vacío - Sin responsable asignado" },
                1: { name: "SuperAdmin Lista", value: "select_superadmin", description: "Seleccionar SuperAdmin de la lista desplegable" },
                2: { name: "SuperAdmin Escrito", value: "type_superadmin", description: "Escribir 'superAdmin' y seleccionarlo" }
            }
        },
        F4_PROGRESS: {
            name: "Progreso Inicial",
            description: "SELECT desplegable - Porcentaje en incrementos de 5% (vacío, 0%, 5%, 10%...100%)",
            fieldName: "progress",
            fieldType: "select",
            levels: {
                0: { name: "Vacío", value: "", description: "No seleccionar progreso - Campo vacío" },
                1: { name: "Medio", value: "50", description: "50% - Tarea a mitad de progreso" },
                2: { name: "Completado", value: "100", description: "100% - Tarea completada" }
            }
        }
    },

    // Matriz Ortogonal L9(3^4) - Arreglo de Taguchi
    // Cada fila representa un caso de prueba con combinación específica de niveles
    orthogonalMatrix: [
        [0, 0, 0, 0], // Caso 1
        [0, 1, 1, 1], // Caso 2
        [0, 2, 2, 2], // Caso 3
        [1, 0, 1, 2], // Caso 4
        [1, 1, 2, 0], // Caso 5
        [1, 2, 0, 1], // Caso 6
        [2, 0, 2, 1], // Caso 7
        [2, 1, 0, 2], // Caso 8
        [2, 2, 1, 0]  // Caso 9
    ],

    // Generación de casos de prueba basados en la matriz ortogonal
    generateTestCases() {
        return this.orthogonalMatrix.map((combination, index) => {
            const testCase = {
                id: index + 1,
                name: `TC_${String(index + 1).padStart(2, '0')}`,
                combination: combination,
                inputs: {
                    label: this.factors.F1_LABEL.levels[combination[0]].value,
                    task_parent: this.factors.F2_TASK_PARENT.levels[combination[1]].value,
                    userid: this.factors.F3_USERID.levels[combination[2]].value,
                    progress: this.factors.F4_PROGRESS.levels[combination[3]].value
                },
                factorLevels: {
                    label: this.factors.F1_LABEL.levels[combination[0]].name,
                    taskParent: this.factors.F2_TASK_PARENT.levels[combination[1]].name,
                    assignedUser: this.factors.F3_USERID.levels[combination[2]].name,
                    progress: this.factors.F4_PROGRESS.levels[combination[3]].name
                },
                description: `${this.factors.F1_LABEL.levels[combination[0]].name} + ${this.factors.F2_TASK_PARENT.levels[combination[1]].name} + ${this.factors.F3_USERID.levels[combination[2]].name} + ${this.factors.F4_PROGRESS.levels[combination[3]].name}`
            };
            return testCase;
        });
    },

    // Análisis de cobertura
    getCoverageAnalysis() {
        const totalCombinations = Math.pow(3, 4); // 3^4 = 81
        const selectedCombinations = this.orthogonalMatrix.length; // 9
        const reduction = ((totalCombinations - selectedCombinations) / totalCombinations * 100).toFixed(1);
        
        return {
            totalPossibleCombinations: totalCombinations,
            selectedCombinations: selectedCombinations,
            reductionPercentage: reduction,
            efficiency: `${selectedCombinations}/${totalCombinations} combinaciones (${reduction}% de reducción)`
        };
    }
};

module.exports = orthogonalDesign;