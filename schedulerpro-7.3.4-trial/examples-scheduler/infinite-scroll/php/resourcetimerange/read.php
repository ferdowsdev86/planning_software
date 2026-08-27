<?php

require_once "../session.php";
require_once "timerange-controller.php";
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

$timeRanges = &getTimeRanges();

$result = array_filter($timeRanges, function($timeRange) use ($resourceIds, $startDate, $endDate)
    {
        $timeRangeStartDate = new DateTime($timeRange["startDate"]);
        $timeRangeEndDate   = new DateTime($timeRange["endDate"]);
        return (
            ($timeRangeStartDate >= $startDate && $timeRangeStartDate <= $endDate) ||
            ($timeRangeEndDate >= $startDate && $timeRangeEndDate <= $endDate)
        ) && in_array($timeRange["resourceId"], $resourceIds);
    }
);

sendData(array_slice($result,0));

?>