<?php

require_once "../session.php";
require_once "event-controller.php";
require_once "../resource/resource-controller.php";

$resourceIds = getQueryArray("resourceIds");
$startDate   = getQueryDate("startDate");
$endDate     = getQueryDate("endDate");

if(!$startDate || !$endDate){
    sendError("Missing parameter");
}

$events = &getEvents($startDate, $endDate, $resourceIds);

sendData($events);

?>
