<?php

$numOfRecords = 100;

// Strings to generate random demo data
$cities    = ['Omsk', 'Stockholm', 'Erevan', 'London', 'Barcelona', 'Moscow', 'Beijing', 'Tokyo', 'Ankara'];
$names     = ['Johan', 'Dan', 'Max', 'Arcady', 'Mats', 'Don', 'Nigel', 'Alex'];
$surnames  = ['Smith', 'Doe', 'Mask', 'Rambo', 'King', 'Jordan', 'Powers', 'Simpson'];
$companies = ['Company #1', 'Company #2', 'Company #3', 'Bryntum'];

$records = [];

// Returns a random entry from the provided array
function getRandEntry(&$arr)
{
    return $arr[rand(0, count($arr) - 1)];
}

// Generate demo data - $numOfRecords records
for ($i = 1; $i <= $numOfRecords; $i++) {
    $records[] = [
        'id'      =>  $i,
        'name'    =>  getRandEntry($names) .' '. getRandEntry($surnames),
        'company' =>  getRandEntry($companies),
        'city'    =>  getRandEntry($cities)
    ];
}

die(json_encode($records));
