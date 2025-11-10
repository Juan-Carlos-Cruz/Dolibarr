<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class PriceCalculatorTest extends TestCase
{
    protected function setUp(): void
    {
        if (defined('DOLIBARR_MISSING_CORE') && DOLIBARR_MISSING_CORE) {
            $this->markTestSkipped('Dolibarr no está montado. Monte htdocs/ para ejecutar la prueba.');
        }
    }

    public function testRespectsMinimumPriceWithVat(): void
    {
        $this->markTestIncomplete('Cubrir rutas básicas del método computeSalePrice().');
    }

    public function testHandlesPriceWithoutVat(): void
    {
        $this->markTestIncomplete('Añadir escenarios sin IVA para la tabla de decisión.');
    }
}
