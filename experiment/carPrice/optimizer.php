<?php 
if(!session_id())
{
    session_start();
}

$dataJSON = $_REQUEST["data"];
$dat = json_decode($dataJSON, true);
$output = exec('../../code/run_bayes_opt.py 2>&1');

echo($output);
?>