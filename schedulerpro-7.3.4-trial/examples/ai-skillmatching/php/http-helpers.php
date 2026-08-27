<?php
/**
 * Shared HTTP helper with retry logic and exponential backoff for rate limiting (429).
 * Used by prompt.php, transcribe.php, texttospeech.php, and formulaPrompt.php.
 */

/**
 * Extract HTTP status code from response headers array.
 *
 * @param array|null $headers Response headers
 * @return int HTTP status code, or 0 if not found
 */
function parseHttpCode($headers) {
    if (is_array($headers) && isset($headers[0])) {
        if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $headers[0], $matches)) {
            return (int)$matches[1];
        }
    }
    return 0;
}

/**
 * Make an HTTP request with retry logic for rate limiting (429).
 * Retries with exponential backoff when the API returns 429 Too Many Requests.
 *
 * @param string $endpoint    The URL to fetch
 * @param array  $httpOptions HTTP stream context options (header, method, content, etc.)
 * @param array  $options     Configuration:
 *   - retry_attempts (int): Max retry attempts, default 5
 *   - wait_time (int): Initial wait in seconds, default 10 (doubles each retry)
 *   - streaming (bool): Use fopen for streaming instead of file_get_contents, default false
 *
 * @return array Result:
 *   - success (bool): Whether the request succeeded (HTTP 2xx/3xx)
 *   - body (string|null): Response body (non-streaming mode only)
 *   - stream (resource|null): Response stream (streaming mode only)
 *   - http_code (int): HTTP status code
 *   - error (string|null): Error message on failure
 */
/**
 * Send an error response with proper HTTP status code.
 * Shows detailed errors when PHP's display_errors is on (development),
 * generic messages when off (production). Always logs the real error.
 *
 * @param int            $code      HTTP status code
 * @param string         $message   Error message (shown in dev mode)
 * @param Throwable|null $throwable Exception/Error for stack trace details
 */
function sendError($code, $message, $throwable = null) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    error_log("Error ($code): " . $message);

    // If message is already a JSON API error response, forward it as-is
    $decoded = json_decode($message);
    if ($decoded !== null && (is_object($decoded) || is_array($decoded))) {
        echo $message;
        exit;
    }

    if (ini_get('display_errors')) {
        $response = ["error" => $message];
        if ($throwable) {
            $response["file"] = $throwable->getFile();
            $response["line"] = $throwable->getLine();
            $response["trace"] = $throwable->getTraceAsString();
        }
        echo json_encode($response);
    } else {
        if ($code === 429) {
            echo json_encode(["error" => "Service temporarily unavailable. Please try again later."]);
        } else {
            echo json_encode(["error" => "An error occurred while processing your request."]);
        }
    }
    exit;
}

function fetchWithRetry($endpoint, $httpOptions, $options = []) {
    $retryAttempts = $options['retry_attempts'] ?? 5;
    $waitTime = $options['wait_time'] ?? 10;
    $streaming = $options['streaming'] ?? false;

    $httpOptions['ignore_errors'] = true;
    $context = stream_context_create(['http' => $httpOptions]);

    for ($i = 0; $i < $retryAttempts; $i++) {
        $httpCode = 0;

        if ($streaming) {
            $stream = @fopen($endpoint, 'rb', false, $context);

            if ($stream) {
                $meta = stream_get_meta_data($stream);
                $httpCode = parseHttpCode($meta['wrapper_data'] ?? []);
            } elseif (function_exists('http_get_last_response_headers')) {
                $httpCode = parseHttpCode(http_get_last_response_headers());
            }

            // Retry on rate limiting
            if ($httpCode === 429) {
                if ($stream) fclose($stream);
                error_log("Rate limited (429). Retry attempt " . ($i + 1) . " after waiting for $waitTime seconds.");
                sleep($waitTime);
                $waitTime *= 2;
                continue;
            }

            // Complete failure - no stream at all
            if (!$stream) {
                $error = error_get_last();
                return [
                    'success'   => false,
                    'stream'    => null,
                    'http_code' => $httpCode ?: 500,
                    'error'     => $error['message'] ?? 'Unknown error'
                ];
            }

            // HTTP error - read error body and close stream
            if ($httpCode >= 400) {
                $errorBody = stream_get_contents($stream);
                fclose($stream);
                return [
                    'success'   => false,
                    'stream'    => null,
                    'http_code' => $httpCode,
                    'error'     => $errorBody ?: 'HTTP error ' . $httpCode
                ];
            }

            // Success
            return [
                'success'   => true,
                'stream'    => $stream,
                'http_code' => $httpCode ?: 200,
                'error'     => null
            ];
        } else {
            $result = @file_get_contents($endpoint, false, $context);

            // Extract HTTP status code (PHP 8.4+ or older)
            if (function_exists('http_get_last_response_headers')) {
                $httpCode = parseHttpCode(http_get_last_response_headers());
            } elseif (isset($http_response_header)) {
                $httpCode = parseHttpCode($http_response_header);
            }

            // Retry on rate limiting
            if ($httpCode === 429) {
                error_log("Rate limited (429). Retry attempt " . ($i + 1) . " after waiting for $waitTime seconds.");
                sleep($waitTime);
                $waitTime *= 2;
                continue;
            }

            // Complete failure - no response
            if ($result === false) {
                $error = error_get_last();
                return [
                    'success'   => false,
                    'body'      => null,
                    'http_code' => $httpCode ?: 500,
                    'error'     => $error['message'] ?? 'Unknown error'
                ];
            }

            // Return response (success or HTTP error with body)
            return [
                'success'   => $httpCode > 0 && $httpCode < 400,
                'body'      => $result,
                'http_code' => $httpCode ?: 200,
                'error'     => null
            ];
        }
    }

    // Exhausted all retries (429 persisted)
    return [
        'success'   => false,
        'body'      => null,
        'stream'    => null,
        'http_code' => 429,
        'error'     => "Rate limit exceeded after $retryAttempts retries"
    ];
}

?>
