<?php 
require_once("config.php");
require_once("../utils/php/utils.php");
if(!session_id())
{
    session_start();
}

/*
if(isset($_REQUEST["data"])) {
    $dataJSON = $_REQUEST["data"];
    $dataJSON = str_replace(' ', '', $dataJSON);
    #echo($dataJSON);

    echo('../../code/run_bayes_opt.py '. $dataJSON);
    $output = exec('../../code/run_bayes_opt.py '. $dataJSON . ' 2>&1');
}
else {
    $output = exec('../../code/run_bayes_opt.py 2>&1');

}
*/
if (isset($_REQUEST['data'])) {
    $d = $_REQUEST['data'];
    $output = exec("../../code/run_bayes_opt.py -i '{$d}' 2>&1"); 
    echo($output);
}
else {
    $query = ("SELECT arrangement FROM arrangements WHERE arrangement_id = (SELECT MAX(arrangement_id) FROM arrangements);");

    $result_r = mysqli_fetch_array(mysqli_query($mysqli, $query))['arrangement'];
    #$output = exec("../../code/run_bayes_opt.py -i '{$result_r}' 2>&1");
    echo($result_r);
}

#echo($output);
?>