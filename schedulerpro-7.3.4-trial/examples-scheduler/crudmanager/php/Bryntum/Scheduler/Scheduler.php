<?php

namespace Bryntum\Scheduler;

use Bryntum\CRUD\BaseDAO;
use Exception;
use PDO;

const E_APP_UPDATE_EVENT = 100;
const E_APP_ADD_EVENT = 101;
const E_APP_REMOVE_EVENT = 102;
const E_APP_GET_EVENTS = 104;
const E_APP_EVENT_NOT_FOUND = 105;
const E_APP_UPDATE_RESOURCE = 130;
const E_APP_ADD_RESOURCE = 131;
const E_APP_REMOVE_RESOURCE = 132;
const E_APP_GET_RESOURCES = 133;
const E_APP_RESOURCE_NOT_FOUND = 134;
const E_APP_REMOVE_USED_RESOURCE = 135;
const E_APP_UPDATE_ASSIGNMENT = 140;
const E_APP_ADD_ASSIGNMENT = 141;
const E_APP_REMOVE_ASSIGNMENT = 142;
const E_APP_GET_ASSIGNMENTS = 143;
const E_APP_ASSIGNMENT_NOT_FOUND = 144;
const E_APP_UPDATE_DEPENDENCY = 150;
const E_APP_ADD_DEPENDENCY = 151;
const E_APP_REMOVE_DEPENDENCY = 152;
const E_APP_GET_DEPENDENCIES = 153;
const E_APP_DEPENDENCY_NOT_FOUND = 154;
const E_APP_UPDATE_TIME_RANGE = 155;
const E_APP_ADD_TIME_RANGE = 156;
const E_APP_REMOVE_TIME_RANGE = 157;
const E_APP_GET_TIME_RANGES = 158;
const E_APP_TIME_RANGE_NOT_FOUND = 159;
const E_APP_UPDATE_RESOURCE_TIME_RANGE = 160;
const E_APP_ADD_RESOURCE_TIME_RANGE = 161;
const E_APP_REMOVE_RESOURCE_IME_RANGE = 162;
const E_APP_GET_RESOURCE_TIME_RANGES = 163;
const E_APP_RESOURCE_TIME_RANGE_NOT_FOUND = 164;

class Scheduler extends BaseDAO
{

    public $updatedRows;
    public $removedRows;

    public function __construct($dsn, $dbuser, $dbpwd, $dboptions = null)
    {
        // call parent
        parent::__construct($dsn, $dbuser, $dbpwd, $dboptions);

        $this->initRowsHolders();
    }

    /**
     * Initializes structures to keep mapping between phantom and real Ids
     */
    public function initRowsHolders()
    {
        $this->phantomIdMap = [
            'events' => [],
            'assignments' => [],
            'resources' => [],
            'timeRanges' => [],
            'resourceTimeRanges' => []
        ];
    }

    // Force datetime value to include server timezone info
    public static function applyTimeZoneToDate($value)
    {
        return date('Y-m-d H:i:sP', strtotime($value));
    }

    /**
     * Creates or updates (depending on provided data) a event record.
     * If $data['id'] is present in provided data then this method will update corresponding event record otherwise it will create a new event.
     * @param $data array Data to be stored into a event record. It's an array where array keys are event field names.
     */
    public function saveEvent(&$data)
    {
        $id = @$data['id'];

        if ($id) {
            if (!$this->getEvent($id)) {
                throw new Exception("Cannot find event #$id", E_APP_EVENT_NOT_FOUND);
            }

            if (!$this->update('events', $data, ['id' => $id], true)) {
                throw new Exception("Cannot update event #$id.", E_APP_UPDATE_EVENT);
            }
        } else {
            if (!$this->insert('events', $data, true)) {
                throw new Exception('Cannot create event.', E_APP_ADD_EVENT);
            }

            $data['id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes event records.
     */
    public function removeEvents($where)
    {
        if (!$this->delete('events', $where)) {
            throw new Exception($this->getPDOError('Cannot remove event'), E_APP_REMOVE_EVENT);
        }

        $this->updateRevision();
    }

    public function getEvent($id)
    {
        $events = $this->getEvents(['id' => $id]);
        return $events ? $events[0] : false;
    }

    /**
     * Returns array of events.
     */
    public function getEvents($where = null)
    {
        $rows = [];
        $byParent = [];
        $values = [];

        $cond = $where ? ' where ' . self::buildWhere($where, $values) : '';

        $stmt = $this->db->prepare("select * from events $cond");

        if (!$stmt->execute($values)) {
            throw new Exception($this->getPDOError('Cannot get events list.'), E_APP_GET_EVENTS);
        }

        while ($e = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $e['duration'] = $e['duration'] !== null ? floatval($e['duration']) : null;

            // Force datetime fields to include server timezone info
//             if (@$e['startDate']) {
//                 $e['startDate'] = self::applyTimeZoneToDate($e['startDate']);
//             }
//             if (@$e['endDate']) {
//                 $e['endDate'] = self::applyTimeZoneToDate($e['endDate']);
//             }

            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates resource record.
     */
    public function saveResource(&$data)
    {
        $id = @$data['id'];
        if ($id) {
            if (!$this->getResource($id)) {
                throw new Exception("Cannot find resource #$id", E_APP_RESOURCE_NOT_FOUND);
            }

            if (!$this->update('resources', $data, ['id' => $id])) {
                throw new Exception("Cannot update resource #$id.", E_APP_UPDATE_RESOURCE);
            }
        } else {
            if (!$this->insert('resources', $data)) {
                throw new Exception('Cannot create resource.', E_APP_ADD_RESOURCE);
            }

            $data['id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes resource records.
     */
    public function removeResources($where)
    {
        if (!$this->delete('resources', $where)) {
            throw new Exception($this->getPDOError('Cannot remove resources'), E_APP_REMOVE_RESOURCE);
        }

        $this->updateRevision();
    }

    public function getResource($id)
    {
        $resources = $this->getResources(['id' => $id]);
        return $resources ? $resources[0] : false;
    }

    /**
     * Returns array of resources.
     */
    public function getResources($where = null)
    {
        $values = [];
        $cond = $where ? ' where ' . self::buildWhere($where, $values) : '';
        $stmt = $this->db->prepare('select * from resources ' . $cond);

        if (!$stmt->execute($values)) {
            throw new Exception($this->getPDOError('Cannot get resources list.'), E_APP_GET_RESOURCES);
        }

        $rows = [];
        while ($e = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if (!@$e['calendar']) {
                $e['calendar'] = null;
            }
            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates assignment record.
     */
    public function saveAssignment(&$data)
    {
        $id = @$data['id'];
        if ($id) {
            if (!$this->getAssignment($id)) {
                throw new Exception("Cannot find assignment #$id", E_APP_ASSIGNMENT_NOT_FOUND);
            }

            if (!$this->update('assignments', $data, ['id' => $id])) {
                throw new Exception("Cannot update assignment #$id.", E_APP_UPDATE_ASSIGNMENT);
            }
        } else {
            if (!$this->insert('assignments', $data)) {
                throw new Exception('Cannot create assignment.', E_APP_ADD_ASSIGNMENT);
            }

            $data['id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes assignment record.
     */
    public function removeAssignments($where)
    {
        if (!$this->delete('assignments', $where)) {
            throw new Exception($this->getPDOError('Cannot remove assignments'), E_APP_REMOVE_ASSIGNMENT);
        }

        $this->updateRevision();
    }

    public function getAssignment($id)
    {
        $assignments = $this->getAssignments(['id' => $id]);
        return $assignments ? $assignments[0] : false;
    }

    /**
     * Returns array of assignments.
     */
    public function getAssignments($where = null)
    {
        $values = [];
        $cond = $where ? ' where ' . self::buildWhere($where, $values) : '';
        $stmt = $this->db->prepare('select * from assignments ' . $cond);

        if (!$stmt->execute($values)) {
            throw new Exception($this->getPDOError('Cannot get assignments list.'), E_APP_GET_ASSIGNMENTS);
        }

        $rows = [];
        while ($e = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates dependency record.
     */
    public function saveDependency(&$data)
    {
        $id = @$data['id'];
        if ($id) {
            if (!$this->getDependency($id)) {
                throw new Exception("Cannot find dependency #$id", E_APP_DEPENDENCY_NOT_FOUND);
            }

            if (!$this->update('dependencies', $data, ['id' => $id])) {
                throw new Exception("Cannot update dependency #$id.", E_APP_UPDATE_DEPENDENCY);
            }
        } else {
            if (!$this->insert('dependencies', $data)) {
                throw new Exception('Cannot create dependency.', E_APP_ADD_DEPENDENCY);
            }

            $data['id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes dependency records.
     */
    public function removeDependencies($where)
    {
        if (!$this->delete('dependencies', $where)) {
            throw new Exception($this->getPDOError('Cannot remove dependency'), E_APP_REMOVE_DEPENDENCY);
        }

        $this->updateRevision();
    }

    public function getDependency($id)
    {
        $dependencies = $this->getDependencies(['id' => $id]);
        return $dependencies ? $dependencies[0] : false;
    }

    /**
     * Returns array of dependencies.
     */
    public function getDependencies($where = null)
    {
        $values = [];
        $cond = $where ? ' where ' . self::buildWhere($where, $values) : '';
        $stmt = $this->db->prepare('select * from dependencies ' . $cond);

        if (!$stmt->execute($values)) {
            throw new Exception($this->getPDOError('Cannot get dependencies list.'), E_APP_GET_DEPENDENCIES);
        }

        $rows = [];
        while ($e = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $e['lag'] = floatval($e['lag']);
            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates time range record.
     */
    public function saveTimeRange(&$data)
    {
        $id = @$data['id'];
        if ($id) {
            if (!$this->getTimeRange($id)) {
                throw new Exception("Cannot find time range #$id", E_APP_TIME_RANGE_NOT_FOUND);
            }

            if (!$this->update('time_ranges', $data, ['id' => $id])) {
                throw new Exception("Cannot update time range #$id.", E_APP_UPDATE_TIME_RANGE);
            }
        } else {
            if (!$this->insert('time_ranges', $data)) {
                throw new Exception('Cannot create time range.', E_APP_ADD_TIME_RANGE);
            }

            $data['id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes time ranges.
     */
    public function removeTimeRanges($where)
    {
        if (!$this->delete('time_ranges', $where)) {
            throw new Exception($this->getPDOError('Cannot remove time range'), E_APP_REMOVE_TIME_RANGE);
        }

        $this->updateRevision();
    }

    public function getTimeRange($id)
    {
        $records = $this->getTimeRanges(['id' => $id]);
        return $records ? $records[0] : false;
    }

    /**
     * Returns array of time ranges.
     */
    public function getTimeRanges($where = null)
    {
        $values = [];
        $cond = $where ? ' where ' . self::buildWhere($where, $values) : '';
        $stmt = $this->db->prepare('select * from time_ranges ' . $cond);

        if (!$stmt->execute($values)) {
            throw new Exception($this->getPDOError('Cannot get time range list.'), E_APP_GET_TIME_RANGES);
        }

        $rows = [];
        while ($e = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // if (@$e['startDate']) {
            //     $e['startDate'] = self::applyTimeZoneToDate($e['startDate']);
            // }
            // if (@$e['endDate']) {
            //     $e['endDate'] = self::applyTimeZoneToDate($e['endDate']);
            // }
            $rows[] = $e;
        }

        return $rows;
    }

    /**
     * Creates/updates resource time range record.
     */
    public function saveResourceTimeRange(&$data)
    {
        $id = @$data['id'];
        if ($id) {
            if (!$this->getResourceTimeRange($id)) {
                throw new Exception("Cannot find resource time range #$id", E_APP_RESOURCE_TIME_RANGE_NOT_FOUND);
            }

            if (!$this->update('resource_time_ranges', $data, ['id' => $id])) {
                throw new Exception("Cannot update resource time range #$id.", E_APP_UPDATE_RESOURCE_TIME_RANGE);
            }
        } else {
            if (!$this->insert('resource_time_ranges', $data)) {
                throw new Exception('Cannot create resource time range.', E_APP_ADD_RESOURCE_TIME_RANGE);
            }

            $data['id'] = $this->db->lastInsertId();
        }

        $this->updateRevision();
    }

    /**
     * Removes resource time ranges.
     */
    public function removeResourceTimeRanges($where)
    {
        if (!$this->delete('resource_time_ranges', $where)) {
            throw new Exception($this->getPDOError('Cannot remove resource time range'), E_APP_REMOVE_RESOURCE_TIME_RANGE);
        }

        $this->updateRevision();
    }

    public function getResourceTimeRange($id)
    {
        $records = $this->getResourceTimeRanges(['id' => $id]);
        return $records ? $records[0] : false;
    }

    /**
     * Returns array of time ranges.
     */
    public function getResourceTimeRanges($where = null)
    {
        $values = [];
        $cond = $where ? ' where ' . self::buildWhere($where, $values) : '';
        $stmt = $this->db->prepare('select * from resource_time_ranges ' . $cond);

        if (!$stmt->execute($values)) {
            throw new Exception($this->getPDOError('Cannot get resource time range list.'), E_APP_GET_RESOURCE_TIME_RANGES);
        }

        $rows = [];
        while ($e = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // if (@$e['startDate']) {
            //     $e['startDate'] = self::applyTimeZoneToDate($e['startDate']);
            // }
            // if (@$e['endDate']) {
            //     $e['endDate'] = self::applyTimeZoneToDate($e['endDate']);
            // }
            $rows[] = $e;
        }

        return $rows;
    }

}
