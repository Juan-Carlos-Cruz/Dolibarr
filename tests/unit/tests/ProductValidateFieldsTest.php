<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class ProductValidateFieldsTest extends TestCase
{
    protected function setUp(): void
    {
        if (defined('DOLIBARR_MISSING_CORE') && DOLIBARR_MISSING_CORE) {
            $this->markTestSkipped('Dolibarr no está montado. Monte htdocs/ para ejecutar la prueba.');
        }
    }

    public function testRejectsEmptyLabel(): void
    {
        $this->markTestIncomplete('Pendiente de implementar particiones de equivalencia para etiquetas vacías.');
    }

    public function testRejectsNegativeWeight(): void
    {
        $this->markTestIncomplete('Pendiente de validar límites inferiores de peso conforme a HU-002.');
    }
}
