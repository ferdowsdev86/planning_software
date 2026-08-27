<?php

namespace Bryntum\Scheduler;

function autoload($class)
{
    $file = dirname(__FILE__) . '/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        // echo "\n".$file;
        require_once $file;
    }
}

spl_autoload_register('Bryntum\Scheduler\autoload');
