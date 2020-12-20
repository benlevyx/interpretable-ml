<?php
require_once("config.php");
require_once("../utils/php/utils.php");

// TODO names of the form fields from the demographics questionnaire 
// that are to be captured and saved into the database
$participantFormFields = array("error", "confidence","preference", "time", 'sequence', "participant_id");

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

// save the info into the "tasks" table in the database
$result = insert("tasks", $keys, $values);

// catch errors
echo mysqli_error($mysqli);
if (!$result) {
    logError(("Failed: Cannot record data! MySQL said: " . mysqli_error($mysqli)), -1);
} else {
    // get the participant_id from the last demographic insert
    echo "hello";
}

?>