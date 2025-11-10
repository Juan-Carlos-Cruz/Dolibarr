<?php

require_once __DIR__ . '/DolibarrTestCase.php';

final class InventoryMovementTest extends DolibarrTestCase
{
    /**
     * @dataProvider quantityProvider
     */
    public function testMoveValidatesQuantities(int $qty, bool $expectedSuccess): void
    {
        $this->requireClass('MouvementStock');

        $db = $GLOBALS['db'] ?? null;
        if (!$db) {
            $this->markTestSkipped('Base de datos Dolibarr no inicializada.');
        }

        $movement = new MouvementStock($db);
        $this->callOrSkip($movement, 'create');

        $result = $movement->create(1, 1, 0, $qty, 0, 'PHPUnit');
        if ($expectedSuccess) {
            $this->assertGreaterThan(0, $result);
        } else {
            $this->assertLessThanOrEqual(0, $result);
        }
    }

    public function quantityProvider(): array
    {
        return [
            'cantidad negativa' => [-1, false],
            'cantidad cero' => [0, false],
            'cantidad válida' => [5, true]
        ];
    }
}
