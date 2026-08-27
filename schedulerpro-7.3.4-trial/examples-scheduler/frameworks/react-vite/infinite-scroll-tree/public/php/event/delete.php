<?php

require_once "../session.php";

$body = file_get_contents("php://input");
$postData = json_decode($body, true);
$ids = $postData["ids"];

array_push($_SESSION["removedEventIds"], ...$ids);

sendSuccess();

?>
