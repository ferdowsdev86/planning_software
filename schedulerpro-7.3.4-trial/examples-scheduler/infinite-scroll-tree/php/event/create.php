<?php

require_once "../session.php";

$body = file_get_contents("php://input");
$data = json_decode($body, true);
$records = $data["data"];

foreach ($records as &$record)
{
    $record["id"] = ++$_SESSION["eventMaxId"];
    $_SESSION["addedEvents"][] = $record;
}

sendData($records);

?>
