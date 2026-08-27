<?php

require_once "../session.php";
require_once "../headers.php";
require_once "event-controller.php";
require_once "../resource/resource-controller.php";

$startIndex = $_GET["startIndex"] ?? 0;
$count      = $_GET["count"] ?? 100;
$sort       = $_GET["sort"] ?? null;
$filter     = $_GET["filter"] ?? null;
$startDate  = getQueryDate("startDate");
$endDate    = getQueryDate("endDate");

if(!$startDate || !$endDate){
    sendError("Missing parameter");
}

$resourceData = readResources($startIndex, $count, $sort, $filter);
$resourceIds  = array_map(fn ($resource) => $resource["id"], $resourceData[0]);

$events = &getEvents($startDate, $endDate, $resourceIds);

sendData($events);

?>
