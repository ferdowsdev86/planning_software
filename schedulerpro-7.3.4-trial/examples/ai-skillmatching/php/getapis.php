<?php

require("api-config.php");

echo json_encode(
    [
        "success" => true,
        "data" => getAPIs()
    ]
)

?>
