<?php
// Get the request method
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Load configuration
$config = include("api-config.php");
$api_key = $config["BRYNTUM_TOOLS_API_KEY"];
$api_url = $config["BRYNTUM_TOOLS_ENDPOINT"] . '/aidemo/feedback';

switch ($requestMethod) {
    case 'POST':
        // Get the raw POST data
        $postData = file_get_contents('php://input');

        // Decode the JSON data
        $data = json_decode($postData, true);

        // Ensure data is not null (valid JSON)
        if ($data !== null) {
            // Prepare the data to send to the API
            $apiData = [
                'positive' => (bool) $data['positive'],
                'messages' => $data['messages'],
                'userAgent' => $_SERVER['HTTP_USER_AGENT'],
                'clientIP' => $_SERVER['REMOTE_ADDR'],
                'url' => $data['url']
            ];

            // Initialize cURL session
            $ch = curl_init($api_url);

            // Set cURL options
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($apiData),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Authorization: ' . $api_key,
                    'Accept: application/json'
                ]
            ]);

            // Execute the request
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            // Check for errors
            if (curl_errno($ch)) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to send feedback: ' . curl_error($ch)
                ]);
            } else if ($httpCode >= 400) {
                http_response_code($httpCode);
                echo json_encode([
                    'success' => false,
                    'message' => 'API error: ' . $response
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'message' => 'Feedback sent successfully'
                ]);
            }

            // Close cURL session
            curl_close($ch);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON data received'
            ]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}
?>
