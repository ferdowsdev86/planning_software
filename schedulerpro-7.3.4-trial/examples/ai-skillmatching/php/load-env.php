<?php
/**
 * Loads KEY=VALUE environment variables from a file.
 * Lines starting with # are treated as comments and ignored.
 *
 * @param string $filePath Path to the env file
 */
function loadEnvFile($filePath) {
    if (!is_file($filePath)) {
        return;
    }

    $lines = explode("\n", file_get_contents($filePath));

    foreach ($lines as $line) {

        preg_match("/([^#]+)\=(.*)/", $line, $matches);
        if (isset($matches[2])) {
            putenv(trim($line));
        }
    }
}

?>
