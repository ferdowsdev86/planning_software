<?php

namespace Bryntum\Scheduler;

use Bryntum\CRUD\SyncHandler;

class AssignmentSyncHandler extends SyncHandler
{

    private $scheduler;

    public function __construct(&$scheduler)
    {
        $this->scheduler = &$scheduler;
    }

    protected function prepareData(&$data)
    {
        // initialize returning hash
        $result = array();

        $eventIds = $this->scheduler->phantomIdMap['events'];

        // get newly created event Id if this is a reference to a phantom event
        if (isset($eventIds[@$data['eventId']])) {
            // use & return actual Id
            $data['eventId'] = $result['eventId'] = $eventIds[$data['eventId']];
        }

        $resourceIds = $this->scheduler->phantomIdMap['resources'];
        // get newly created resource Id if this is a reference to a phantom resource
        if (isset($resourceIds[@$data['resourceId']])) {
            // use & return actual Id
            $data['resourceId'] = $result['resourceId'] = $resourceIds[$data['resourceId']];
        }

        return $result;
    }

    public function add(&$assignment)
    {
        $response = $this->prepareData($assignment);
        $this->scheduler->saveAssignment($assignment);
        return $response;
    }

    public function update(&$assignment)
    {
        $response = $this->prepareData($assignment);
        $this->scheduler->saveAssignment($assignment);
        return $response;
    }

    public function remove($records)
    {
        $this->scheduler->removeAssignments(['id' => array_column($records, 'id')]);
    }
}
