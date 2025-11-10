<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class VariantModelTest extends TestCase
{
    protected function setUp(): void
    {
        if (defined('DOLIBARR_MISSING_CORE') && DOLIBARR_MISSING_CORE) {
            $this->markTestSkipped('Dolibarr no está montado. Monte htdocs/ para ejecutar la prueba.');
        }
    }

    public function testAvoidsDuplicatedVariants(): void
    {
        $this->markTestIncomplete('Diseñar tabla de decisión para atributos talla y color.');
    }
}
