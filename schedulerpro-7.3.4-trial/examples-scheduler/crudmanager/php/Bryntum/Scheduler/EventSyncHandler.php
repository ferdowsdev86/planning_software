<?php

namespace Bryntum\Scheduler;

use Bryntum\CRUD\SyncHandler;
use Bryntum\Util\MySql;

class EventSyncHandler extends SyncHandler
{
    private $scheduler;
    private $phantomIdMap;

    public function __construct(&$scheduler)
    {
        $this->scheduler = &$scheduler;
        $this->phantomIdMap = &$scheduler->phantomIdMap['events'];
    }

    protected function prepareEvent(&$data)
    {
        // initialize returning hash
        $result = array();

        // Process datetime fields (turns field values to server timezone)

        if (isset($data['startDate'])) {
            $data['startDate'] = MySql::formatDate($data['startDate']);
        }

        if (isset($data['endDate'])) {
            $data['endDate'] = MySql::formatDate($data['endDate']);
        }

        if (isset($data['duration'])) {
            $data['duration'] = MySql::formatFloat($data['duration']);
        }

        return $result;
    }

    public function add(&$event)
    {
        $response = $this->prepareEvent($event);
        $this->scheduler->saveEvent($event);
        return $response;
    }

    public function update(&$event)
    {
        $response = $this->prepareEvent($event);
        $this->scheduler->saveEvent($event);
        return $response;
    }

    public function remove($records)
    {
        $this->scheduler->removeEvents(['id' => array_column($records, 'id')]);
    }

    protected function onRecordAdded($record, &$recordResponse, $phantomId)
    {
        parent::onRecordAdded($record, $recordResponse, $phantomId);

        // let's keep phantom Id to real Id mapping
        $this->phantomIdMap[$phantomId] = $recordResponse['id'];

        return $recordResponse;
    }
}
