<?php

$apiKey = 'YOUR_API_KEY';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['audio'])) {
    try {
        // The API configuration should be located in config.php (see config.php.example for instructions)
        $config = include("api-config.php");
        require_once("http-helpers.php");

        $api_key = $config["AZURE_OPENAI_WHISPER_API_KEY"];
        $endpoint = $config["AZURE_OPENAI_WHISPER_ENDPOINT"];

        $audioFile = $_FILES['audio']['tmp_name'];
        $audioFileName = $_FILES['audio']['name'];

        // Prepare the file for upload
        $boundary = uniqid();
        $delimiter = '-------------' . $boundary;
        $fileContents = file_get_contents($audioFile);

        $postData = "--$delimiter\r\n"
            . "Content-Disposition: form-data; name=\"file\"; filename=\"$audioFileName\"\r\n"
            . "Content-Type: audio/mpeg\r\n\r\n"
            . $fileContents . "\r\n"
            . "--$delimiter--\r\n";

        $result = fetchWithRetry($endpoint, [
            'method' => 'POST',
            'header' => [
                "api-key: " . $api_key,
                "Content-Type: multipart/form-data; boundary=$delimiter",
                "Content-Length: " . strlen($postData),
            ],
            'content' => $postData,
        ]);

        if (!$result['success']) {
            sendError($result['http_code'], $result['error'] ?? 'Unable to process the request.');
        } else {
            $data = json_decode($result['body'], true);
            echo $data["text"];
        }
    } catch (Throwable $e) {
        sendError(500, $e->getMessage(), $e);
    }
} else {
    echo 'No audio file uploaded.';
}
?>
