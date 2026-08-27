<?php

session_start();

if (!isset($_SESSION["scheduler-dataIsLoaded"]) || isset($_GET["reset"]))
{
    // We need to destroy any previous session data, otherwise data from other Infinite Scroll demos can interfere
    session_destroy();
    session_start();

    // Initialize session's demo data
    $resources  = file_get_contents(__DIR__ . "/../data/resources.json");
    $timeranges = file_get_contents(__DIR__ . "/../data/timeranges.json");

    $_SESSION["resources"]         = json_decode($resources, true);
    $_SESSION["resourcesIsSorted"] = false;
    $_SESSION["resourceMaxId"]     = end($_SESSION["resources"])["id"];

    $_SESSION["eventMaxId"]      = 0;
    $_SESSION["addedEvents"]     = [];
    $_SESSION["updatedEvents"]   = [];
    $_SESSION["removedEventIds"] = [];

    $_SESSION["timeranges"] = json_decode($timeranges, true);

    $_SESSION["scheduler-dataIsLoaded"] = true;
}

function sendError($msg)
{
    die(json_encode([
        "success" => false,
        "msg" => $msg
    ]));
}

function sendData($data, $total = null)
{
    $msg = [
        "success" => true,
        "data" => $data
    ];

    if ($total != null)
    {
        $msg["total"] = $total;
    }

    echo json_encode($msg);
}

function sendSuccess()
{
    echo json_encode([
        "success" => true
    ]);
}

function getQueryDate($name)
{
    if(isset($_GET[$name]))
    {
        return date_create($_GET[$name]);
    }

    return null;
}

?>
