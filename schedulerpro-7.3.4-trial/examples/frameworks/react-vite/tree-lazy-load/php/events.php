<?php

/**
 * events.php
 *
 * Loads scheduled movie events from ../data/events.json, filtered by date range and resource IDs.
 *
 * Query Parameters:
 * ------------------
 * - startDate (string, required): Start of the date range (ISO format, e.g. 2025-04-14T00:00:00)
 * - endDate (string, required): End of the date range (ISO format, e.g. 2025-04-15T00:00:00)
 * - resourceIds (string, required): Comma-separated list of resource (movie) IDs to filter (e.g. 1-1,1-2)
 *
 * Response:
 * ---------
 * - The `data` array will contain at most `count` items, starting from `startIndex`
 * - The `total` value in the response reflects number data records
 *
 * Example:
 * --------
 * GET /events.php?startDate=2025-04-14T00:00:00&endDate=2025-04-15T00:00:00&resourceIds=1-1,1-2
 */

// Path to your events data JSON file in the upper-level directory
define('EVENTS_DATA_FILE', __DIR__ . '/data/events.json');

/**
 * Load event data from the JSON file.
 */
function loadEventsData(string $filePath): array
{
    if (!file_exists($filePath)) {
        throw new Exception("File not found: $filePath");
    }

    $json = file_get_contents($filePath);
    $data = json_decode($json, true);

    if ($data === null) {
        throw new Exception("Invalid JSON in $filePath");
    }

    return $data;
}

/**
 * Check if two time ranges intersect.
 */
function dateRangesIntersect(string $startA, string $endA, string $startB, string $endB): bool
{
    return (strtotime($startA) < strtotime($endB)) && (strtotime($startB) < strtotime($endA));
}

/**
 * Filter events based on resourceIds and date range.
 */
function requestData(array $params, array $eventsData): array
{
    $startDate   = isset($params['startDate']) ? $params['startDate'] : null;
    $endDate     = isset($params['endDate']) ? $params['endDate'] : null;
    $resourceIds = isset($params['resourceIds']) ? explode(',', $params['resourceIds']) : [];

    if (!$startDate || !$endDate || empty($resourceIds)) {
        throw new Exception("Missing required parameters: startDate, endDate, resourceIds");
    }

    $filtered = array_filter($eventsData, function ($event) use ($resourceIds, $startDate, $endDate) {
        return in_array($event['resourceId'], $resourceIds) &&
            dateRangesIntersect($startDate, $endDate, $event['startDate'], $event['endDate']);
    });

    return [
        'data'  => array_values($filtered),
        'total' => count($filtered)
    ];
}

// ---------- MAIN EXECUTION ----------

header('Content-Type: application/json');

try {
    $eventsData = loadEventsData(EVENTS_DATA_FILE);

    $params = [
        'startDate'   => $_GET['startDate'] ?? null,
        'endDate'     => $_GET['endDate'] ?? null,
        'resourceIds' => $_GET['resourceIds'] ?? ''
    ];

    echo json_encode(requestData($params, $eventsData), JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
