<?php
/**
 * Created by PhpStorm.
 * User: kgajos
 * Date: 11/18/15
 * Time: 8:25 AM
 */

require_once(__DIR__ . "/../external/pdl/BetaDistribution.php");

// make sure that all the right tables exist in the database
ensureTable("adaptinthewild_variants", "CREATE TABLE `adaptinthewild_variants` (
  `choice_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id_in_variants` int(11) DEFAULT NULL,
  `client_time_in_variants` double DEFAULT NULL,
  `variant_key` varchar(25) NOT NULL DEFAULT '',
  `variant_choice_key` varchar(25) NOT NULL DEFAULT '',
  PRIMARY KEY (`choice_id`),
  KEY `session_id_in_variants` (`session_id_in_variants`),
  KEY `variant_key` (`variant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

ensureTable("adaptinthewild_measurements", "CREATE TABLE `adaptinthewild_measurements` (
  `measurement_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id_in_measurements` int(11) NOT NULL,
  `client_time_in_measurements` int(11) DEFAULT NULL,
  `measurement_key` varchar(25) NOT NULL DEFAULT '',
  `measurement_value` double NOT NULL,
  PRIMARY KEY (`measurement_id`),
  KEY `session_id_in_measurements` (`session_id_in_measurements`),
  KEY `measurement_key` (`measurement_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

// process the HTTP request
adaptInTheWildRequest($mysqli);

/*
 * The main function
 */
function adaptInTheWildRequest($mysqli)
{
    if (isset($_REQUEST["requests"])) {
        $data = json_decode($_REQUEST["requests"], true);

        foreach ($data as $request) {
            if (isset($request['action'])) {
                $action = $request['action'];
                $clientTime = $request['clientTime'];
                $sessionID = $_REQUEST['sessionID'];
                if ($action == "variantChoice") {
                    $variantID = $request['variantID'];
                    $variantChoiceKey = $request['variantChoiceKey'];
                    echo recordVariantChoice($mysqli, $sessionID, $clientTime, $variantID, $variantChoiceKey);
                } else if ($action == "measurement") {
                    $measurementID = $request['measurementID'];
                    $measurementValue = $request['measurementValue'];
                    echo recordMeasurement($mysqli, $sessionID, $clientTime, $measurementID, $measurementValue);
                }
            } else {
                echo "No action specified: ";
                var_dump($request);
            }
        }
    } else if (isset($_REQUEST["report"])) {
        if (isset($_REQUEST['key'])) {
            adaptInTheWilSpecificReport($mysqli, $_REQUEST['key']);
        } else
            showAvailableExperiments($mysqli);
    } else if (isset($_REQUEST["debug"])) {
        //echo "original<br/>";
        //var_dump(measurementCountOEC($mysqli, "splashContent", "original", "splash-button"));
        //echo "<br/>food intelligence<br/>";
        //var_dump(measurementCountOEC($mysqli, "splashContent", "food intelligence", "splash-button"));
    }

}

// pick a random variant and record the choice in the database; $variants should be an associative array
// where the key is what gets recorded in the database and value is what gets displayed
function sampleVariantUniform($sessionID, $variantID, $variants) {
    global $mysqli;
    $selectedVariantKey = array_keys($variants)[mt_rand(0, count($variants) - 1)];
    recordVariantChoice($mysqli, $sessionID, 0, $variantID, $selectedVariantKey);
    return $variants[$selectedVariantKey];
}

function sampleVariantThompsonByMeasurementKeyCount($sessionID, $variantID, $variants, $measurementKey) {
    global $mysqli;
    $maxVal = 0;
    $bestVariantChoiceKey = null;
    foreach($variants as $variantChoiceKey => $variantContent) {
        $OEC = measurementCountOEC($mysqli, $variantID, $variantChoiceKey, $measurementKey);
        $alpha = 1 + $OEC["OEC"];
        $beta = 1 + $OEC["N"] - $OEC["OEC"];
        $betaDistribution = new BetaDistribution($alpha, $beta);
        $curVal = $betaDistribution->_getICDF(randomFloat());
        if (isset($_REQUEST["debug"])) echo "$variantChoiceKey: a: $alpha, b: $beta, val: $curVal<br/>\n";
        if ($curVal > $maxVal) {
            $maxVal = $curVal;
            $bestVariantChoiceKey = $variantChoiceKey;
        }
    }
    recordVariantChoice($mysqli, $sessionID, 0, $variantID, $bestVariantChoiceKey);
    return $variants[$bestVariantChoiceKey];
}

function recordVariantChoice($mysqli, $sessionID, $clientTime, $variantID, $variantChoiceKey) {
    if (DEBUG) echo "AdaptintheWild.php: Variant: " . $variantID . " = " . $variantChoiceKey . "<br/>\n";
    $sessionID = mysqli_real_escape_string($mysqli, $sessionID);
    $clientTime = mysqli_real_escape_string($mysqli, $clientTime);
    $variantID = mysqli_real_escape_string($mysqli, $variantID);
    $variantChoiceKey = mysqli_real_escape_string($mysqli, $variantChoiceKey);
    $result = insert("adaptinthewild_variants",
        array("session_id_in_variants", "client_time_in_variants", "variant_key", "variant_choice_key"),
        array($sessionID, $clientTime, $variantID, $variantChoiceKey));
    if (!$result) {
        logError(("Failed: Cannot record variant choice activity for session . " . $sessionID . "! MySQL said: "
            . mysqli_error($mysqli)), -1);
    }
    return "OK";
}

function recordMeasurement($mysqli, $sessionID, $clientTime, $measurementID, $measurementValue) {
    if (DEBUG) echo "AdaptintheWild.php: Measurement: " . $measurementID . " = " . $measurementValue . "<br/>\n";
    $sessionID = mysqli_real_escape_string($mysqli, $sessionID);
    $clientTime = mysqli_real_escape_string($mysqli, $clientTime);
    $measurementID = mysqli_real_escape_string($mysqli, $measurementID);
    $measurementValue = mysqli_real_escape_string($mysqli, $measurementValue);
    $result = insert("adaptinthewild_measurements",
        array("session_id_in_measurements", "client_time_in_measurements", "measurement_key", "measurement_value"),
        array($sessionID, $clientTime, $measurementID, $measurementValue));
    if (!$result) {
        logError(("Failed: Cannot record measurement for session . " . $sessionID . "! MySQL said: "
            . mysqli_error($mysqli)), -1);
    }
    return "OK";
}

function getVariantCount($mysqli, $variantKey, $variantChoiceKey) {
    $query = "select count(*) from `adaptinthewild_variants` where variant_key = \"$variantKey\" and variant_choice_key = \"$variantChoiceKey\"";
    $res = mysqli_query($mysqli, $query);
    return intval($res->fetch_array()[0]);
}

function getMeasurementCount($mysqli, $variantKey, $variantChoiceKey, $measurementKey) {
    $query = "select count(*) from `adaptinthewild_variants`, `adaptinthewild_measurements`
where
variant_key = \"$variantKey\" and variant_choice_key = \"$variantChoiceKey\"
AND
`adaptinthewild_variants`.`session_id_in_variants` = `adaptinthewild_measurements`.`session_id_in_measurements`
AND
adaptinthewild_measurements.`measurement_key` = \"$measurementKey\"";

    $res = mysqli_query($mysqli, $query);
    return intval($res->fetch_array()[0]);
}

/*
 * Evaluates a variant choice by seeing what fraction of the time taht it was displayed it resulted in a particular
 * measurement key being recorded; returns both the total N and the number of successes
 */
function measurementCountOEC($mysqli, $variantKey, $variantChoiceKey, $measurementKey){
   return array(
       "N" => getVariantCount($mysqli, $variantKey, $variantChoiceKey),
       "OEC" => getMeasurementCount($mysqli, $variantKey, $variantChoiceKey, $measurementKey)
       );
}

function showAvailableExperiments($mysqli) {
    // query for listing all the things we are varying in this study
    $variantKeysQuery = "select distinct variant_key from `adaptinthewild_variants`";
    $variantKeyResults = mysqli_query($mysqli, $variantKeysQuery);
    $variantKeys = array();
    while($row = $variantKeyResults->fetch_array(MYSQLI_ASSOC))
        array_push($variantKeys, $row["variant_key"]);
    ?>
    <html>
    <head><title>Adapt in the Wild - <?php echo TEST_NAME ?></title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
    </head>
    <body>
    <h1><?php echo TEST_NAME ?>: A/B test results.</h1>
    <?php
    if (count($variantKeys) > 0) {
        echo "<h2>Variants being explored</h2><ul>";
        foreach ($variantKeys as $variantKey)
            echo "<li><a href='?report=1&key=$variantKey'>$variantKey</a></li>";
        echo "</ul>";
    } else
        echo "<b>No A/B experiments are set up for " . TEST_NAME  ."</b>";
    ?>
    </body></html>
    <?php
}

function adaptInTheWilSpecificReport($mysqli, $variantKey) {
    ?>
    <html>
    <head><title>Adapt in the Wild - <?php echo TEST_NAME ?></title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
    </head>
    <body>
    <h1><?php echo TEST_NAME ?></h1>
    <?php
    reportHelper($mysqli, $variantKey);
    ?>
    </body></html>
    <?php
}

function adaptInTheWildReport($mysqli) {
    // query for listing all the things we are varying in this study
    $variantKeysQuery = "select distinct variant_key from `adaptinthewild_variants`";
    $variantKeyResults = mysqli_query($mysqli, $variantKeysQuery);
    $variantKeys = array();
    while($row = $variantKeyResults->fetch_array(MYSQLI_ASSOC))
        array_push($variantKeys, $row["variant_key"]);
    ?>
    <html>
    <head><title>Adapt in the Wild - <?php echo TEST_NAME ?></title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
    </head>
    <body>
    <h1><?php echo TEST_NAME ?>: A/B test results.</h1>
    <?php
    if (count($variantKeys) > 0) {
        echo "<h2>Variants being explored</h2><ul>";
        foreach ($variantKeys as $variantKey)
            echo "<li><a href='#$variantKey'>$variantKey</a></li>";
        echo "</ul>";
        foreach ($variantKeys as $variantKey)
            reportHelper($mysqli, $variantKey);
    } else
        echo "<b>No A/B experiments are set up for " . TEST_NAME  ."</b>";
    ?>
    </body></html>
    <?php

}

function reportHelper($mysqli, $variantKey)
{

    $query1 = <<<EOT
    select measurement_key, variant_choice_key, n, measure, (measure/n) from
(select adaptinthewild_measurements.measurement_key as measurement_key, adaptinthewild_variants.variant_choice_key as variant_choice_key, counts.n as n, sum(adaptinthewild_measurements.measurement_value) as measure
from
adaptinthewild_variants, adaptinthewild_measurements,
(select adaptinthewild_variants.variant_choice_key as choice_key, count(*) as n from adaptinthewild_variants
WHERE adaptinthewild_variants.variant_key = "$variantKey"
group by adaptinthewild_variants.variant_choice_key) as counts
where adaptinthewild_variants.session_id_in_variants = adaptinthewild_measurements.session_id_in_measurements
AND adaptinthewild_variants.variant_key = "$variantKey"
AND counts.choice_key = adaptinthewild_variants.variant_choice_key
group by measurement_key, variant_choice_key) as tmp
EOT;
    $html1 = getQueryResultAsHTML($mysqli, $query1,
        array());

    $query2 = <<<EOT
        select activity_stage, activity_code, variant_choice_key, n, measure, (measure/n) from
    (select
session_activities.`activity_stage` as activity_stage,
session_activities.`activity_code` as activity_code,
adaptinthewild_variants.variant_choice_key as variant_choice_key,
counts.n as n,
count(distinct adaptinthewild_variants.session_id_in_variants) as measure
from
adaptinthewild_variants, session_activities,
(select adaptinthewild_variants.variant_choice_key as choice_key, count(*) as n from adaptinthewild_variants
where adaptinthewild_variants.variant_key = "$variantKey"
group by adaptinthewild_variants.variant_choice_key) as counts
where
adaptinthewild_variants.session_id_in_variants = session_activities.`session_id_in_activities`
AND adaptinthewild_variants.variant_key = "$variantKey"
AND counts.choice_key = adaptinthewild_variants.variant_choice_key
group by activity_stage, activity_code, variant_choice_key) as tmp
EOT;
    $html2 = getQueryResultAsHTML($mysqli, $query2,
        array());


    $emotionsTableExists = tableExists("emotions");

    if ($emotionsTableExists) {
        $emotionsQuery = <<<EOT
select adaptinthewild_variants.variant_choice_key as variant_choice_key,
count(*) as n,
avg(emotions.arousal) as arousal,
avg(emotions.valence) as valence
from
adaptinthewild_variants, emotions, sessions
where adaptinthewild_variants.session_id_in_variants = sessions.session_id
AND sessions.participant_id_in_sessions = emotions.participant_id_in_emotions
 AND adaptinthewild_variants.variant_key = "$variantKey"
group by variant_choice_key
EOT;
        $emotionsHtml = getQueryResultAsHTML($mysqli, $emotionsQuery, null);
    }
    ?>
    <a name="<?php echo $variantKey?>"></a>
    <h2>Results for <?php echo $variantKey?></h2>
    <h3>Measures</h3>
    <?php echo $html1 ?>

    <h3>Stages reached</h3>
    <?php echo $html2;

    if ($emotionsTableExists) {
    ?>
    <h3>Emotions</h3>
    <?php echo $emotionsHtml; } ?>

    <?php
}
?>