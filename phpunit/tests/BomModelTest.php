<?php

require_once __DIR__ . '/DolibarrTestCase.php';

final class BomModelTest extends DolibarrTestCase
{
    public function testAddLineCalculatesTotals(): void
    {
        $this->requireClass('BOM');

        $db = $GLOBALS['db'] ?? null;
        if (!$db) {
            $this->markTestSkipped('Base de datos Dolibarr no inicializada.');
        }

        $bom = new BOM($db);
        $this->callOrSkip($bom, 'addline');

        $productId = 1;
        $serviceId = 2;

        $resultProduct = $bom->addline($productId, 2, 100);
        $resultService = $bom->addline($serviceId, 1, 50);

        $this->assertGreaterThanOrEqual(0, $resultProduct);
        $this->assertGreaterThanOrEqual(0, $resultService);

        if (property_exists($bom, 'total_cost')) {
            $this->assertEquals(250, $bom->total_cost);
        }
    }
}
