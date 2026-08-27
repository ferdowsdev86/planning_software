<?php

namespace Bryntum\Scheduler;

require_once __DIR__ .'/loadConfiguration.php';

// 4hrs
ini_set('session.gc_maxlifetime', 14400);

if (!session_id()) {
    session_start();
}

$app = new Scheduler(DSN, DBUSERNAME, DBUSERPASSWORD);

if (!$app) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connecting error'
    ]));
}

$afterinit = __DIR__ .'/after-init.php';

if (file_exists($afterinit)) {
    include $afterinit;
}
