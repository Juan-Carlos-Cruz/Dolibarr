<?php

require_once __DIR__ . '/DolibarrTestCase.php';

final class BarcodeGeneratorTest extends DolibarrTestCase
{
    /**
     * @dataProvider barcodeProvider
     */
    public function testGenerateValidatesFormats(string $format, bool $shouldSucceed): void
    {
        $this->requireClass('Barcode');

        $db = $GLOBALS['db'] ?? null;
        if (!$db) {
            $this->markTestSkipped('Base de datos Dolibarr no inicializada.');
        }

        $generator = new Barcode($db);
        $this->callOrSkip($generator, 'generate');

        $result = $generator->generate($format, '1234567890123');
        if ($shouldSucceed) {
            $this->assertNotEmpty($result);
        } else {
            $this->assertFalse($result);
        }
    }

    public function barcodeProvider(): array
    {
        return [
            'EAN13 válido' => ['EAN13', true],
            'QR válido' => ['QR', true],
            'Formato inválido' => ['INVALID', false]
        ];
    }
}
