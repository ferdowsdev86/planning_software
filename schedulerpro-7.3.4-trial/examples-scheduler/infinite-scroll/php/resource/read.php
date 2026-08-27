<?php

require_once "../session.php";
require_once "../headers.php";
require_once "resource-controller.php";

$startIndex = $_GET["startIndex"] ?? 0;
$count      = $_GET["count"] ?? 100;
$sort       = $_GET["sort"] ?? null;
$filter     = $_GET["filter"] ?? null;

$data       = readResources($startIndex, $count, $sort, $filter);
$result     = $data[0];
$total      = $data[1];

sendData($result, $total);

?>
