<?php

require_once "../session.php";
require_once "../headers.php";
require_once "resource-controller.php";

$body = file_get_contents("php://input");
$postData = json_decode($body, true);
$ids = $postData["ids"];
$data = &getResources();

foreach ($ids as $id)
{
    $record = &getResource($id);
    $ix = array_search($record, $data, true);

    if ($ix >= 0)
    {
        array_splice($data, $ix, 1);
    }
}

sendSuccess();

?>
