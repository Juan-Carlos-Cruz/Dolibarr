/**
 * Datos de prueba reutilizables alineados a la MRP del informe.
 */
module.exports = {
    products: {
        physicalSample: {
            label: 'Prod Físico 001',
            ref: 'PF001',
            weight: '0.10',
            size: '10x10x5',
            hts: '1234.56.78'
        },
        serviceSample: {
            label: 'Servicio 001',
            ref: 'SV001'
        }
    },
    pricing: {
        basePrice: '10000',
        minPrice: '9000',
        vatRate: '19'
    },
    inventory: {
        warehouse: 'Central'
    },
    bom: {
        label: 'BOM Demo 001'
    }
};
