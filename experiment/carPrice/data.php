<?php
require_once("config.php");
require_once("../utils/php/utils.php");

// TODO names of the form fields from the demographics questionnaire that are to be captured and saved into the database
$participantFormFields = array("participant_id", "question_id", "time_spent", "choice", "arrangement", "variant");

$dataJSON = $_REQUEST["data"];
$data = json_decode($dataJSON, true);
// read the values from the form
foreach ($participantFormFields as $field) {
    if(isset($data[$field]) && strlen(trim($data[$field])) > 0)
    {
        $keys[] = $field;
        $values[] = trim($data[$field]);
    }
}

// save the task into the "arrangements" table in the database
$result = insert("arrangements", $keys, $values);


?>