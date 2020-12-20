<?php
/**
 * Created by PhpStorm.
 * User: kgajos
 * Date: 11/28/15
 * Time: 2:15 PM
 */

require_once("config.php");
require_once("../utils/php/utils.php");
if(!session_id())
{
    session_start();
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



