<?php

/**
 * resources.php
 *
 * Loads cinema and movie resources from ../data/resources.json with lazy loading support.
 *
 * Query Parameters:
 * ------------------
 * - count (int, optional): Number of resource items to return. Default: 5
 * - startIndex (int, optional): Index to start loading from. Default: 0
 * - parentId (string, optional): ID of the parent resource. Use 'root' to load top-level cinemas. Default: 'root'
 *
 * Response:
 * ---------
 * - The `data` array will contain at most `count` items, starting from `startIndex`
 * - The `total` value in the response always reflects the full number of available records (not just limited by `count`)
 *
 * Example:
 * --------
 * GET /resources.php?count=5&startIndex=0&parentId=root
 */

// Path to your JSON data file
define('RESOURCES_DATA_FILE', __DIR__ . '/data/resources.json');

/**
 * Load the resource data from the JSON file.
 */
function loadResourcesData(string $filePath): array
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
 * Apply filters to a single resource based on filter array.
 */
function matchesFilters(array $resource, array $filters): bool
{
    foreach ($filters as $filter) {
        $field = $filter['property'] ?? null;
        $value = strtolower(trim($filter['value'] ?? ''));

        if (!$field || !$value) continue;

        // Direct match on parent resource
        if (isset($resource[$field]) && stripos($resource[$field], $value) !== false) {
            return true;
        }

        // Special handling for child resources (check if field exists in children)
        if (isset($resource['children']) && is_array($resource['children'])) {
            foreach ($resource['children'] as $child) {
                if (isset($child[$field]) && stripos($child[$field], $value) !== false) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Filters resources based on the filter parameters.
 */
function filterResources(array $resourcesData, array $filters): array
{
    $filteredResources = []; // New array to store filtered results

    foreach ($resourcesData as $resource) {
        // First, filter the parent (resource) based on the filters
        if (!matchesFilters($resource, $filters)) {
            continue; // Skip this resource if it doesn't match the filters
        }

        // If the resource has children, filter them too
        if (isset($resource['children']) && is_array($resource['children'])) {
            // Filter children using array_filter
            $filteredChildren = array_filter($resource['children'], function ($child) use ($filters) {
                return matchesFilters($child, $filters);
            });

            // If there are valid children left after filtering, reindex and add them back to the resource
            if (!empty($filteredChildren)) {
                $resource['children'] = array_values($filteredChildren); // Re-index the filtered array
            } else {
                // If no valid children remain, remove the 'children' key from the resource
                unset($resource['children']);
            }
        }

        // Add the resource to the filtered array
        $filteredResources[] = $resource;
    }

    return $filteredResources;
}

/**
 * Returns a chunk of data according to lazy-loading parameters and filters.
 */
function requestData(array $params, array $resourcesData): array
{
    $count      = isset($params['count']) ? (int)$params['count'] : 5;
    $startIndex = isset($params['startIndex']) ? (int)$params['startIndex'] : 0;
    $parentId   = $params['parentId'] ?? 'root';
    $filters    = [];

    if (!empty($params['filters'])) {
        $decoded = urldecode($params['filters']);
        $decoded = json_decode($decoded, true);
        if (is_array($decoded)) {
            $filters = $decoded;
        }
    }

    // Apply filters to resources data if filters are present
    if (!empty($filters)) {
        $resourcesData = filterResources($resourcesData, $filters);
    }

    if ($parentId === 'root') {
        $resources = $resourcesData;
    } else {
        $parent = null;

        // Search for parent node
        foreach ($resourcesData as $resource) {
            if ($resource['id'] === $parentId) {
                $parent = $resource;
                break;
            }
        }

        $resources = $parent['children'] ?? [];
    }

    // Slice the resources for pagination
    $slicedResources = array_slice($resources, $startIndex, $count);

    // Prepare the data with necessary modifications
    $data = array_map(function ($r) {
        $res                     = $r;
        unset($res['children']);
        return $res;
    }, $slicedResources);

    return [
        'data'  => $data,
        'total' => count($resources)
    ];
}

// ---------- MAIN EXECUTION ----------

header('Content-Type: application/json');

try {
    $resourcesData = loadResourcesData(RESOURCES_DATA_FILE);

    $params = [
        'count'      => $_GET['count'] ?? 10,
        'startIndex' => $_GET['startIndex'] ?? 0,
        'parentId'   => $_GET['parentId'] ?? 'root',
        'filters'    => $_GET['filters'] ?? null
    ];

    echo json_encode(requestData($params, $resourcesData), JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

