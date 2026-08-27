<?php

require_once "event-controller.php";

const EVENT_NAMES = [
    "Meetings", "Documentation", "Email communication", "Project management", "Budgeting",
    "Marketing and advertising", "Customer service", "Research and analysis", "Data entry",
    "IT support", "Employee management", "Sales and business development",
    "Event planning", "Graphic design", "Writing and editing",
    "Presentation", "Travel arrangements and expense management", "Training and development",
    "Quality assurance", "Customer support", "Technical writing", "Social media management", "Translation",
    "Legal research", "Data analysis and visualization", "Video editing and production",
    "Network admin", "Content creation", "Market research", "Public relations", "Teaching and training",
    "Recruiting", "Product development"
];
const EVENT_COLORS = [
    "IT support" => "cyan",
    "Project management" => "orange",
    "Training and development" => "blue",
    "Public relations" => "red",
    "Graphic design" => "pink"
];

$eventsCount = count(EVENT_NAMES) - 1;

function distribute($base, $max)
{
    $f = $base % 3;
    $a = floor($max / 3);
    $n = $f * $a;

    return $base % 2 == 0 ? $n : $max - $n;
}

// This function generates one event per resource for each requested month. Used for demo purposes only.
// Will not generate events for a month more than once

function generateEvents($startDate, $endDate, $resourceIds)
{

    $eventsCount = count(EVENT_NAMES) - 1;
    $date        = clone $startDate;
    $threeWeeks  = date_interval_create_from_date_string("21 days");
    $doneMonths  = [];
    $events      = [];
    $assignments = [];

    while ($date < $endDate)
    {
        $month = date_format($date, "Y-m");

        if (!isset($doneMonths[$month]))
        {
            $doneMonths[$month] = true;

            // Each resource has one event per month, start date depends on resource id, length depends on resource id
            foreach($resourceIds as $id)
            {
                $eventId = $month . "-" . $id;

                // Skip re-generating events that has been removed
                if (!in_array($eventId, $_SESSION["removedEventIds"]))
                {
                    // start and end dates are distributed across each month depending on resource id
                    $startDay = distribute($id, 20);
                    $duration = distribute($id, 8);
                    $start    = new DateTime($month . "-" . $startDay);
                    $end      = new DateTime($month . "-" . $startDay + $duration);

                    // event name is also distributed depending on resource id
                    $nameIndex   = $id % 2 ? $id % $eventsCount : $eventsCount - $id % $eventsCount;
                    $name        = EVENT_NAMES[$nameIndex];

                    $events[] = [
                        "id"         => $eventId,
                        "startDate"  => date_format($start, "Y-m-d"),
                        "endDate"    => date_format($end, "Y-m-d"),
                        "name"       => $name,
                        "eventColor" => EVENT_COLORS[$name] ?? NULL
                    ];

                    $assignments[] = [
                        "id"         => $eventId,
                        "eventId"    => $eventId,
                        "resourceId" => $id
                    ];
                }
            }
        }

        date_add($date, $threeWeeks);
    }

    return [$events, $assignments];
}

?>
