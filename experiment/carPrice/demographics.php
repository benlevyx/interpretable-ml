<?php
require_once("config.php");
require_once("../utils/php/utils.php");

// TODO names of the form fields from the demographics questionnaire that are to be captured and saved into the database
$participantFormFields = array("retake","age","gender","education","comp_usage","country_young","country_now");

// save the user agent
$ua = mysqli_real_escape_string($mysqli, $_SERVER["HTTP_USER_AGENT"]);
$keys = array("user_agent");
$values = array($ua);

// read the values from the form
foreach ($participantFormFields as $field) {
    if(isset($_REQUEST[$field]) && strlen(trim($_REQUEST[$field])) > 0)
    {
        $keys[] = $field;
        $values[] = trim($_REQUEST[$field]);
    }
}

// save the demographics info into the "participants" table in the database
$result = insert("participants", $keys, $values);

// catch errors
if (!$result) {
    logError(("Failed: Cannot record demographics! MySQL said: " . mysqli_error($mysqli)), -1);
} else {
    // get the participant_id from the last demographic insert
    echo mysqli_insert_id($mysqli);
}

?>