<?php
/*************************************************************
 * comments.php
 *
 * Submits the comments that a participant makes to the server.
 * Includes general comments, comments about how they cheated,
 * and technical difficulties.
 *
 * Authors: Yuechen Zhao, Krzysztof Gajos
 *
 * © Copyright 2014 LabintheWild
 * For questions about this file and permission to use
 * the code, contact us at info@labinthewild.org
 *************************************************************/

require_once("utils.php");

if (isset($_POST['general']))
    $general = mysqli_real_escape_string($mysqli, $_POST["general"]);
else
    $general = "";


if (isset($_POST['audioBool']))
    $audioBool = mysqli_real_escape_string($mysqli, $_POST["audioBool"]);
else
    $audioBool = "0";

$cheating = mysqli_real_escape_string($mysqli, $_POST["cheating"]);
$cheatingBool = mysqli_real_escape_string($mysqli, $_POST["cheat"]);
$technical = mysqli_real_escape_string($mysqli, $_POST["technical"]);
$technicalBool = mysqli_real_escape_string($mysqli, $_POST["tech"]);
$participant_id = mysqli_real_escape_string($mysqli, $_POST["participant_id"]);

$result = insertOrUpdate("comments", "participant_id_in_comments", $participant_id,
    array("general_comment", "cheatingBool", "cheating", "technicalBool", "technical"),
    array($general, $cheatingBool, $cheating, $technicalBool, $technical));

if (!$result)
    echo mysqli_error($mysqli);

$debugReport = getDebugReport();

// email comments out if participant made comments
$testName = TEST_NAME;
if ($cheating != "" || $technical != "" || $general != "") {
    $to = ADMIN_EMAIL;
    $subject = "LITW - " . TEST_NAME;
    $headers = "From: Lab in the Wild Bot<bot@labinthewild.org>";
    $body =
        "
Dear Test Administrator,

Participant No. $participant_id just made some 
general and/or technical comments about the 
$testName on Lab in the Wild.

=== General Comment ===

$general

=== Technical Comment ===

$technical

=== Cheating Comment ===

$cheating

Love,
Lab in the Wild Bot

P.S. Detailed debugging info:

$debugReport
";

    mail($to, $subject, $body, $headers);
}

?>