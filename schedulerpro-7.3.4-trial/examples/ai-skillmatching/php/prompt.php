<?php

// The API configuration should be located in config.php
require("api-config.php");
require_once("http-helpers.php");

set_time_limit(300);

// Start the timer
$start_time = microtime(true);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {

        // Read the raw POST data
        $raw_post_data = file_get_contents("php://input");

        $model = json_decode($raw_post_data, true)["model"] ?? "";
        $api = getAPI($model);
        $endpoint = $api["endpoint"];
        $headers = $api["headers"];

        $result = fetchWithRetry($endpoint, [
            "header"  => "Content-type: application/json\r\n" . $headers,
            "method"  => "POST",
            "content" => $raw_post_data,
        ]);

        if (!$result['success']) {
            sendError($result['http_code'], $result['body'] ?: $result['error']);
            return;
        }

        // Success - return the API response
        echo $result['body'];
        return;

    } catch (Throwable $e) {
        sendError(500, $e->getMessage(), $e);
        return;
    }
}
?>
