<?php

require_once "../session.php";

$body = file_get_contents("php://input");
$postData = json_decode($body, true);
$modifications = $postData["data"];

foreach ($modifications as $mod)
{
    $_SESSION["updatedEvents"][$mod["id"]] = $mod;
}

sendData($modifications);

?>
