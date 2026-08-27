<?php

namespace Bryntum\CRUD;

const ADDED_ROWS   = 0b0001;
const UPDATED_ROWS = 0b0010;
const REMOVED_ROWS = 0b0100;
const META_DATA    = 0b1000;

const ALL_ROWS = ADDED_ROWS | UPDATED_ROWS | REMOVED_ROWS;
const ALL      = ALL_ROWS | META_DATA;

abstract class SyncHandler
{

    protected $phantomIdField = '$PhantomId';
    protected $idField = 'id';

    public function __construct($phantomIdField = null, $idField = null)
    {
        if ($phantomIdField) {
            $this->phantomIdField = $phantomIdField;
        }
        if ($idField) {
            $this->idField = $idField;
        }
    }

    abstract public function add(&$record);

    abstract public function update(&$record);

    abstract public function remove($records);

    protected function onRecordAdded($record, &$recordResponse, $phantomId)
    {
        $recordResponse[$this->phantomIdField] = $phantomId;
        $recordResponse[$this->idField] = @$record[$this->idField];

        return $recordResponse;
    }

    protected function onRecordUpdated($record, &$recordResponse)
    {
        // If got some response for the record update operation
        // make sure it includes the record identifier
        if (sizeof($recordResponse) && !@$recordResponse[$this->idField]) {
            $recordResponse[$this->idField] = @$record[$this->idField];
        }

        return $recordResponse;
    }

    protected function onRecordRemoved($record, &$recordResponse)
    {
        return $recordResponse;
    }

    protected function onAddedHandled(&$response)
    {
        return $response;
    }

    protected function onUpdatedHandled(&$response)
    {
        return $response;
    }

    protected function onRemovedHandled(&$response)
    {
        return $response;
    }

    protected function onHandled(&$response)
    {
        return $response;
    }

    protected function applyMetaData($mataData, $request, &$response)
    {
    }

    public function handleMetaData($request, &$response)
    {
        $this->applyMetaData($request['metaData'], $request, $response);

        return $response;
    }

    public function handleAdded($request, &$response)
    {
        $added = [];

        foreach ($request['added'] as $row) {
            $phantomId = $row[$this->phantomIdField];
            unset($row[$this->phantomIdField]);

            $r = $this->add($row);

            $added[] = $this->onRecordAdded($row, $r, $phantomId);
        }

        if (!$response) {
            $response = array();
        }

        if (sizeof($added)) {
            $response['rows'] = @$response['rows'] ? array_merge((Array)$response['rows'], (Array)$added) : $added;
        }

        return $this->onAddedHandled($response);
    }

    public function handleUpdated($request, &$response)
    {
        $updated = [];

        foreach ($request['updated'] as $row) {
            $r = $this->update($row);

            $this->onRecordUpdated($row, $r);

            if (sizeof($r)) {
                // if some server side changes are passed provide the record identifier to address them properly
                $r[$this->idField] = $row[$this->idField];
                $updated[] = $r;
            }
        }

        if (!$response) {
            $response = [];
        }

        if (sizeof($updated)) {
            $response['rows'] = @$response['rows'] ? array_merge((Array)$response['rows'], (Array)$updated) : $updated;
        }

        return $this->onUpdatedHandled($response);
    }

    public function handleRemoved($request, &$response)
    {
        $this->remove($request['removed']);

        return $this->onRemovedHandled($response);
    }

    public function handle($request, $mode = ALL, &$response = null)
    {
        $res = $response ?? [];

        if (($mode & META_DATA) && isset($request['metaData'])) {
            $this->handleMetaData($request, $res);
        }

        if (($mode & ADDED_ROWS) && isset($request['added'])) {
            $this->handleAdded($request, $res);
        }
        if (($mode & UPDATED_ROWS) && isset($request['updated'])) {
            $this->handleUpdated($request, $res);
        }
        if (($mode & REMOVED_ROWS) && isset($request['removed'])) {
            $this->handleRemoved($request, $res);
        }

        return $this->onHandled($res);
    }
}
