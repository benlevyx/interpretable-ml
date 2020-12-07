<?php
/*************************************************************
 * emotions.php
 *
 * Submits the emotion label that a participant makes to the server.
 * Includes general comments, comments about how they cheated,
 * and technical difficulties.
 *
 * Authors: Bernd Huber, Krzysztof Gajos
 *
 * © Copyright 2015 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

require_once("utils.php");

// make sure that the table for storing emotion data exists
ensureTable("skip_sessions", "CREATE TABLE `skip_sessions` (
  `skip_id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id_in_skip` int(11) NOT NULL,
  `skip_position` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `other` text DEFAULT NULL,
  PRIMARY KEY (`skip_id`),
  KEY `participant_id_in_skip` (`participant_id_in_skip`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;");

if (isset($_POST['reason']))
    $reason = mysqli_real_escape_string($mysqli, $_POST["reason"]);
else
    $reason = "";

if (isset($_POST['other']))
    $other= mysqli_real_escape_string($mysqli, $_POST["other"]);
else
    $other = "";

if (isset($_POST['skip_position']))
    $skipPosition= mysqli_real_escape_string($mysqli, $_POST["skip_position"]);
else
    $skipPosition = "";

$participant_id = mysqli_real_escape_string($mysqli, $_POST["participant_id"]);

$result = insertOrUpdate("skip_sessions", "participant_id_in_skip", $participant_id,
    array("skip_position", "reason", "other"),
    array($skipPosition, $reason,$other)
    );

if (!$result)
    echo mysqli_error($mysqli);

?>