<?php

$maxWork       = 24;
$maxTravelTime = 24;

// We don't really use these parameters here since we just build random data each time.
// But in a real application the script will have to return the histogram data for the provided
// record and time span
$recordId  = $_GET['recordId'];
$startDate = strtotime($_GET['startDate']);
$endDate   = strtotime($_GET['endDate']);

// We are going to build histogram entry for each tick.
$tickCount = (int)$_GET['tickCount'];

$histogramData = [];

// Generate demo histogram data
for ($i = 0; $i < $tickCount; $i++) {
    $histogramData[] = [
        'work'       =>  rand(0, $maxWork + 1),
        'maxWork'    =>  rand(0, $maxWork),
        'travelTime' =>  rand(0, $maxTravelTime)
    ];
}

die(json_encode($histogramData));
