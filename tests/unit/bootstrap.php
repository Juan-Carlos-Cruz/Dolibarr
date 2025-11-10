<?php
/**
 * Bootstrap para las pruebas unitarias de caja blanca.
 *
 * Se espera que el código fuente de Dolibarr (htdocs/) esté montado en el
 * mismo árbol de trabajo cuando se ejecuten los tests. Si no está disponible,
 * las pruebas se marcarán como omitidas para facilitar la integración continua.
 */

$rootCandidates = [
    __DIR__ . '/../../htdocs/master.inc.php',
    __DIR__ . '/../../../htdocs/master.inc.php',
    __DIR__ . '/../../../../htdocs/master.inc.php'
];

foreach ($rootCandidates as $candidate) {
    if (file_exists($candidate)) {
        require_once $candidate;
        return;
    }
}

define('DOLIBARR_MISSING_CORE', true);
