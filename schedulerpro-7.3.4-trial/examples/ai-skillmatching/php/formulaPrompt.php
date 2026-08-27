<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // The API configuration should be located in config.php (see config.template.php for instructions)
        $config = include("api-config.php");
        require_once("http-helpers.php");

        $api_key = $config["AZURE_OPENAI_API_KEY_MINI"];
        $endpoint = $config["AZURE_OPENAI_ENDPOINT_MINI"];

        // Read the raw POST data
        $rawBody = file_get_contents("php://input");
        $body = json_decode($rawBody);

        $content = array(
            "model" => "gpt-4o-mini",
            "max_tokens" => isset($body->max_tokens) ? $body->max_tokens : 150,
            "temperature" => isset($body->temperature) ? $body->temperature : 0.5,
            "messages" => array(
                array("role" => "system", "content" => isset($body->system) ? $body->system : ''),
                array("role" => "user", "content" => $body->prompt)
            )
        );

        $result = fetchWithRetry($endpoint, [
            "header"  => "Content-type: application/json\r\n" .
                "api-key: " . $api_key,
            "method"  => "POST",
            "content" => json_encode($content),
        ]);

        if (!$result['success']) {
            sendError($result['http_code'], $result['body'] ?: $result['error']);
            return;
        }

        $data = json_decode($result['body']);
        echo json_encode($data->choices[0]->message) ?? '';
        return;


    } catch (Throwable $e) {
        sendError(500, $e->getMessage(), $e);
    }
}

?>
