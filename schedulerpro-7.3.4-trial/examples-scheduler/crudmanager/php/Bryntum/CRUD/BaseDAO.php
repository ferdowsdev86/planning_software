<?php

namespace Bryntum\CRUD;

use Exception;
use PDO;
use PDOException;

const E_APP_DATABASE_CONNECTION = 1;
const E_APP_DATABASE_SELECTION = 2;
const E_APP_FOUND_ROWS = 3;
const E_APP_SHOW_COLUMNS = 4;
const E_APP_GET_REVISION = 5;
const E_APP_UPDATE_REVISION = 6;
const E_APP_NO_SYNC_DATA = 7;
const E_APP_OUTDATED_REVISION = 8;
const E_APP_GET_OPTION = 9;
const E_APP_SET_OPTION = 10;

class BaseDAO
{

    public $db;

    public $connectionHash;

    /**
     * Hash containing references between phantom Ids and its real values in the database.
     * Stores phantom Ids as keys and real Ids as values.
     */
    public $phantomIdMap;

    public function __construct($dsn, $dbuser, $dbpwd, $dboptions = null)
    {
        try {
            $this->db = new PDO($dsn, $dbuser, $dbpwd, $dboptions);
            $this->connectionHash = md5($dsn);
        } catch (PDOException $e) {
            throw new Exception($this->getPDOError('Database connection error.'), E_APP_DATABASE_CONNECTION);
        }
    }

    public function getPDOError($text)
    {
        return $text . ($this->db ? '  PDO Error: ' . implode(':', $this->db->errorInfo()) : '');
    }

    /**
     * Returns total number of rows found by last query.
     * @return int Total number of rows.
     * @throws Exception
     */
    public function getFoundRows()
    {
        if (!$r = $this->db->query('select found_rows()')) {
            throw new Exception($this->getPDOError('Cannot get total number of rows.'), E_APP_FOUND_ROWS);
        }

        [$result] = $r->fetch(PDO::FETCH_NUM);

        return (int)$result;
    }

    protected static function getStartLimit($params)
    {
        $page = (int)$params['page'];
        if ($page < 1) {
            $page = 1;
        }

        $pageSize = (int)$params['pageSize'];
        $start = ($page - 1) * $pageSize;
        $limit = $pageSize;

        return [$start, $limit];
    }

    /**
     * Helper function to organize rows as a nested array acceptable for a TreeStore loading.
     */
    protected static function buildTree($byParent, $parentId = '')
    {
        $result = [];

        // each $byParent element hash has to keep children for particular parent Id
        // get child tasks of specified parent
        if ($tasks = @$byParent[$parentId]) {
            foreach ($tasks as $v) {
                if ($children = self::buildTree($byParent, @$v['id'])) {
                    $v['children'] = $children;
                    $v['leaf'] = false;
                } else {
                    $v['leaf'] = true;
                }
                $result[] = $v;
            }

            return $result;
        }

        return $parentId == '' ? $result : false;
    }

    public function getTableCols($table)
    {
        $storageKey = $this->connectionHash . '-columns';

        // if we already have columns for this table cached
        if (isset($_SESSION[$storageKey])) {
            if (isset($_SESSION[$storageKey][$table])) {
                return $_SESSION[$storageKey][$table];
            }
        } else {
            $_SESSION[$storageKey] = [];
        }

        if (!$r = $this->db->query('show columns from ' . $table)) {
            throw new Exception($this->getPDOError('Cannot get columns of ' . $table . '.'), E_APP_SHOW_COLUMNS);
        }

        $result = [];
        while ($e = $r->fetch(PDO::FETCH_ASSOC)) {
            $result[$e['Field']] = $e['Field'];
        }

        // let's cache this table columns to not ask the database twice
        $_SESSION[$storageKey][$table] = $result;

        return $result;
    }

    /**
     * Helper method to construct and run INSERT SQL-query by provided array of data.
     * @param string $table Database table name.
     * @param array $data Data to be inserted into a table. This data array is basically a hash where field names used as array keys and field values are put as array element values.
     * @param mixed [$check_cols=FALSE] Specifies either full array of table columns allowed to be used or TRUE to force method to dynamically get such array from database and restrict provided $data array with it.
     * When set to FALSE (default) no check and restriction will be done.
     * @return boolean Returns TRUE in case of successful query execution and FALSE otherwise.
     */
    public function insert($table, $data, $check_cols = true)
    {
        $cols = null;
        // if we need to restrict columns
        if ($check_cols) {
            // if array of columns provided
            if (is_array($check_cols)) {
                $cols = &$check_cols;
            } else {
                // let's get array of columns from database
                $cols = $this->getTableCols($table);
            }
        }
        $fields = $values = '';
        $_data = [];
        foreach ($data as $field => $value) {
            if (!$cols || isset($cols[$field])) {
                $fields .= "`$field`,";
                $values .= "?,";
                $_data[] = $value;
            }
        }

        $stmt = $this->db->prepare("insert into $table (" . rtrim($fields, ',') . ') values (' . rtrim($values, ',') . ')');

        return $stmt->execute($_data);
    }

    public static function buildWhere($where, &$values, $operators = null)
    {
        $sql = "";

        foreach ((array)$where as $field => $value) {
            $sql .= $sql ? " and " : "";
            $operator = '';

            if ($operators && isset($operators[$field])) {
                $operator = $operators[$field];
            }

            if ($value === null) {
                $operator = $operator ? $operator : 'is';
                $sql .= "`$field` $operator null";
            } elseif (is_array($value)) {
                $operator = $operator ? $operator : 'in';
                $sql .= "`$field` $operator " . self::buildWhereIn($value);
                $values = array_merge($values, $value);
            } else {
                $operator = $operator ? $operator : '=';
                $sql .= "`$field` $operator ?";
                $values[] = $value;
            }
        }

        return $sql;
    }

    public static function buildWhereIn($ids)
    {
        return '(' . implode(',', array_fill(0, count($ids), '?')) . ')';
    }

    /**
     * Helper method to construct and run UPDATE SQL-query by provided arrays of data.
     * @param string $table Database table name.
     * @param array $data Data to be stored into a table. This data array is basically a hash where field names used as array keys and field values are put as array element values.
     * @param array|null $where Data to be used to construct a conditional of the query. If not provided the constructed query will not have a conditional part. This parameter has the same structure as the $data parameter.
     * @return boolean Returns TRUE in case of successful query execution and FALSE otherwise.
     */
    public function update($table, $data, $where = null, $check_cols = true)
    {
        $cols = null;

        // if we need to restrict columns
        if ($check_cols) {
            // if array of columns provided
            if (is_array($check_cols)) {
                $cols = &$check_cols;
            } else {
                // let's get array of columns from database
                $cols = $this->getTableCols($table);
            }
        }

        $_data = [];
        $sql = "update $table set ";
        foreach ($data as $field => $value) {
            if (!$cols || isset($cols[$field])) {
                if ($value === null) {
                    $sql .= " `$field` = null,";
                } else {
                    $sql .= " `$field` = ?,";
                    $_data[] = $value;
                }
            }
        }
        $sql = rtrim($sql, ',');

        if ($where) {
            $sql .= ' where ' . self::buildWhere($where, $_data);
        }

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($_data);
    }

    /**
     * Helper method to construct and run DELETE SQL-query by provided $where array that specifies the query conditional part.
     * @param string $table Database table name.
     * @param array $where Data to be used to construct the query conditional.
     * This array keys are treated as field names and values are used as values to match the corresponding fields:
     *
     * // this will result executing the following SQL: delete from customers where name = "John"
     * $myDatabase->delete("customers", ["name" => "John"])
     *
     * If a value is an array then IN operator will be used:
     *
     * // this will result executing the following SQL: delete from customers where name in ("John", "Bob")
     * $myDatabase->delete("customers", ["name" => ["John", "Bob]])

     * @return boolean Returns TRUE in case of successful query execution and FALSE otherwise.
     */
    public function delete($table, $where = null, $check_cols = true)
    {
        $cols = null;

        // if we need to restrict columns
        if ($check_cols) {
            // if array of columns provided
            if (is_array($check_cols)) {
                $cols = &$check_cols;
            } else {
                // let's get array of columns from database
                $cols = $this->getTableCols($table);
            }
        }

        $_data = [];
        $sql = "delete from `$table`";

        if ($where) {
            $sql .= ' where ' . self::buildWhere($where, $_data);
        }

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($_data);
    }

    public function getOption($name)
    {
        $stmt = $this->db->prepare("select value from options where name = ? limit 1");
        if (!$stmt->execute([$name])) {
            throw new Exception($this->getPDOError('Cannot get option ' . $name . '.'), E_APP_GET_OPTION);
        }

        [$value] = $stmt->fetch(PDO::FETCH_NUM);

        return $value;
    }

    public function getOptions($where, $operators = null)
    {
        $result = [];
        $values = [];

        $cond = $where ? ' where ' . self::buildWhere($where, $values, $operators) : '';

        $stmt = $this->db->prepare("select * from options $cond");

        if (!$stmt->execute($values)) {
            throw new Exception($this->getPDOError('Cannot get options.'), E_APP_GET_OPTION);
        }

        while ($e = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $result[] = $e;
        }

        return $result;
    }

    /**
     * @throws Exception
     */
    public function setOption($name, $value)
    {
        if ($this->getOption($name)) {
            if (!$this->update('options', ['value' => $value], ['name' => $name])) {
                throw new Exception('Cannot set option ' . $name . '.', E_APP_SET_OPTION);
            }
        } else {
            if (!$this->insert('options', ['value' => $value, 'name' => $name])) {
                throw new Exception('! Cannot set option ' . $name . '.', E_APP_SET_OPTION);
            }
        }

        return true;
    }

    public function checkRevision($revision)
    {
        if (is_numeric($revision) && $this->getRevision() > intval($revision)) {
            throw new Exception('Client data snapshot is outdated please reload you stores before.', E_APP_OUTDATED_REVISION);
        }
    }

    /**
     * Returns server revision stamp.
     * @return int Server revision stamp.
     * @throws Exception
     */
    public function getRevision()
    {
        return intval($this->getOption('revision'));
    }

    /**
     * Increments server revision stamp.
     * @throws Exception
     */
    public function updateRevision()
    {
        if (!$this->db->exec('insert into options (name, value) values (\'revision\', 0) ' .
            'on duplicate key update value = value + 1')
        ) {
            throw new Exception($this->getPDOError('Cannot update server revision stamp.'), E_APP_UPDATE_REVISION);
        }

        return true;
    }

    /**
     * Processes a date value by cutting its time and timezone info.
     * @param string $date Date string
     * @return string Processed date string in 'Y-m-d H:i:s' format
     */
    protected function processDate($date)
    {
        $tmp = date_parse($date);

        return date('Y-m-d H:i:s', mktime(0, 0, 0, $tmp['month'], $tmp['day'], $tmp['year']));
    }
}
