<?php

require_once "../session.php";
require_once "resource-controller.php";

$startIndex = $_GET["startIndex"] ?? 0;
$count      = $_GET["count"] ?? 100;
$sort       = $_GET["sort"] ?? null;
$filter     = $_GET["filter"] ?? null;
$parentId   = $_GET["parentId"] ?? null;

$data       = readResources($parentId, $startIndex, $count, $sort, $filter);
$result     = $data[0];
$total      = $data[1];

// First load returns only 10 parents and includes children for expanded parents
if($parentId === "root" && $startIndex == 0)
{
    $result = array_slice($result, 0, 10);

    foreach ($result as &$r)
    {
        if (!isset($r["parentId"]) && $r["expanded"])
        {
            $r["children"] = readResources($r["id"], 0, $count, $sort, $filter)[0];
        }
    }

    sendData($result, $total, false);
}
else
{
    sendData($result, $total);
}



?>