<?php

namespace Bryntum\Util;

use Exception;

class MySql
{

    private static function system($command, &$resultCode = null, &$output = null)
    {
        if ($_REQUEST) {
            exec($command, $output, $resultCode);
        }
        else {
            system($command, $resultCode);
        }
    }

    /**
     * @throws Exception
     */
    public static function getConnectParams($host = '', $configFile = '')
    {
        if (defined('DSN')) {
            $dsn = DSN;
            $user = DBUSERNAME;
            $pwd = DBUSERPASSWORD;
        } elseif ($configFile) {
            $consts = ConfigFile::parseConfigFile($configFile);
            $dsn = $consts['DSN'];
            $user = $consts['DBUSERNAME'];
            $pwd = $consts['DBUSERPASSWORD'];
        } else {
            throw new Exception("No DSN specified");
        }

        if (!$host) {
            [$host] = self::getDSNParts($dsn, ['host']);
        }

        return [$dsn, $user, $pwd, $host];
    }

    /**
     * Checks if the database with the provided name exists.
     * @throws Exception
     */
    public static function databaseExists($dbname, $host = '', $configFile = '')
    {
        [$dsn, $user, $pwd, $host] = self::getConnectParams($host, $configFile);

        self::system("mysql -v --host=$host --user=$user --password=\"$pwd\" --database $dbname -e \"exit\"", $retval);

        return !$retval;
    }

    /**
     * Creates a new database with a random name.
     * @param string $configFile Connection configuration file.
     * @param string $dbPrefix Database name prefix.
     * @throws Exception
     */
    public static function createRandomDatabase($configFile = '', $dbPrefix = 'db_')
    {
        $dbCreated = false;

        [$dsn, , , $host] = self::getConnectParams(null, $configFile);

        $dbname = '';
        while (!$dbCreated) {
            $dbname = uniqid($dbPrefix);

            if (!self::databaseExists($dbname, $host, $configFile)) {
                self::createDatabase($dbname, $host, $configFile);

                $dbCreated = true;
            }
        }

        return $dbname;
    }

    /**
     * Creates a new database with the provided name.
     * @param string $dbname Database name.
     * @param string $host Database host.
     * @param string $configFile Connection configuration file.
     * @throws Exception
     */
    public static function createDatabase($dbname = null, $host = null, $configFile = '')
    {
        [$dsn, $user, $pwd, $host] = self::getConnectParams($host, $configFile);

        if (!$dbname) {
            [$dbname] = self::getDSNParts($dsn, ['dbname']);
        }

        $command = "mysql -v --host=$host --user=$user --password=\"$pwd\" -e \"create database $dbname\"";
        self::system($command, $retval);

        if ($retval) {
            throw new Exception("Database creation has failed ($dbname).\nCmd: $command");
        }
    }

    /**
     * Drops the current database.
     * @throws Exception
     */
    public static function dropDatabase()
    {
        // read the database connection parameters
        [$dbname, $host] = self::getDSNParts(DSN, ['dbname', 'host']);

        $user = DBUSERNAME;
        $pwd = DBUSERPASSWORD;
        $command = "mysql -v --host=$host --user=$user --password=\"$pwd\" -e \"drop database $dbname\"";

        self::system($command, $retval);

        if ($retval) {
            throw new \Exception('Database removal has failed.\nCmd: $command"');
        }
    }

    /**
     * Extracts the provided DSN string parts as an array.
     */
    public static function getDSNParts($dsn, $names)
    {
        $parts = [];
        foreach ($names as $name) {
            preg_match("/$name=(.+?)(;|\$)/", $dsn, $matches);
            $parts[] = @$matches[1];
        }
        return $parts;
    }

    /**
     * Executes the provided SQL-script.
     * @param string $script The script text.
     * @throws Exception
     */
    public static function executeScript($script)
    {
        global $host, $dbname;

        $user = DBUSERNAME;
        $pwd = DBUSERPASSWORD;
        $command = "mysql -v --host=$host --user=$user --password=\"$pwd\" --database=$dbname < \"$script\"";

        self::system($command, $retval);

        if ($retval) {
            throw new Exception("Script execution has failed.\nCmd: $command");
        }
    }

    /**
     * Prepare a date string for database insertion.
     *
     * @param string $value A date string in the format "YYYY-MM-DDTHH:MM:SS".
     *
     * @return string The formatted date string in the format "YYYY-MM-DD HH:MM:SS".
     */
    public static function formatDate($value)
    {
        // Input example: "2017-05-22T10:37:12"
        // Replace "T" in the date string w/ " " to match the format we use further
        // Convert the date string passed from the client timezone to the server one
        // if the timezone is passed, like this for example: "2017-05-22 10:37:12+06:00".
        return date('Y-m-d H:i:s', strtotime(str_replace('T', ' ', $value)));
    }

    /**
     * Format the given value as a float.
     *
     * @param mixed $value The value to be formatted.
     *
     * @return float The formatted float value.
     */
    public static function formatFloat($value)
    {
        return floatval($value);
    }


}
