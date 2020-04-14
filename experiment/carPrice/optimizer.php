<?php 
if(!session_id())
{
    session_start();
}

$dataJSON = $_REQUEST["data"];
$dat = json_decode($dataJSON, true);
echo("current". $dat["cur"]);

echo("response". $dat["r"]);
//$output = shell_exec("python test.py " . strval($dat["cur"]) .  strval($dat["response"]));
//echo($output);

?>