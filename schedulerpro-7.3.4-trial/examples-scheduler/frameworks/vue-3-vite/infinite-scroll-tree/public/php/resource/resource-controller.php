<?php

function &getResources()
{
    return $_SESSION["resources"];
}

function readResources($parentId, $startIndex, $count, $sort, $filter)
{
    // Used to filter the in-memory "database" by different "operators"
    $filterEvaluators = [
        "*" => fn ($a, $b) => $a === $b || str_contains(strval($a), $b),
        "=" => fn ($a, $b) => $a === $b,
        ">" => fn ($a, $b) => $a > $b,
        "<" => fn ($a, $b) => $a < $b
    ];

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

            $filtered = [];

            function includeParent ($r, &$includeIn)
            {
                if (isset($r["parentId"]))
                {
                    $parent = getResource($r["parentId"]);
                    if (!in_array($parent, $includeIn))
                    {
                        $includeIn[] = $parent;
                    }
                    includeParent($parent, $includeIn);
                }
            }

            foreach ($data as $r)
            {
                $recordValue = $r[$field];
                if (!$caseSensitive)
                {
                    $recordValue = strtolower($recordValue);
                }
                if ($evaluator($recordValue, $filterValue)) {
                    if (!in_array($r, $filtered))
                    {
                        $filtered[] = $r;
                    }
                    includeParent($r, $filtered);
                }
            }
        }
    }

    $total = count($result);
    $result = getChildren($parentId, $result);


    if ($sort)
    {
        $sorters = json_decode($sort);
        foreach ($sorters as $sorter)
        {
            $result = sortResources($result, $sorter->field, $sorter->ascending);
        }
    }
    else {
        $result = sortResources($result, 'id', true);
    }

    $result = array_slice($result, $startIndex, $count);

    return array($result, $total);
}



function sortResources(&$data, $field = "id", $ascending = true)
{
    usort($data, 
        function ($a,$b) use ($ascending, $field) 
        {
              $n = ($ascending == true) ? 1 : -1;
              return ($a[$field] > $b[$field]) ? $n : $n * -1;
          });
    return $data;
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

function getChildren ($id, &$data) {
    $children = array_filter($data, function ($r) use ($id)
    {
        if ($id === 'root'){
            return !isset($r["parentId"]);
        }
        return isset($r["parentId"]) && $r["parentId"] == $id;
    });
    return $children;
}

?>
