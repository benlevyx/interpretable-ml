<?php
require_once("../utils/survey/survey.php");

// if a CGI request is received, process it
if (isset($_REQUEST['items'])) {
    // by default, survey results are saved to a database table called "survey_results", but you can
    // put results from different surveys in different tables by adding survey => table mappings to the
    // $surveyCodesToDbTableNames dictionary:
    $surveyCodesToDbTableNames["nfc_survey"] = "personality_traits";

    // now save the survey results
    saveSurveyResults();
}