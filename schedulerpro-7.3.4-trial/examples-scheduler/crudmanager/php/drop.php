<?php

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!! ATTENTION: This file removes the database and is used for testing purposes only.
!!! Please remove the file if you plan to use the demo code on production.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/

$dir = dirname($_SERVER['SCRIPT_FILENAME']);

require_once "$dir/autoloader.php";
require_once "$dir/loadConfiguration.php";

\Bryntum\Util\MySql::dropDatabase();

$configFile = @$_REQUEST['config'];

// remove config file if passed
if ($configFile && file_exists($configFile)) {
    unlink($configFile);
}
