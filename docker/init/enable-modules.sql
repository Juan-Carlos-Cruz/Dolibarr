-- Auto-enable critical Dolibarr modules for functional regression tests
SET @entity := 1;

REPLACE INTO llx_const (name, value, type, note, visible, entity)
VALUES
  ('MAIN_MODULE_PRODUCT', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_PRODUCTS', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_SERVICE', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_SERVICES', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_STOCK', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_PRODUCTBATCH', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_PRODUCTLOT', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_PRODUCTVARIANT', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_CATEGORIE', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_MARGIN', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_BOM', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity),
  ('MAIN_MODULE_MRP', '1', 'chaine', 'Enabled for automated functional tests', 1, @entity);
