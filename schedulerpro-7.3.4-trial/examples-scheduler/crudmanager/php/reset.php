<?php

use Bryntum\Util\ScriptEditor;

$dir = dirname($_SERVER['SCRIPT_FILENAME']);

// initialize application
require_once './init.php';

$sql = file_get_contents(dirname($dir) . '/sql/setup.sql');

// get "data" region "TRUNCATE TABLE ..." section only
$sql = ScriptEditor::getTextRegion($sql, 'data') or die('Cannot find data region');

// remove record insertions
$sql = ScriptEditor::replaceTextRegion($sql, 'insertions');

// execute database reset script plus options insertion
$app->db->exec("$sql");
