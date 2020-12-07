<?php
/**
 * Created by PhpStorm.
 *
 * Server-side backend for recording personality traits.
 *
 * User: kgajos
 * Date: 8/7/16
 * Time: 10:26 AM
 */

// __DIR__ returns the directory of this file to make sure require works even if this file is included inside another
// php file
require_once(__DIR__ . "/utils.php");

// make sure the table for recording traits exists
ensureTable("traits", "CREATE TABLE `traits` (
  `trait_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `participant_id_in_traits` int(11) NOT NULL,
  `construct` varchar(50) NOT NULL DEFAULT '',
  `item_code` varchar(50) NOT NULL DEFAULT '',
  `score` smallint(6) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`trait_id`),
  KEY `participant_id_in_traits` (`participant_id_in_traits`),
  KEY `construct` (`construct`),
  KEY `item_code` (`item_code`),
  KEY `source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

ensureTable("traits_averaged", "CREATE VIEW `traits_averaged`
AS SELECT
   `traits`.`participant_id_in_traits` AS `participant_id_in_traits`,
   `traits`.`construct` AS `construct`,count(0) AS `num_trait_items_answered`,avg(`traits`.`score`) AS `mean_trait_score`
FROM `traits` group by `traits`.`participant_id_in_traits`,`traits`.`construct`;");

$source = isset($_REQUEST["source"]) ? $_REQUEST["source"] : null;

if (isset($_REQUEST["participant_id"])) {
    $participantID = $_REQUEST["participant_id"];

    foreach ($_REQUEST as $key => $value) {
        if (DEBUG)
            echo "Looking at " . $key . "<br/>\n";
        if (strpos($key, "trait-") === 0) {
            $itemCode = substr($key, 6);
            $firstDigitPosition = getPositionOfFirstDigit($itemCode);
            if ($firstDigitPosition)
                $constructName = substr($itemCode, 0, $firstDigitPosition);
            else
                $constructName = $itemCode;
            $res = insert("traits",
                array("participant_id_in_traits", "construct", "item_code", "score", "source"),
                array($participantID, $constructName, $itemCode, $value, $source));
            if (!$res)
                echo mysqli_error($mysqli) . "\n\n";
            else
                echo "OK";
        }
    }
} else echo "PONG";