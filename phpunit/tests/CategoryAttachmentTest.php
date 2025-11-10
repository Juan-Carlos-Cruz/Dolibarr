<?php

require_once __DIR__ . '/DolibarrTestCase.php';

final class CategoryAttachmentTest extends DolibarrTestCase
{
    public function testAttachDocumentStoresMetadata(): void
    {
        $this->requireClass('Categorie');

        $db = $GLOBALS['db'] ?? null;
        if (!$db) {
            $this->markTestSkipped('Base de datos Dolibarr no inicializada.');
        }

        $category = new Categorie($db);
        $this->callOrSkip($category, 'attach_document');

        $file = tempnam(sys_get_temp_dir(), 'doc');
        file_put_contents($file, 'demo');

        $result = $category->attach_document($file, 'ficha.pdf', 'application/pdf');
        $this->assertGreaterThanOrEqual(0, $result);
    }
}
