<?php

namespace Bryntum\Scheduler;

use Bryntum\CRUD\SyncHandler;

class DependencySyncHandler extends SyncHandler
{

    private $scheduler;

    public function __construct(&$scheduler)
    {
        $this->scheduler = &$scheduler;
    }

    protected function prepareData(&$data)
    {
        // initialize response part related to the record
        $response = [];

        $eventIds = $this->scheduler->phantomIdMap['events'];

        if (isset($data['type'])) {
            $data['typ'] = $data['type'];
            unset($data['type']);
        }

        // get newly created event Ids if these are references to phantom events
        if (isset($data['from']) && isset($eventIds[$data['from']])) {
            // use & return actual Id
            $data['from'] = $response['from'] = $eventIds[$data['from']];
        }

        if (isset($data['to']) && isset($eventIds[$data['to']])) {
            // use & return actual Id
            $data['to'] = $response['to'] = $eventIds[$data['to']];
        }

        return $response;
    }

    public function add(&$dependency)
    {
        $response = $this->prepareData($dependency);
        $this->scheduler->saveDependency($dependency);
        return $response;
    }

    public function update(&$dependency)
    {
        $response = $this->prepareData($dependency);
        $this->scheduler->saveDependency($dependency);
        return $response;
    }

    public function remove($records)
    {
        $this->scheduler->removeDependencies(['id' => array_column($records, 'id')]);
    }
}
