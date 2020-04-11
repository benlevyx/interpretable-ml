<?php 


if(!session_id())
{
    session_start();
}

$dataJSON = $_REQUEST["data"];
$dat = json_decode($dataJSON, true);
$output = shell_exec("python test.py " . strval($dat["cur"]) .  strval($dat["response"]));
echo($output);

?>