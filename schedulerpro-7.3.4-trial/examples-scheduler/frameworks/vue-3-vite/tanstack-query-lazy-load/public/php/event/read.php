<?php

require_once "../headers.php";
require_once "../http.php";
require_once "../generator.php";

$startIndex = (int)($_GET["startIndex"] ?? 0);
$count      = (int)($_GET["count"] ?? 100);
$total      = (int)($_GET["total"] ?? RESOURCE_TOTAL);
$startDate  = getQueryDate("startDate");
$endDate    = getQueryDate("endDate");

if (!$startDate || !$endDate) {
    sendError("Missing startDate/endDate parameter");
}

// Events are generated only for the currently visible resource window (the same
// startIndex/count the resource store requested), so each fetch stays bounded.
$end         = min($startIndex + $count, $total);
$resourceIds = $end >= $startIndex + 1 ? range($startIndex + 1, $end) : [];

$events = generateEvents($startDate, $endDate, $resourceIds);

sendData($events);

?>
