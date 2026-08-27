<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // The API configuration should be located in config.php (see config.php.example for instructions)
        $config = include("api-config.php");
        require_once("http-helpers.php");

        $api_key = $config["AZURE_OPENAI_TTS_API_KEY"];
        $endpoint = $config["AZURE_OPENAI_TTS_ENDPOINT"];

        // Read the raw POST data
        $raw_post_data = file_get_contents("php://input");

        // Decode the JSON data if the form sends JSON
        $post_data = json_decode($raw_post_data, true);

        $data = [
            "model" => "tts-1",
            "input" => $post_data["text"],
            "voice" => "alloy"
        ];

        $result = fetchWithRetry($endpoint, [
            "header"  => "Content-Type: application/json\r\n" .
                         "api-key: " . $api_key,
            "method"  => "POST",
            "content" => json_encode($data),
        ], ['streaming' => true]);

        if (!$result['success']) {
            sendError($result['http_code'], $result['error']);
            return;
        }

        header("Content-Type: audio/mpeg");
        fpassthru($result['stream']);
        fclose($result['stream']);
    } catch (Throwable $e) {
        sendError(500, $e->getMessage(), $e);
    }
}
?>
