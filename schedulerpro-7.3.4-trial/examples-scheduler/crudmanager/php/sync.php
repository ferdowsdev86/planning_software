<?php

use Bryntum\Scheduler;
use const Bryntum\CRUD\ADDED_ROWS;
use const Bryntum\CRUD\UPDATED_ROWS;
use const Bryntum\CRUD\REMOVED_ROWS;

try {

    global $app;

    // initialize application
    include 'init.php';

    // decode request object
    $request = json_decode(file_get_contents('php://input'), true);

    $response = [
        'success'   => true,
        'requestId' => $request['requestId']
    ];

    $app->db->beginTransaction();

    // Here we reject client's changes if we suspect that they are outdated
    // considering difference between server and client revisions.
    // You can get rid of this call if you don't need such behavior.
    if (isset($request['revision'])) {
        $app->checkRevision($request['revision']);
    }

    // if a corresponding store modified data are provided then we handle them

    // first let's process added and updated records

    $resourceHandler = $eventHandler = $assignmentHandler = $dependencyHandler = $timeRangesHandler = $resourceTimeRangesHandler = null;

    // if we have resources to sync
    if (isset($request['resources'])) {
        $resourceHandler = new Scheduler\ResourceSyncHandler($app);
        $response['resources'] = $resourceHandler->handle($request['resources'], ADDED_ROWS | UPDATED_ROWS);
    }
    // if we have events to sync
    if (isset($request['events'])) {
        $eventHandler = new Scheduler\EventSyncHandler($app);
        $response['events'] = $eventHandler->handle($request['events'], ADDED_ROWS | UPDATED_ROWS);
    }

    // if we have assignments to sync
    if (isset($request['assignments'])) {
        $assignmentHandler = new Scheduler\AssignmentSyncHandler($app);
        $response['assignments'] = $assignmentHandler->handle($request['assignments'], ADDED_ROWS | UPDATED_ROWS);
    }

    // if we have dependencies to sync
    if (isset($request['dependencies'])) {
        $dependencyHandler = new Scheduler\DependencySyncHandler($app);
        $response['dependencies'] = $dependencyHandler->handle($request['dependencies'], ADDED_ROWS | UPDATED_ROWS);
    }

    // if we have timeRanges to sync
    if (isset($request['timeRanges'])) {
        $timeRangesHandler = new Scheduler\TimeRangeSyncHandler($app);
        $response['timeRanges'] = $timeRangesHandler->handle($request['timeRanges'], ADDED_ROWS | UPDATED_ROWS);
    }

    // if we have resourceTimeRanges to sync
    if (isset($request['resourceTimeRanges'])) {
        $resourceTimeRangesHandler = new Scheduler\ResourceTimeRangeSyncHandler($app);
        $response['resourceTimeRanges'] = $resourceTimeRangesHandler->handle($request['resourceTimeRanges'], ADDED_ROWS | UPDATED_ROWS);
    }

    // then let's process records removals

    if ($resourceTimeRangesHandler) {
        $resourceTimeRangesHandler->handle($request['resourceTimeRanges'], REMOVED_ROWS, $response['resourceTimeRanges']);
        if (!sizeof($response['resourceTimeRanges'])) unset($response['resourceTimeRanges']);
    }

    if ($timeRangesHandler) {
        $timeRangesHandler->handle($request['timeRanges'], REMOVED_ROWS, $response['timeRanges']);
        if (!sizeof($response['timeRanges'])) unset($response['timeRanges']);
    }

    if ($dependencyHandler) {
        $dependencyHandler->handle($request['dependencies'], REMOVED_ROWS, $response['dependencies']);
        if (!sizeof($response['dependencies'])) unset($response['dependencies']);
    }

    if ($assignmentHandler) {
        $assignmentHandler->handle($request['assignments'], REMOVED_ROWS, $response['assignments']);
        if (!sizeof($response['assignments'])) unset($response['assignments']);
    }

    if ($eventHandler) {
        $eventHandler->handle($request['events'], REMOVED_ROWS, $response['events']);
        if (!sizeof($response['events'])) unset($response['events']);
    }

    if ($resourceHandler) {
        $resourceHandler->handle($request['resources'], REMOVED_ROWS, $response['resources']);
        if (!sizeof($response['resources'])) unset($response['resources']);
    }

    $app->db->commit();

    // return updated server revision mark
    $response['revision'] = $app->getRevision();

    die(json_encode($response));

// handle exceptions gracefully
} catch (Exception $e) {
    $app->db->rollback();

    $response['success'] = false;
    $response['message'] = $e->getMessage();
    $response['code'] = $e->getCode();
    die(json_encode($response));
}
