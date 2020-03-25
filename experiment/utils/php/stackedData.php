<?php

// __DIR__ returns the directory of this file to make sure require works even if this file is included inside another
// php file
require_once(__DIR__ . "/utils.php");



function saveStackedData($tableName) {
    $participantID = getRequestValue("participant_id", "0");
    $sessionID = getRequestValue("session_id", "0");
    $context = getRequestValue("context", "");
    saveStackedDataHelper($tableName, $participantID, $sessionID, $context);
}


function saveStackedDataHelper($tableName, $participantID, $sessionID, $context) {
    global $mysqli;

    ensureStackedDataTable($tableName);

    $keys = array("participant_id", "session_id", "context", "key");
    $values = array($participantID, $sessionID, $context);

    foreach ($_REQUEST as $key => $value) {
        $tempKeys = $keys;
        $tempValues = $values;
        $tempValues[] = $key;
        if (strpos($key, "int-") === 0) {
            $tempKeys[] = "int_value";
            $tempValues[] = strval($value);
        } elseif (strpos($key, "str-") === 0) {
            $tempKeys[] = "str_value";
            $tempValues[] = $value;
        } else continue;
        $res = insert($tableName, $tempKeys, $tempValues);
        if (!$res)
            echo mysqli_error($mysqli) . "\n\n";
    }

}

function ensureStackedDataTable($tableName) {
    ensureTable($tableName,"CREATE TABLE `" . $tableName . "` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `participant_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `context` varchar(100) DEFAULT NULL,
  `key` varchar(100) DEFAULT NULL,
  `int_value` int(11) DEFAULT NULL,
  `str_value` text,
  PRIMARY KEY (`id`),
  KEY `participant_id` (`participant_id`),
  KEY `session_id` (`session_id`),
  KEY `context` (`context`),
  KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
}