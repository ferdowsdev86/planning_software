<?php

// Stateless demo backend that GENERATES resources and events on demand, so the
// scheduler can be scrolled "infinitely" along both axes without shipping any
// data files:
//   - vertical   : resources are generated per requested startIndex/count
//   - horizontal : events are generated per requested resource window + date range
// Generation is deterministic — the same request always yields the same data, so
// repeated fetches while scrolling never flicker or shift.

// Total number of resources the backend can serve (the vertical axis). Lazy
// loading needs a finite total to size the scrollbar, so "infinite" in practice
// means a large finite number. Can be overridden per request with ?total=N.
const RESOURCE_TOTAL = 5000;

// Pools used to turn an integer id into readable, varied demo data. Avatars are the
// image filenames shipped by @bryntum/demo-resources (copied to public/users on install);
// the resource's first name is derived from the avatar so the face matches the name.
// Deliberately NOT alphabetical: resources walk this list in a ping-pong order, so a
// shuffled list keeps the (period-84) up-and-down cycle from being visually obvious.
const AVATARS = [
    "mike.png", "barbara.png", "jong.png", "dave.png", "gloria.png", "sam.png",
    "arnold.png", "kate.png", "henrik.png", "lola.png", "daniel.png", "melissa.png",
    "chang.png", "peter.png", "jane.png", "adam.png", "lisa.png", "george.png",
    "malik.png", "doug.png", "celia.png", "maxim.png", "don.png", "karen.png",
    "rob.png", "emilia.png", "mark.png", "hitomi.png", "linda.png", "dan.png",
    "madison.png", "angelo.png", "jenny.png", "steve.png", "david.png", "macy.png",
    "amit.png", "lee.png", "ellen.png", "mary.png", "arcady.png", "john.png", "james.png"
];
const LAST_NAMES = [
    "Taylor", "Adams", "Jones", "Davis", "Johnson", "Brown", "Wilson", "Miller", "Moore", "Clark",
    "Lewis", "Walker", "Hall", "Young", "King", "Wright", "Hill", "Green", "Baker", "Carter"
];
const CITIES = [
    "Moscow", "Paris", "Dubai", "London", "New York", "Rome", "Madrid", "Berlin", "Tokyo", "Oslo"
];

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
// Bryntum named event colors (see the EventColor type). Each event is assigned one
// at random (but stable per event) to keep the schedule colorful.
const EVENT_COLORS = [
    "red", "pink", "magenta", "purple", "violet", "indigo",
    "blue", "cyan", "teal", "green", "orange", "deep-orange"
];

// Picks an entry from $pool that looks random but is stable for a given id: the
// same id always yields the same entry (so re-fetched pages don't reshuffle),
// while the $salt makes each field vary independently of the others.
function pickFrom($pool, $salt, $id)
{
    return $pool[crc32($salt . $id) % count($pool)];
}

// Generates `count` resources starting at `startIndex` (0-based), capped at `total`.
// Avatars (and thus first names) are chosen by walking the AVATARS list in a ping-pong
// order — 0,1,…,N-1,N-2,…,1,0,1,… — so consecutive rows never share an avatar/first name.
function generateResources($startIndex, $count, $total)
{
    $resources   = [];
    $end         = min($startIndex + $count, $total);
    $avatarCount = count(AVATARS);
    $period      = 2 * ($avatarCount - 1); // one full up-and-down sweep

    // Ids are 1-based; iterate them directly over the requested window.
    for ($id = $startIndex + 1; $id <= $end; $id++) {
        $p   = ($id - 1) % $period;
        $idx = $p < $avatarCount ? $p : $period - $p; // fold the back half down

        $avatar      = AVATARS[$idx];
        // Derive the first name from the avatar filename (e.g. "don.png" -> "Don").
        $firstName   = ucfirst(pathinfo($avatar, PATHINFO_FILENAME));
        $resources[] = [
            "id"    => $id,
            "name"  => $firstName . " " . pickFrom(LAST_NAMES, "last", $id),
            "city"  => pickFrom(CITIES, "city", $id),
            "image" => $avatar
        ];
    }

    return $resources;
}

// Generates one event per resource for each month within [$startDate, $endDate].
function generateEvents($startDate, $endDate, $resourceIds)
{
    $events = [];
    $cursor = new DateTime($startDate->format("Y-m-01"));

    while ($cursor <= $endDate) {
        $month = $cursor->format("Y-m");

        foreach ($resourceIds as $id) {
            // Seed by (resource, month) so each monthly event differs — name, start
            // day and length all vary month to month, yet stay stable on re-fetch.
            $seed     = $month . "-" . $id;
            $startDay = crc32("day" . $seed) % 28 + 1;
            $duration = crc32("dur" . $seed) % 8 + 1;
            $start    = new DateTime(sprintf("%s-%02d", $month, $startDay));
            $end      = (clone $start)->modify("+{$duration} days");
            $name     = pickFrom(EVENT_NAMES, "name", $seed);

            $events[] = [
                "id"         => $month . "-" . $id,
                "resourceId" => $id,
                "startDate"  => $start->format("Y-m-d"),
                "endDate"    => $end->format("Y-m-d"),
                "name"       => $name,
                "eventColor" => pickFrom(EVENT_COLORS, "color", $seed)
            ];
        }

        $cursor->modify("first day of next month");
    }

    return $events;
}

?>
