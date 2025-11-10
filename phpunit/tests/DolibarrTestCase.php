<?php

use PHPUnit\Framework\TestCase;

abstract class DolibarrTestCase extends TestCase
{
    protected function requireClass(string $className): void
    {
        if (!class_exists($className)) {
            $this->markTestSkipped("Clase {$className} no disponible en el entorno de pruebas.");
        }
    }

    protected function callOrSkip(object $object, string $method): void
    {
        if (!method_exists($object, $method)) {
            $this->markTestSkipped(sprintf('El método %s::%s no existe en este entorno.', get_class($object), $method));
        }
    }
}
