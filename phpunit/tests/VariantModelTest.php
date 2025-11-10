<?php

require_once __DIR__ . '/DolibarrTestCase.php';

final class VariantModelTest extends DolibarrTestCase
{
    public function testCreateVariantRejectsDuplicates(): void
    {
        $this->requireClass('Variant');

        $db = $GLOBALS['db'] ?? null;
        if (!$db) {
            $this->markTestSkipped('Base de datos Dolibarr no inicializada.');
        }

        $variantModel = new Variant($db);
        $this->callOrSkip($variantModel, 'createVariant');

        $productId = 1;
        $attributes = ['color' => 'Rojo', 'talla' => 'M'];

        $first = $variantModel->createVariant($productId, $attributes);
        $duplicate = $variantModel->createVariant($productId, $attributes);

        $this->assertGreaterThan(0, $first);
        $this->assertLessThanOrEqual(0, $duplicate, 'Debe impedir crear variantes duplicadas');
    }
}
