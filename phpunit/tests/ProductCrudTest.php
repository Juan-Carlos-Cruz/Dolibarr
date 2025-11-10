<?php

require_once __DIR__ . '/DolibarrTestCase.php';

final class ProductCrudTest extends DolibarrTestCase
{
    public function testValidateFieldsRejectsEmptyLabel(): void
    {
        $this->requireClass('Product');

        $db = $GLOBALS['db'] ?? null;
        if (!$db) {
            $this->markTestSkipped('Base de datos Dolibarr no inicializada.');
        }

        $product = new Product($db);
        $product->type = Product::TYPE_PRODUCT;
        $product->ref = 'PF-002-UT-001';
        $product->price = 100;
        $product->tva_tx = 19;
        $product->weight = 0.1;

        $product->label = '';
        $result = $product->validateFields(false);

        $this->assertLessThan(0, $result, 'La validación debe fallar cuando la etiqueta está vacía');
    }

    public function testValidateFieldsAcceptsValidBoundaries(): void
    {
        $this->requireClass('Product');

        $db = $GLOBALS['db'] ?? null;
        if (!$db) {
            $this->markTestSkipped('Base de datos Dolibarr no inicializada.');
        }

        $product = new Product($db);
        $product->type = Product::TYPE_PRODUCT;
        $product->ref = 'PF-002-UT-002';
        $product->label = 'Producto de prueba';
        $product->price = 100;
        $product->tva_tx = 0;
        $product->weight = 0;

        $result = $product->validateFields(false);
        $this->assertGreaterThanOrEqual(0, $result);
    }
}
