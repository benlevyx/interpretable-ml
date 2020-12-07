<?php
require_once("survey.php");
require_once("config.php");

// if it is receiving a CGI request, process it
if (isset($_REQUEST['items'])) {
    saveSurveyResults();
}