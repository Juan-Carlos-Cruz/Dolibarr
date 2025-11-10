<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class InventoryMovementTest extends TestCase
{
    protected function setUp(): void
    {
        if (defined('DOLIBARR_MISSING_CORE') && DOLIBARR_MISSING_CORE) {
            $this->markTestSkipped('Dolibarr no está montado. Monte htdocs/ para ejecutar la prueba.');
        }
    }

    public function testCreatesStockMovementForEntries(): void
    {
        $this->markTestIncomplete('Cubrir entradas, salidas y transferencias con valores límite.');
    }
}
