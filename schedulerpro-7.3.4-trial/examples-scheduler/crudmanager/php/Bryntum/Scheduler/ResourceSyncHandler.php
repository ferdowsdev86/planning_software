<?php

namespace Bryntum\Scheduler;

use Bryntum\CRUD\SyncHandler;

class ResourceSyncHandler extends SyncHandler
{

    private $scheduler;
    private $phantomIdMap;

    public function __construct(&$scheduler)
    {
        $this->scheduler = &$scheduler;
        $this->phantomIdMap = &$scheduler->phantomIdMap['resources'];
    }

    protected function prepareData(&$data)
    {
        $result = [];

        if (@!$data['id']) {
            unset($data[$this->phantomIdField]);
        }

        return $result;
    }

    public function add(&$resource)
    {
        $response = $this->prepareData($resource);
        $this->scheduler->saveResource($resource);
        return $response;
    }

    public function update(&$resource)
    {
        $response = $this->prepareData($resource);
        $this->scheduler->saveResource($resource);
        return $response;
    }

    public function remove($records)
    {
        $this->scheduler->removeResources(['id' => array_column($records, 'id')]);
    }

    protected function onRecordAdded($record, &$recordResponse, $phantomId)
    {
        parent::onRecordAdded($record, $recordResponse, $phantomId);

        // let's keep phantom Id to real Id mapping
        $this->phantomIdMap[$phantomId] = $recordResponse['id'];

        return $recordResponse;
    }
}
