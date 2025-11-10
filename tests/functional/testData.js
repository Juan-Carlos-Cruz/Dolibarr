module.exports = {
  products: {
    physical: {
      reference: 'PF001-PHY-001',
      label: 'PF001 Producto Físico',
      weightValues: [0, 0.1, 9999],
      dimensions: { length: 10, width: 5, height: 2 },
      htsValid: '1234.56',
      htsInvalid: 'XX-INVALID'
    },
    service: {
      reference: 'PF001-SRV-001',
      label: 'PF001 Servicio'
    }
  },
  segments: ['Segmento 1', 'Segmento 2', 'Segmento 3', 'Segmento 4', 'Segmento 5'],
  warehouses: ['Principal', 'Secundario'],
  bom: {
    reference: 'BOM-PF-001',
    label: 'BOM Producto PF'
  }
};
