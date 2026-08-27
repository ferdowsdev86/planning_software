<?php

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!! ATTENTION: This file creates a database and is used for testing purposes only.
!!! Please remove the file if you plan to use the demo code on production.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/

use Bryntum\Util\MySql;
use Bryntum\Util\ConfigFile;

$dir = dirname($_SERVER['SCRIPT_FILENAME']);

require_once './autoloader.php';

try {
    $createDatabase = @$_REQUEST['createDatabase'];

    $configFile = null;

    if ($createDatabase) {
        if ($createDatabase == 'random') {
            $baseConfigFile = "$dir/config.php";

            $dbname = MySql::createRandomDatabase($baseConfigFile);

            $configFile = ConfigFile::generateDatabaseConfigFile($dbname, $baseConfigFile, "$dir/$dbname.php");

            require $configFile;

        }
        // Making the database specified in config.php file
        else {
            require './loadConfiguration.php';
            MySql::createDatabase();
        }
    }
    // If createDatabase is not passed try using existing config.php
    // with a database connection settings and create tables there
    else {
        require './loadConfiguration.php';
    }

    // read the database connection parameters
    [$dbname, $host] = MySql::getDSNParts(DSN, ['dbname', 'host']);

    if (!$dbname) throw new Exception('Could not get database from the DSN string.');
    if (!$host) throw new Exception('Could not get host from the DSN string.');

    // Create tables and insert data
    MySql::executeScript(dirname($dir) .'/sql/setup.sql');

    if ($configFile && $_REQUEST) {
        die(json_encode([
            'success' => true,
            'configFile' => $configFile
        ]));
    }

} catch (Exception $e) {
    if ($_REQUEST) {
        die(json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]));
    }
}
