<?php
$possibleRoots = [
    getenv('DOLIBARR_ROOT'),
    __DIR__ . '/../htdocs',
    __DIR__ . '/../../dolibarr/htdocs'
];

foreach ($possibleRoots as $root) {
    if ($root && file_exists($root . '/master.inc.php')) {
        require_once $root . '/master.inc.php';
        break;
    }
}

require_once __DIR__ . '/tests/DolibarrTestCase.php';
