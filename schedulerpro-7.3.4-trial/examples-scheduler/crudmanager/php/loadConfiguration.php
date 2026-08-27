<?php

/**
 * Loads default DB connection settings from file.
 * Sends error message for application if no file was found.
 */

// Attention the code is added for testing purposes only
// v - please get rid of this before using it on production
$allowExternalConfigs = true;
// ^ - please get rid of this before using it on production

// setup demo classes autoload if not set yet
require_once './autoloader.php';

$config = \Bryntum\Util\ConfigFile::getConfigFile('config.php', null, $allowExternalConfigs);

if (!$config) {
    die(json_encode([
        'success' => false,
        'message' => 'Configuration file "php/config.php" was not found. Copy "php/config.template.php" to "php/config.php" and edit DB settings within file.'
    ]));
}

require $config;
