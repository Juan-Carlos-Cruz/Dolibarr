/**
 * Diseño de Arreglos Ortogonales para el listado de productos de Dolibarr (HU-017)
 *
 * Metodología:
 *  - Se identificaron cuatro factores críticos mediante análisis AHP siguiendo el plan del informe.
 *  - Para cubrirlos eficientemente se construyó una matriz L9(3^4) que reduce 81 combinaciones posibles a 9 casos.
 *  - Los factores corresponden a filtros disponibles en la UI de Dolibarr para Productos.
 */

const orthogonalDesign = {
    factors: {
        F1_VIEW_MODE: {
            name: 'Modo de vista',
            description: 'Alterna el layout de la lista de productos',
            fieldName: 'viewmode',
            levels: {
                0: { name: 'Lista', value: 'list', description: 'Vista en tabla estándar' },
                1: { name: 'Rejilla', value: 'card', description: 'Vista de tarjetas' },
                2: { name: 'Lista compacta', value: 'list_compact', description: 'Tabla con densidad alta' }
            }
        },
        F2_ORDER: {
            name: 'Ordenamiento',
            description: 'Campo + sentido de orden',
            fieldName: 'sortfield',
            levels: {
                0: { name: 'Referencia ASC', value: { field: 'ref', order: 'asc' }, description: 'Orden alfabético por referencia ascendente' },
                1: { name: 'Etiqueta DESC', value: { field: 'label', order: 'desc' }, description: 'Orden por etiqueta descendente' },
                2: { name: 'Precio ASC', value: { field: 'price_ttc', order: 'asc' }, description: 'Orden por precio de venta (IVA incluido)' }
            }
        },
        F3_TAG_FILTER: {
            name: 'Filtro por etiqueta',
            description: 'Etiqueta o categoría de producto',
            fieldName: 'tag',
            levels: {
                0: { name: 'Sin filtro', value: '', description: 'Todos los productos' },
                1: { name: 'Etiqueta ACME', value: 'ACME', description: 'Etiqueta usada en los datos maestros' },
                2: { name: 'Etiqueta Consumibles', value: 'Consumibles', description: 'Etiqueta secundaria de catálogo' }
            }
        },
        F4_PAGE_SIZE: {
            name: 'Paginación',
            description: 'Número de filas visibles',
            fieldName: 'limit',
            levels: {
                0: { name: '25 por página', value: 25, description: 'Valor por defecto' },
                1: { name: '50 por página', value: 50, description: 'Escenario medio' },
                2: { name: '100 por página', value: 100, description: 'Escenario máximo planificado' }
            }
        }
    },

    orthogonalMatrix: [
        [0, 0, 0, 0],
        [0, 1, 1, 1],
        [0, 2, 2, 2],
        [1, 0, 1, 2],
        [1, 1, 2, 0],
        [1, 2, 0, 1],
        [2, 0, 2, 1],
        [2, 1, 0, 2],
        [2, 2, 1, 0]
    ],

    generateTestCases() {
        return this.orthogonalMatrix.map((combination, index) => {
            const [viewLevel, orderLevel, tagLevel, pageLevel] = combination;
            const order = this.factors.F2_ORDER.levels[orderLevel].value;

            return {
                id: `PF-004-${index + 1}`,
                iteration: 1,
                description: `${this.factors.F1_VIEW_MODE.levels[viewLevel].name} / ${this.factors.F2_ORDER.levels[orderLevel].name} / ${this.factors.F3_TAG_FILTER.levels[tagLevel].name} / ${this.factors.F4_PAGE_SIZE.levels[pageLevel].name}`,
                inputs: {
                    viewMode: this.factors.F1_VIEW_MODE.levels[viewLevel].value,
                    sortField: order.field,
                    sortOrder: order.order,
                    tag: this.factors.F3_TAG_FILTER.levels[tagLevel].value,
                    pageSize: this.factors.F4_PAGE_SIZE.levels[pageLevel].value
                },
                factorLevels: {
                    viewMode: this.factors.F1_VIEW_MODE.levels[viewLevel].name,
                    order: this.factors.F2_ORDER.levels[orderLevel].name,
                    tag: this.factors.F3_TAG_FILTER.levels[tagLevel].name,
                    pageSize: this.factors.F4_PAGE_SIZE.levels[pageLevel].name
                }
            };
        });
    },

    getCoverageAnalysis() {
        const totalCombinations = Math.pow(3, 4);
        const selectedCombinations = this.orthogonalMatrix.length;
        const reduction = ((totalCombinations - selectedCombinations) / totalCombinations * 100).toFixed(1);

        return {
            totalPossibleCombinations: totalCombinations,
            selectedCombinations,
            reductionPercentage: `${reduction}%`,
            efficiency: `${selectedCombinations}/${totalCombinations} combinaciones evaluadas`
        };
    }
};

module.exports = orthogonalDesign;
