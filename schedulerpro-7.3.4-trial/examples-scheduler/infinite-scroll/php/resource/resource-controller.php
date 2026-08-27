<?php

function &getResources()
{
    return $_SESSION["resources"];
}

function readResources($startIndex, $count, $sort, $filter, $ignoreSort = false)
{
    // Used to filter the in-memory "database" by different "operators"
    $filterEvaluators = [
        "*" => fn ($a, $b) => $a === $b || str_contains(strval($a), $b),
        "=" => fn ($a, $b) => $a === $b,
        ">" => fn ($a, $b) => $a > $b,
        "<" => fn ($a, $b) => $a < $b
    ];

    // Sorting only needed when loading from 0 (initial load or reload), as were sorting the dataset in-place
    if ($startIndex == 0 && !$ignoreSort)
    {
        if ($sort)
        {
            $sorters = json_decode($sort);
            foreach ($sorters as $sorter)
            {
                sortResources($sorter->field, $sorter->ascending);
            }
            $_SESSION["resourcesIsSorted"] = true;
        }
        else if ($_SESSION["resourcesIsSorted"])
        {
            sortResources();
            $_SESSION["resourcesIsSorted"] = false;
        }
    }

    $result = getResources();

    if ($filter){
        $filters = json_decode($filter);
        // Each filter object has 4 properties:
        // * field (string)
        // operator (=,*,>,< supported in this backend)
        // value
        // caseSensitive (boolean)
        foreach ($filters as $filter)
        {
            $field = $filter->field;
            $operator = $filter->operator;
            $caseSensitive = $filter->caseSensitive;
            $filterValue = $filter->value;

            if (!$caseSensitive)
            {
                $filterValue = strtolower($filterValue);
            }

            $evaluator = $filterEvaluators[$operator];

            $result = array_filter($result, function ($r) use ($caseSensitive, $field, $filterValue, $evaluator)
            {
                $recordValue = $r[$field];
                if (!$caseSensitive)
                {
                    $recordValue = strtolower($recordValue);
                }
                return $evaluator($recordValue, $filterValue);
            });
        }
    }

    $total = count($result);
    $result = array_slice($result, $startIndex, $count);
    return array($result, $total);
}



function sortResources($field = "id", $ascending = true)
{
    $data =& getResources();
    usort($data, 
        function ($a,$b) use ($ascending, $field) 
        {
              $n = ($ascending == true) ? 1 : -1;
              return ($a[$field] > $b[$field]) ? $n : $n * -1;
          });
}

function addResource(&$record)
{
    $record["id"] = ++$_SESSION["resourceMaxId"];
    $_SESSION["resources"][] = $record;
}


function &getResource($id)
{
    $resources =& getResources();
    $key = array_search($id, array_column($resources, "id"));
    return $resources[$key];
}

?>
