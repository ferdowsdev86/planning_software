<?php

require_once './load-env.php';

// Load per-demo configuration (used for per-demo configuration and TeamCity testing)
loadEnvFile('./config.php');

// Verify the request originates from an allowed domain.
// Blocks requests from unknown origins to prevent unauthorized use of API keys.
function requireSameOrigin() {
    // CLI requests (e.g. tests) have no HTTP_HOST — skip origin check
    if (php_sapi_name() === 'cli') {
        return;
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Fall back to Referer if no Origin header (some same-origin requests omit Origin)
    if (!$origin) {
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        if ($referer) {
            $parsed = parse_url($referer);
            $origin = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? '');
            if (isset($parsed['port'])) {
                $origin .= ':' . $parsed['port'];
            }
        }
    }

    if (!$origin) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }

    $host = strtolower(parse_url($origin, PHP_URL_HOST) ?? '');

    $allowed =
        $host === 'localhost'
        || $host === 'lh'
        || $host === 'bryntum.com'
        || (strlen($host) > 12 && substr($host, -12) === '.bryntum.com');

    if (!$allowed) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

requireSameOrigin();

// If auth middleware exists, require authentication
$authMiddleware = './auth/middleware.php';
if (is_file($authMiddleware)) {
    require_once $authMiddleware;
    requireAuth();
}

// LLM_API_LEVEL controls which models are available in different environments
// Models with apiLevel <= LLM_API_LEVEL are included.
// If LLM_API_LEVEL is not set, all models are available.
// 1 = online ai demos
// 2 = (open slot)
// 3 = tc testing ai demos
// 4 = local dev
$apiLevel = getenv('LLM_API_LEVEL') !== false ? (int)getenv('LLM_API_LEVEL') : null;

$apiRegistry = [
    'gpt-4-1' => [
        'name' => 'OpenAI GPT-4.1',
        'apiLevel' => 1,
        'endpoint' => getenv('AZURE_OPENAI_ENDPOINT'),
        "headers" => "api-key: " . getenv('AZURE_OPENAI_API_KEY')
    ],
    'gpt-5-mini' => [
        'name' => 'OpenAI GPT-5 mini',
        'apiLevel' => 3,
        'endpoint' => getenv('AZURE_OPENAI_5_ENDPOINT'),
        'headers' => "api-key: " . getenv('AZURE_OPENAI_5_API_KEY')
    ],
    'claude-opus-4-1-20250805' => [
        'name' => 'Anthropic Claude Opus 4.1',
        "apiLevel" => 4,
        'endpoint' => getenv('ANTHROPIC_ENDPOINT'),
        'headers' => 'x-api-key: ' . getenv('ANTHROPIC_API_KEY') . "\r\n" . 'anthropic-version: 2023-06-01'
    ],
    'claude-sonnet-4-6' => [
          'name' => 'Anthropic Claude Sonnet 4.6',
          'apiLevel' => 3,
          'endpoint' => getenv('ANTHROPIC_ENDPOINT'),
          'headers' => 'x-api-key: ' . getenv('ANTHROPIC_API_KEY') . "\r\n" . 'anthropic-version: 2023-06-01'
    ],
    'claude-haiku-4-5' => [
        'name' => 'Anthropic Claude Haiku 4.5',
        'apiLevel' => 3,
        'endpoint' => getenv('ANTHROPIC_ENDPOINT'),
        'headers' => 'x-api-key: ' . getenv('ANTHROPIC_API_KEY') . "\r\n" . 'anthropic-version: 2023-06-01'
    ],
    'gemini-3-1-flash-lite' => [
        'name' => 'Google Gemini 3.1 Flash-Lite',
        'apiLevel' => 3,
        'endpoint' => getenv('GEMINI_ENDPOINT'),
        'headers' => 'X-goog-api-key: ' . getenv('GEMINI_API_KEY')
    ],
    'gemini-3-1-pro-preview' => [
        'name' => 'Google Gemini 3.1 Pro',
        'apiLevel' => 3,
        'endpoint' => getenv('GEMINI_3_ENDPOINT'),
        'headers' => 'X-goog-api-key: ' . getenv('GEMINI_3_API_KEY')
    ]
];


function getAPIs(){
    global $apiRegistry, $apiLevel;
    $result = [];
    foreach ($apiRegistry as $id => $item) {
        if (!empty($item['endpoint']) && ($apiLevel === null || $item['apiLevel'] <= $apiLevel)) {
            $result[] = [
                'id' => $id,
                'name' => $item['name']
            ];
        }
    }
    return $result;
}

function getAPI($modelName){
    global $apiRegistry, $apiLevel;
    $api = $apiRegistry[$modelName] ?? null;

    if (!$api) {
        throw new Exception("Unknown model: $modelName");
    }

    if ($apiLevel !== null && $api['apiLevel'] > $apiLevel) {
        throw new Exception("Model '$modelName' is not available");
    }

    return $api;
}

return [
    "OPENAI_ENDPOINT" => getenv("OPENAI_ENDPOINT"),
    "OPENAI_API_KEY" => getenv("OPENAI_API_KEY"),
    "AZURE_OPENAI_ENDPOINT" => getenv("AZURE_OPENAI_ENDPOINT"),
    "AZURE_OPENAI_API_KEY" => getenv("AZURE_OPENAI_API_KEY"),
    "AZURE_OPENAI_ENDPOINT_MINI" => getenv("AZURE_OPENAI_ENDPOINT_MINI"),
    "AZURE_OPENAI_API_KEY_MINI" => getenv("AZURE_OPENAI_API_KEY_MINI"),
    "AZURE_OPENAI_WHISPER_ENDPOINT" => getenv("AZURE_OPENAI_WHISPER_ENDPOINT"),
    "AZURE_OPENAI_WHISPER_API_KEY" => getenv("AZURE_OPENAI_WHISPER_API_KEY"),
    "AZURE_OPENAI_TTS_ENDPOINT" => getenv("AZURE_OPENAI_TTS_ENDPOINT"),
    "AZURE_OPENAI_TTS_API_KEY" => getenv("AZURE_OPENAI_TTS_API_KEY"),
    "BRYNTUM_TOOLS_API_KEY" => getenv("BRYNTUM_TOOLS_API_KEY"),
    "BRYNTUM_TOOLS_ENDPOINT" => getenv("BRYNTUM_TOOLS_ENDPOINT")
];

?>
