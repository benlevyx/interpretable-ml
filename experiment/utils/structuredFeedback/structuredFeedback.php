<?php
/**
 * Created by: kgajos
 * Date: 11/21/18
 * Time: 4:28 PM
 */

ensureTable("structured_feedback_items", "CREATE TABLE `structured_feedback_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `creator_id` int(11) DEFAULT NULL COMMENT 'participant_id of the person who created it',
  `context` varchar(255) DEFAULT NULL COMMENT 'If multiple instances of structured feedback collection are used in a single study, context can be used to distinguish among them',
  `item` text NOT NULL COMMENT 'The content of the item',
  `creation_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `context` (`context`),
  KEY `approved` (`approved`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

ensureTable("structured_feedback_actions", "CREATE TABLE `structured_feedback_actions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `participant_id` int(11) NOT NULL DEFAULT '-1',
  `session_id` int(11) NOT NULL DEFAULT '-1',
  `context` varchar(255) DEFAULT NULL COMMENT 'If multiple instances of structured feedback collection are used in a single study, context can be used to distinguish among them',
  `action` varchar(50) NOT NULL DEFAULT '',
  `data_int` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ui_version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `participant_id` (`participant_id`),
  KEY `context` (`context`),
  KEY `action` (`action`),
  KEY `ui_variant` (`ui_version`),
  KEY `session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

processStructuredFeedbackRequest();

function processStructuredFeedbackRequest() {
    global $mysqli;

    if (isset($_REQUEST["requests"])) {
//        echo $_REQUEST["requests"];
        $requestsDecoded = json_decode($_REQUEST["requests"], true);
        $participantID = $_REQUEST['participantID'];
        $sessionID = $_REQUEST['sessionID'];
        $setting = "production";
        if (isset($_REQUEST['setting']))
            $setting = $_REQUEST['setting'];
        $context = "";
        if (isset($_REQUEST['context']))
            $context = $_REQUEST['context'];
        $uiVersion = $_REQUEST['uiVersion'];

        foreach ($requestsDecoded as $request) {
            $action = $request['action'];
            $data_int = null;
            if (isset($request['data_int']))
                $data_int = $request['data_int'];


            if ($action == "getExamples") {
                // Get items from the database to show as examples to the user
                if ($setting == "test") {
                    // send some test examples
                    echo json_encode([["item" => "I was bored", "id" => 1],["item" => "Teacher made me", "id" => 2]]);
                } else {
                    $num = 6;
                    if (isset($request['n']))
                        $num = $request['n'];
                    $query = "select id, item from structured_feedback_items where approved=1 order by rand() limit " . $num;
                    $rows = getQueryResultAsArray($mysqli, $query);
                    echo json_encode($rows);
                }
            } elseif ($action == "addItem") {
                // Save a newly added item
                if ($setting == "test") {
                    // return random id for the new item
                    echo json_encode(rand(100, 10000000));
                } else {
                    $res = insert("structured_feedback_items",
                        ["creator_id", "context", "item"],
                        [$participantID, $context, $request['itemText']]);
                    if ($res) {
                        $newItemID = mysqli_insert_id($mysqli);
                        echo json_encode($newItemID);
                        insert("structured_feedback_actions",
                            ["item_id", "participant_id", "session_id", "context", "action", "ui_version"],
                            [$newItemID, $participantID, $sessionID, $context, "add-new", $uiVersion]);
                        // return the database id of the newly added item
                    } else
                        echo getMySQLError();
                }
            } elseif (startsWith($action, "add-") || startsWith($action, "remove") || startsWith($action, "item-")) {
                if ($setting != "test") {
                    $res = insert("structured_feedback_actions",
                        ["item_id", "participant_id", "session_id", "context", "action", "data_int", "ui_version"],
                        [$request['dbid'], $participantID, $sessionID, $context, $action, $data_int, $uiVersion]);
                }
            } elseif ($action == "saveResult") {
                // Save the final set of items selected by the user
                $items = $request["items"];
                if ($setting == "test") {
                    echo "OK";
                } else {
                    foreach ($items as $item) {
                        $res = insert("structured_feedback_actions",
                            ["item_id", "participant_id", "session_id", "context", "action", "ui_version"],
                            [$item, $participantID, $sessionID, $context, "final-selection", $uiVersion]);
                    }

                }
            }

        }

    }
}
