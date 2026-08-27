<?php

/**
 * generate.php
 *
 * This script generates movie theater scheduling data.
 *
 * Accepted GET parameters:
 * - cinemaCount      : Number of cinemas to include (1-50)
 * - movieCount       : Number of unique movies per cinema
 * - startDate        : Start date for movie schedule (YYYY-MM-DD)
 * - endDate          : End date for movie schedule (YYYY-MM-DD)
 * - startTime        : Opening time of cinema (HH:mm)
 * - endTime          : Closing time of cinema (HH:mm)
 * - minEventsCount   : Minimum number of movie shows per day per movie
 * - eventsCount      : Maximum number of movie shows per day per movie
 *
 * Output:
 * - ../data/resources.json : Cinema & movie tree for schedule resources
 * - ../data/events.json    : Scheduled movie showtimes
 * - ../data/genres.json    : Unique genre list extracted from movies
 *
 * Sample usage:
 * generate.php?cinemaCount=50&movieCount=10&startDate=2025-04-14&endDate=2025-04-20&startTime=09:00&endTime=23:59&minEventsCount=2&eventsCount=4
 */

$cinemaFile     = '../data/cinema.json';
$movieFile      = '../data/movie.json';
$resourceOutput = '../data/resources.json';
$eventsOutput   = '../data/events.json';
$genresOutput   = '../data/genres.json';

function loadJson($filename)
{
    return json_decode(file_get_contents($filename), true);
}

/**
 * Saves given data as a JSON file with formatted indentation.
 *
 * @param string $filename The name of the file where the JSON data will be saved.
 * @param mixed $data The data to be encoded into JSON format and saved to the file.
 *
 * @return void
 */
function saveJson($filename, $data)
{
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $json = preg_replace_callback('/^( +)/m', function ($m) {
        return str_repeat(' ', strlen($m[1]) / 4 * 2); // Convert 4-space indents to 2
    }, $json);
    file_put_contents($filename, $json);
}

/**
 * Generates a series of time slots based on a provided start time, end time, duration for each slot,
 * and a buffer time between slots. The first time slot is randomly selected within the first three hours
 * from the specified start time. Subsequent slots are spaced evenly between the initial slot and the end time.
 *
 * @param string $start The starting time in a recognizable date-time format.
 * @param string $end The ending time in a recognizable date-time format.
 * @param int $durationMin The duration of each time slot in minutes.
 * @param int $bufferMin The buffer time between consecutive slots in minutes.
 *
 * @return array An array of timestamps representing the start times of the generated time slots.
 */
function generateTimeSlots($start, $end, $durationMin, $bufferMin)
{
    $slots     = [];
    $startTime = strtotime(date('Y-m-d H:00:00', strtotime($start))); // round to hour
    $endTime   = strtotime($end);

    // First show: random within first 3 hours
    $maxFirstShow = min($startTime + 3 * 3600, $endTime - $durationMin * 60);
    $firstStart   = ceil(rand($startTime, $maxFirstShow) / 600) * 600;

    $slots[] = $firstStart;

    // Calculate how many more can fit
    $timeRemaining = $endTime - ($firstStart + $durationMin * 60);
    $numSlots      = floor($timeRemaining / ($durationMin * 60 + $bufferMin * 60));

    // Recalculate the spacing so that each slot has exact spacing after previous movie ends
    if ($numSlots > 0) {
        $actualGap   = $timeRemaining / $numSlots; // total gaps divided evenly
        $previousEnd = $firstStart + $durationMin * 60;

        for ($i = 0; $i < $numSlots; $i++) {
            $nextStart = ceil(($previousEnd + $actualGap - $bufferMin * 60) / 600) * 600;
            if ($nextStart + $durationMin * 60 <= $endTime) {
                $slots[]     = $nextStart;
                $previousEnd = $nextStart + $durationMin * 60;
            } else {
                break;
            }
        }
    }

    return $slots;
}

function pad($n)
{
    return str_pad($n, 2, '0', STR_PAD_LEFT);
}

function formatTimeRange($start, $end)
{
    return date('H:i', $start) . ' - ' . date('H:i', $end);
}

/**
 * Randomly shuffles the values of an associative array while maintaining their keys.
 *
 * @param array $list The associative array to be shuffled.
 *
 * @return array An array containing the shuffled values from the input array, without preserving key-value association.
 */
function shuffle_assoc($list)
{
    if (!is_array($list)) return $list;
    $keys = array_keys($list);
    shuffle($keys);
    $random = [];
    foreach ($keys as $key) {
        $random[] = $list[$key];
    }
    return $random;
}

$cinemas = loadJson($cinemaFile);
$movies  = loadJson($movieFile);

$cinemaCount = min((int)($_GET['cinemaCount'] ?? 10), count($cinemas));
$movieCount  = min((int)($_GET['movieCount'] ?? 5), count($movies));
$startDate   = $_GET['startDate'] ?? '2025-04-14';
$endDate     = $_GET['endDate'] ?? '2025-04-20';
$startTime   = $_GET['startTime'] ?? '09:00';
$endTime     = $_GET['endTime'] ?? '23:59';
$minEvents   = max((int)($_GET['minEventsCount'] ?? 3), 1);
$maxEvents   = max((int)($_GET['eventsCount'] ?? 5), $minEvents);

$selectedCinemas = array_slice($cinemas, 0, $cinemaCount);
$resources       = [];
$events          = [];
$eventId         = 1;
$bufferMin       = 60;

foreach ($selectedCinemas as $cIndex => $cinema) {
    $cinemaId       = (string)($cIndex + 1);
    $selectedMovies = array_slice(shuffle_assoc($movies), 0, $movieCount);
    $children       = [];

    foreach ($selectedMovies as $mIndex => $movie) {
        $movieId    = "$cinemaId-" . ($mIndex + 1);
        $children[] = array_merge($movie, [
            'id'      => $movieId,
            'name'    => $movie['name'],
            'iconCls' => 'fa fa-film'
        ]);

        $date = $startDate;
        while (strtotime($date) <= strtotime($endDate)) {
            $slots = generateTimeSlots("$date $startTime", "$date $endTime", $movie['duration'], $bufferMin);
            shuffle($slots);
            $used  = [];
            $added = 0;

            foreach ($slots as $slotStart) {
                $slotEnd = $slotStart + $movie['duration'] * 60;
                $overlap = false;
                foreach ($used as [$usedStart, $usedEnd]) {
                    if (!($slotEnd + ($bufferMin * 60) <= $usedStart || $slotStart >= $usedEnd + ($bufferMin * 60))) {
                        $overlap = true;
                        break;
                    }
                }
                if ($overlap) continue;

                $used[]   = [$slotStart, $slotEnd];
                $events[] = [
                    'id'           => (string)$eventId++,
                    'name'         => formatTimeRange($slotStart, $slotEnd),
                    'startDate'    => date('Y-m-d\TH:i:s', $slotStart),
                    'endDate'      => date('Y-m-d\TH:i:s', $slotEnd),
                    'duration'     => $movie['duration'],
                    'durationUnit' => 'min',
                    'resourceId'   => $movieId,
                    'iconCls'      => 'fa fa-clock'
                ];

                if (++$added >= rand($minEvents, $maxEvents)) break;
            }
            $date = date('Y-m-d', strtotime($date . ' +1 day'));
        }
    }

    $resources[] = [
        'id'       => $cinemaId,
        'name'     => $cinema['name'],
        'city'     => $cinema['city'],
        'iconCls'  => 'fa fa-building',
        'expanded' => $cIndex < 3, // true for first 3 cinemas
        'children' => $children
    ];
}

// Generate genres.json
$genreMap = [];
foreach ($movies as $movie) {
    if (!empty($movie['genre'])) {
        $genreMap[$movie['genre']] = true;
    }
}

$genreNames = array_keys($genreMap);
sort($genreNames, SORT_STRING | SORT_FLAG_CASE);

$genres = [];
foreach ($genreNames as $genreName) {
    $genres[] = [
        'value' => strtolower($genreName),
        'text' => $genreName
    ];
}

saveJson($resourceOutput, $resources);
saveJson($eventsOutput, $events);
saveJson($genresOutput, $genres);
