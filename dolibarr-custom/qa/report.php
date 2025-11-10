<?php
require '../main.inc.php';
if (!$user->admin) accessforbidden();

llxHeader('', 'Reporte de Pruebas (Allure)');

// El reporte estático es generado desde el contenedor functional-tests mediante
// "allure generate" y queda montado en /var/www/html/custom/qa/reports.
$allureIndex = dol_buildpath('/custom/qa/reports/allure-report/index.html', 1);

print '<h1>Reporte de Pruebas (Selenium + Allure)</h1>';
print '<div style="height:80vh;border:1px solid #ddd">';
print '<iframe src="'.$allureIndex.'" style="width:100%;height:100%;border:0"></iframe>';
print '</div>';

llxFooter();
