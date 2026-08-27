<?php

require_once "../session.php";
require_once "../headers.php";
require_once "resource-controller.php";

$body = file_get_contents("php://input");
$postData = json_decode($body, true);
$modifications = $postData["data"];

foreach ($modifications as $mod)
{
    $record =& getResource($mod["id"]);

    if (isset($record))
    {
        foreach ($mod as $field => $value)
        {
            $record[$field] = $value;
        }
    }
}

sendData($modifications);

?>
