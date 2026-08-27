<?php

require_once "event-generator.php";

function &getEvents($startDate, $endDate, $resourceIds)
{
    $startDate = getQueryDate("startDate");
    $endDate   = getQueryDate("endDate");

    // Events are generated when requested for performance reasons. Used for demo purposes only.
    // Will not re-generate events that has been removed
    $events = generateEvents($startDate, $endDate, $resourceIds);

    // Add added records. Always add all, for simplicity
    $events = array_merge($events, $_SESSION["addedEvents"]);

    // Apply updates
    foreach ($_SESSION["updatedEvents"] as $id => $mod)
    {
        $key = array_search($id, array_column($events, "id"));

        if ($key !== false)
        {
            $events[$key] = array_replace($events[$key], $mod);
        }
    }


    return $events;
}

?>
