<?php

// HTTP request/response helpers shared by the read endpoints: reading query
// params and emitting JSON. Kept separate from generator.php (which only
// generates data) and headers.php (which only sets CORS headers). The JSON
// content type is set when emitting so RTK Query's fetchBaseQuery parses the body.

// Sends a successful response. `total` is included only when provided (the
// resource store needs it to size the lazy-loaded scrollbar; events don't).
function sendData($data, $total = null)
{
    header("Content-Type: application/json");

    $msg = [
        "success" => true,
        "data"    => $data
    ];

    if ($total !== null) {
        $msg["total"] = $total;
    }

    echo json_encode($msg);
}

function sendError($msg)
{
    header("Content-Type: application/json");

    die(json_encode([
        "success" => false,
        "msg"     => $msg
    ]));
}

function getQueryDate($name)
{
    return isset($_GET[$name]) ? date_create($_GET[$name]) : null;
}

?>
