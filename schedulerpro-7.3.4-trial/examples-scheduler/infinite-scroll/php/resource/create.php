<?php

require_once "../session.php";
require_once "../headers.php";
require_once "resource-controller.php";

$body = file_get_contents("php://input");
$data = json_decode($body, true);
$records = $data["data"];

foreach ($records as &$record)
{
    addResource($record);
    sortResources();
}

sendData($records);

?>
