<?php

session_start();

if (!isset($_SESSION["react-pro-dataIsLoaded"]) || str_ends_with($_SERVER['REQUEST_URI'], 'reset.php'))
{
    // In case there is data from other InfiniteScroll demos saved in the session, we need to clear it
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

    $_SESSION["react-pro-dataIsLoaded"] = true;
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
