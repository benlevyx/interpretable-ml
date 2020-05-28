<?php
require_once("config.php");
require_once("../utils/php/utils.php");

// TODO names of the form fields from the demographics questionnaire that are to be captured and saved into the database
if(isset($_REQUEST["accuracy"])) {
    $participantFormFields = array("participant_id",  "variant" , "accuracies");
    $dataJSON = $_REQUEST["accuracy"];
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
    $result = insert("accuracy", $keys, $values);
    echo("inserted accuracy data. ");
}

if(isset($_REQUEST["data"])) {
    $participantFormFields = array("participant_id", "question_id", "reward", "choice", "arrangement", "variant");
    $dataJSON = $_REQUEST["data"];
    #echo $dataJSON;
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
    echo("inserted arrangements data. ");
    
}

if(isset($_REQUEST["additional_data"])) {
    $dataJSON = $_REQUEST["additional_data"];
    $dat = json_decode($dataJSON, true);

    echo("inserted additional_data");
    $result = insert("additional_data", 
    array("participant_id", "entry_name", "value", "text_value"), 
    array($dat["participant_id"], $dat["entry_name"], $dat["value"], $dat["text_value"]));
}




?>