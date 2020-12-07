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
ensureTable("emotions", "CREATE TABLE `emotions` (
  `emotion_id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id_in_emotions` int(11) NOT NULL,
  `arousal` float DEFAULT NULL,
  `valence` float DEFAULT NULL,
  `emotion` text,
  `mechanism` varchar(20) DEFAULT '',
  `context` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`emotion_id`),
  KEY `participant_id_in_emotions` (`participant_id_in_emotions`),
  KEY `context` (`context`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;");


$CAAT_emotions = [
    "nothing"      => ["valence" => 4, "arousal" => 4],
    "terror"       => ["valence" => 2.8, "arousal" => 6.4],
    "fear"         => ["valence" => 2.9, "arousal" => 6.1],
    "apprehension" => ["valence" => 4.2, "arousal" => 4.2],
    "annoyance"    => ["valence" => 3, "arousal" => 4.1],
    "anger"        => ["valence" => 2.5, "arousal" => 5.9],
    "rage"         => ["valence" => 2.3, "arousal" => 5.2],
    "admiration"   => ["valence" => 7.6, "arousal" => 5.5],
    "trust"        => ["valence" => 7.2, "arousal" => 4.3],
    "acceptance"   => ["valence" => 6.8, "arousal" => 4.3],
    "boredom"      => ["valence" => 2.8, "arousal" => 2.6],
    "disgust"      => ["valence" => 3.3, "arousal" => 5],
    "loathing"     => ["valence" => 2.4, "arousal" => 4.5],
    "ecstasy"      => ["valence" => 7.2, "arousal" => 6.1],
    "joy"          => ["valence" => 8.2, "arousal" => 5.6],
    "serenity"     => ["valence" => 7.8, "arousal" => 3],
    "pensiveness"  => ["valence" => 3.7, "arousal" => 4.1],
    "sadness"      => ["valence" => 2.4, "arousal" => 2.8],
    "grief"        => ["valence" => 2.3, "arousal" => 5],
    "vigilance"    => ["valence" => 5.7, "arousal" => 3.6],
    "anticipation" => ["valence" => 5.3, "arousal" => 5.4],
    "interest"     => ["valence" => 6.7, "arousal" => 4.4],
    "distraction"  => ["valence" => 4.1, "arousal" => 3.9],
    "surprise"     => ["valence" => 7.4, "arousal" => 6.6],
    "amazement"    => ["valence" => 7.3, "arousal" => 6.3]
];


if (isset($_REQUEST["arousal"])) {
// Process a request to save emotions

    if (isset($_REQUEST['general']))
        $general = mysqli_real_escape_string($mysqli, $_REQUEST["general"]);
    else
        $general = "";

    $arousal = mysqli_real_escape_string($mysqli, $_REQUEST["arousal"]);
    $valence = mysqli_real_escape_string($mysqli, $_REQUEST["valence"]);
    $emotion = mysqli_real_escape_string($mysqli, $_REQUEST["emotion"]);
    $mechanism = mysqli_real_escape_string($mysqli, $_REQUEST["mechanism"]);
    $participant_id = mysqli_real_escape_string($mysqli, $_REQUEST["participant_id"]);

    $keys = array("participant_id_in_emotions", "arousal", "valence", "emotion", "mechanism");
    $values = array($participant_id, $arousal, $valence, $emotion, $mechanism);

    // context field was added late and databases for some experiments may not have this field defined; so only
    // use it in the INSERT if an experiment provides value for context indicating that the database can
    // probably handle it
    if (isset($_REQUEST["context"])) {
        $keys[] = "context";
        $values[] = $_REQUEST["context"];
    }

    $result = insert("emotions",$keys, $values);

    if (!$result)
        echo mysqli_error($mysqli);
} else if (isset($_REQUEST["repairdb"])) {
    // repair how the numerical values of valence and arousal are computed from the raw emotions reported
    // (to fix a bug in how numerical values were initially recorded if two emotions were given)

    // first, get all the rows with two emotions
    $query = 'select * from emotions where emotion like "%-%"';
    $result = mysqli_query($mysqli, $query);
    while($row = $result->fetch_array(MYSQLI_ASSOC)) {
        $e1 = trim(substr($row["emotion"], 0, strpos($row["emotion"], "-")));
        $e2 = trim(substr($row["emotion"], strpos($row["emotion"], "-") + 1));
        $arousal = ($CAAT_emotions[$e1]["arousal"] + $CAAT_emotions[$e2]["arousal"]) / 2;
        $valence = ($CAAT_emotions[$e1]["valence"] + $CAAT_emotions[$e2]["valence"]) / 2;
//        echo "<p>Emotion id: " . $row["emotion_id"] . ": " . $e1 . " and " . $e2 . " valence: " . $valence . " arousal: " . $arousal . "</p>";
        $query = "update emotions set arousal = " . $arousal . ", valence = " . $valence . " where emotion_id = " . $row["emotion_id"];
        $r = mysqli_query($mysqli, $query);
        if (!$r)
            echo mysqli_error($mysqli);
    }
}

?>