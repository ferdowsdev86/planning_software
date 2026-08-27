<?php

require_once "session.php";
require_once "event/event-controller.php";
require_once "resource/resource-controller.php";

$startIndex = getParamString("startIndex") ?? 0;
$count      = getParamString("count") ?? 100;
$sort       = getParamString("sort");
$filter     = getParamString("filter");
$startDate  = getParamDate("startDate");
$endDate    = getParamDate("endDate");
$stores     = getQueryString("stores");

if (!$startDate || !$endDate)
{
    sendError("Missing parameter");
}

$resourceData = readResources($startIndex, $count, $sort, $filter, true);
$resourceIds  = array_map(fn ($resource) => $resource["id"], $resourceData[0]);

$eventsData  = getEvents($startDate, $endDate, $resourceIds);

$results = [
    "events" => [
        "rows" => $eventsData[0]
    ],
    "assignments" => [
        "rows" => $eventsData[1]
    ]
];

if (in_array("resources", $stores))
{
    $results["resources"] = [
        "rows" => $resourceData[0],
        "total" => $resourceData[1]
    ];
}


sendData($results);

?>
