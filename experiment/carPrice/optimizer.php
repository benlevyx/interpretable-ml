<?php 
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


$output = exec('../../code/run_bayes_opt.py 2>&1');
echo($output);
?>