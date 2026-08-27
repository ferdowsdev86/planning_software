<?php

require_once "event-generator.php";

function getEvents($startDate, $endDate, $resourceIds)
{
    // Events are generated when requested for performance reasons. Used for demo purposes only.
    // Will not re-generate events that has been removed
    $data = generateEvents($startDate, $endDate, $resourceIds);
    $events = $data[0];
    $assignments = $data[1];

    // Add added events. Always add all, for simplicity
    $events = array_merge($events, $_SESSION["addedEvents"]);

    // Add added assignments. Always add all, for simplicity
    $assignments = array_merge($assignments, $_SESSION["addedAssignments"]);

    // Apply updated events
    foreach ($_SESSION["updatedEvents"] as $id => $mod)
    {
        $key = array_search($id, array_column($events, "id"));

        if ($key !== false)
        {
            $events[$key] = array_replace($events[$key], $mod);
        }
    }

    // Apply updated assignments
    foreach ($_SESSION["updatedAssignments"] as $id => $mod)
    {
        $key = array_search($id, array_column($assignments, "id"));

        if ($key != false)
        {
            $assignments[$key] = array_replace($assignments[$key], $mod);
        }
    }


    return [$events, $assignments];
}

?>
