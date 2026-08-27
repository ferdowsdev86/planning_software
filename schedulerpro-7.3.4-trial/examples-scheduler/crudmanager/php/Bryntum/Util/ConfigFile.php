<?php

namespace Bryntum\Util;

use Exception;

class ConfigFile
{
    /**
     * @throws Exception
     */
    public static function parseConfigFile($configFile)
    {
        $text = file_get_contents($configFile);

        if ($text === false) {
            throw new Exception('Cannot get configuration file content');
        }

        $result = [];

        // Old configs support (used on the qa-server)
        // TODO : remove this block after this code is merged into "release" branch
        if (preg_match_all("/define\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)\s*;/", $text, $matches)) {
//        if (preg_match_all("/const\s+(\w+)\s*=\s*['\"]([^'\"]+)['\"]\s*;/", $text, $matches)) {
            $consts = $matches[1];
            $values = $matches[2];
            for ($i = 0; $i < sizeof($consts); $i++) {
                $result[$consts[$i]] = $values[$i];
            }
        }

        if (preg_match_all("/const\s+([^=\s]+)\s*=\s*['\"]([^'\"]+)['\"]\s*;/", $text, $matches)) {
            $consts = $matches[1];
            $values = $matches[2];
            for ($i = 0; $i < sizeof($consts); $i++) {
                $result[$consts[$i]] = $values[$i];
            }
        }

        return $result;
    }

    public static function getConfigFile($defaultConfig = null, $dir = null, $allowExternalConfigs = false)
    {
        $configs = [];

        if ($allowExternalConfigs) {
            global $argv;
            $config = @$argv[1] ?? @$_REQUEST['config'];
            if ($config) {
                $configs[] = $dir ? $dir .'/'. basename($config) : $config;
            }
        }

        if ($defaultConfig) {
            $configs[] = $dir ? $dir .'/'. basename($defaultConfig) : $defaultConfig;
        }

        foreach ($configs as $config) {
            if (file_exists($config)) {
                return $config;
            }
        }
    }

    /**
     * @throws Exception
     */
    public static function generateDatabaseConfigFile($dbname, $templateFileName, $configFile)
    {
        if (!copy($templateFileName, $configFile)) {
            throw new Exception("Cannot copy configuration file $templateFileName to $configFile");
        }

        $text = file_get_contents($configFile);

        if ($text === false) {
            throw new Exception('Cannot get configuration file content');
        }

        $text = preg_replace("/dbname=(.+?)(;|\$)/", "dbname=$dbname$2", $text);

        if (file_put_contents($configFile, $text) === false) {
            throw new Exception('Cannot write configuration file');
        }

        return $configFile;
    }
}
