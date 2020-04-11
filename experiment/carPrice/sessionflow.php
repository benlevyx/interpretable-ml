<?php
/**
 * LabintheWild study template
 *
 * authors: Krzysztof Gajos
 */

require_once("config.php");
require_once("../utils/php/utils.php");

// look at the graph at the top of http://food.labinthewild.org/study1/sessionflow.php?report=1
// to see what this line does
$activityStatesToVisualize = array("#splash_page", "#instructions_page", "#results_page");
require_once("../utils/php/sessionflow.php");


?>