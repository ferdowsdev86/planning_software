<?php

use Bryntum\Util\ScriptEditor;

// initialize application
require_once 'init.php';

try {
    // decode request object
    $request = json_decode($_GET['data'], true);

    $response = [
        'success' => false,
        'requestId' => $request['requestId']
    ];

    // Process reset option
    if (isset($request['reset'])) {
        $response['reset'] = true;

        // get "data" region of sql/setup.sql script
        $sql = ScriptEditor::getFileRegion(dirname(__DIR__) . '/sql/setup.sql', 'data');

        $app->db->exec($sql);
    }

    // get request parameters for the stores
    $storeParams = [];
    foreach ($request['stores'] as $store) {
        if (is_array($store)) {
            // keep request params for the store
            $storeParams[$store['storeId']] = $store;
        } else {
            $storeParams[$store] = $store;
        }
    }

    // if resource store was requested for loading
    if (isset($storeParams['resources'])) {
        $response['resources'] = [
            // get rows
            'rows' => $app->getResources(),
            // get total number of found resources
            'total' => $app->getFoundRows()
        ];
    }
    // if assignment store was requested for loading
    if (isset($storeParams['assignments'])) {
        $response['assignments'] = [
            // get rows
            'rows' => $app->getAssignments(),
            // get total number of found assignments
            'total' => $app->getFoundRows()
        ];
    }
    // if dependency store was requested for loading
    if (isset($storeParams['dependencies'])) {
        $response['dependencies'] = [
            // get rows
            'rows' => $app->getDependencies(),
            // get total number of found dependencies
            'total' => $app->getFoundRows()
        ];
    }
    // if event store was requested for loading
    if (isset($storeParams['events'])) {
        $response['events'] = [
            // get rows
            'rows' => $app->getEvents()
        ];
    }
    // if timeRanges was requested for loading
    if (isset($storeParams['timeRanges'])) {
        $response['timeRanges'] = [
            // get rows
            'rows' => $app->getTimeRanges()
        ];
    }
    // if resourceTimeRanges was requested for loading
    if (isset($storeParams['resourceTimeRanges'])) {
        $response['resourceTimeRanges'] = [
            // get rows
            'rows' => $app->getResourceTimeRanges()
        ];
    }

    $response['success'] = true;
    // return server revision mark
    $response['revision'] = $app->getRevision();
    die(json_encode($response));
// handle exceptions gracefully
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    $response['code'] = $e->getCode();
    die(json_encode($response));
}
