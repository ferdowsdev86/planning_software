<?php

require_once "../headers.php";
require_once "../http.php";
require_once "../generator.php";

$startIndex = (int)($_GET["startIndex"] ?? 0);
$count      = (int)($_GET["count"] ?? 100);
$total      = (int)($_GET["total"] ?? RESOURCE_TOTAL);

$resources = generateResources($startIndex, $count, $total);

sendData($resources, $total);

?>
