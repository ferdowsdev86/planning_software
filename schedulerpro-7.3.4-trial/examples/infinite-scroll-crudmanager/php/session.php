<?php

session_start();

if (!isset($_SESSION["pro-dataIsLoaded"]) || getQueryString("reset"))
{
    // We need to destroy any previous session data, otherwise data from other Infinite Scroll demos can interfere
    session_destroy();
    session_start();

    // Initialize session's demo data
    $resources  = file_get_contents(__DIR__ . "/data/resources.json");

    $_SESSION["resources"]         = json_decode($resources, true);
    $_SESSION["resourcesIsSorted"] = false;
    $_SESSION["resourceMaxId"]     = end($_SESSION["resources"])["id"];

    $_SESSION["eventMaxId"]      = 0;
    $_SESSION["addedEvents"]     = [];
    $_SESSION["updatedEvents"]   = [];
    $_SESSION["removedEventIds"] = [];

    $_SESSION["assignmentMaxId"]      = 0;
    $_SESSION["addedAssignments"]     = [];
    $_SESSION["updatedAssignments"]   = [];
    $_SESSION["removedAssignmentIds"] = [];

    $_SESSION["pro-dataIsLoaded"] = true;
}

function sendError($msg)
{
    die(json_encode([
        "success" => false,
        "msg" => $msg
    ]));
}

function sendData($data, $requestId = null)
{
    $data["success"] = true;

    if (!$requestId)
    {
        $requestId = getQueryString("requestId");
    }

    $data["requestId"] = $requestId;

    echo json_encode($data);
}

function sendSuccess()
{
    echo json_encode([
        "success" => true
    ]);
}

function getQueryString($name)
{
    if(isset($_GET["data"]))
    {
        $data = json_decode($_GET["data"], true);

        if(isset($data[$name]))
        {
            return $data[$name];
        }
    }
    return null;
}

function getParamString($name)
{
    $params = getQueryString("params");

    if($params)
    {
        if(isset($params[$name]))
        {
            return $params[$name];
        }
    }

    return null;
}

function getParamDate($name)
{
    $val = getParamString($name);

    if($val)
    {
        return date_create($val);
    }

    return null;
}

function &find(&$arr, $field, $val)
{
    $key = array_search($val, array_column($arr, $field));

    return $arr[$key];
}

?>
