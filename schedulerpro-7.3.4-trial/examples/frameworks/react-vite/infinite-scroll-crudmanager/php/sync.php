<?php

require_once "session.php";
require_once "resource/resource-controller.php";

$body = file_get_contents("php://input");
$data = json_decode($body, true);

$addedResources   = array();
$addedEvents      = array();
$addedAssignments = array();

if (isset($data["events"]))
{
    $events = $data["events"];

    if (isset($events["added"]))
    {
        foreach ($events["added"] as &$event)
        {
            $event["id"] = ++$_SESSION["eventMaxId"];
            $_SESSION["addedEvents"][] = $event;

            $addedEvents[] = $event;
        }
    }

    if (isset($events["updated"]))
    {
        foreach ($events["updated"] as $updatedEvent)
        {
            $_SESSION["updatedEvents"][$updatedEvent["id"]] = $updatedEvent;
        }
    }

    if (isset($events["removed"]))
    {
        foreach ($events["removed"] as $event)
        {
            $_SESSION["removedEventIds"][] = $event["id"];
        }
    }
}

if (isset($data["assignments"]))
{
    $assignments = $data["assignments"];

    if (isset($assignments["added"]))
    {
        foreach ($assignments["added"] as &$assignment)
        {
            // Match newly added assignments with newly added events
            if (str_starts_with($assignment["eventId"], "_generated"))
            {
                $eventMatch = find($addedEvents, "phantomId", $assignment["eventId"]);
                $assignment["eventId"] = $eventMatch["id"];
            }

            $assignment["id"] = ++$_SESSION["assignmentMaxId"];
            $_SESSION["addedAssignments"][] = $assignment;

            $addedAssignments[] = $assignment;
        }
    }

    if (isset($assignments["updated"]))
    {
        foreach ($assignments["updated"] as $updatedAssignment)
        {
            $_SESSION["updatedAssignments"][$updatedAssignment["id"]] = $updatedAssignment;
        }
    }

    if (isset($assignments["removed"]))
    {
        foreach ($assignments["removed"] as $assignment)
        {
            $_SESSION["removedAssignmentIds"][] = $assignment["id"];
        }
    }
}

if (isset($data["resources"]))
{
    $resources = $data["resources"];

    if (isset($resources["added"]))
    {
        foreach ($resources["added"] as $resource)
        {
            addResource($resource);
            $addedResources[] = $resource;
        }

        sortResources();
    }

    if (isset($resources["updated"]))
    {
        foreach ($resources["updated"] as $updatedResource)
        {
            $resource =& getResource($updatedResource["id"]);

            foreach ($updatedResource as $field => $value)
            {
                $resource[$field] = $value;
            }
        }
    }

    if (isset($resources["removed"]))
    {
        $allResources =& getResources();
        foreach ($resources["removed"] as $resource)
        {
            $record = &getResource($resource["id"]);
            $ix = array_search($record, $allResources, true);

            if ($ix >= 0)
            {
                array_splice($allResources, $ix, 1);
            }
        }
    }
}

$response = [];

if (count($addedResources) > 0)
{
    $response["resources"] = [
        "rows" => $addedResources
    ];
}

if (count($addedEvents) > 0)
{
    $response["events"] = [
        "rows" => $addedEvents
    ];
}

if (count($addedAssignments))
{
    $response["assignments"] = [
        "rows" => $addedAssignments
    ];
}

sendData($response, isset($data["requestId"]) ? $data["requestId"] : null);

?>
