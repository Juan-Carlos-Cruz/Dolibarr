export const baseProduct = {
  reference: 'PROD-AUTO-001',
  label: 'Prod Físico 001',
  weight: '0.10',
  size: '10x10x5',
  hts: '1234.56.78',
  price: '25000'
};

export const serviceProduct = {
  reference: 'SERV-AUTO-001',
  label: 'Servicio 001'
};

export const variantAttributes = {
  color: ['Rojo', 'Azul'],
  size: ['S', 'M']
};

export const bomData = {
  label: 'BOM AUTO 001',
  reference: 'BOM-AUTO-001',
  components: [
    { reference: 'PROD-AUTO-001', quantity: '2' },
    { reference: 'SERV-AUTO-001', quantity: '1' }
  ]
};

export const priceSegments = [
  { segment: '1', price: '25000' },
  { segment: '2', price: '24000' },
  { segment: '3', price: '23000' },
  { segment: '4', price: '22000' },
  { segment: '5', price: '21000' }
];
