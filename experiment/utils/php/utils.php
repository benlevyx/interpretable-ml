<?php

require_once("config.php");



function __($str, $withQuote = true) {
    if ($withQuote)
        echo '"'.gettext($str).'"';
    else
        echo gettext($str);
}

/***************************************
 *****  HTTP REQUEST HANDLING **********
 ****************************************/

function makePOSTparamatersAvailableToJavaScript() {
    $POSTasJSON = json_encode($_POST);
    echo "<script>var _POST = JSON.parse('$POSTasJSON')</script>";
}

function getRequestValue($requestName, $defaultValue) {
    if (isset($_REQUEST[$requestName]))
        return $_REQUEST[$requestName];
    return $defaultValue;
}

/***************************************
 *****  ERROR REPORTING **********
 ****************************************/

function error_handler($e, $database) {
    logDebug($database . ": " . $e->getMessage());
    echo $e->getMessage();
    die();
}

// email to test administrator if an error occurred
function logError($error, $participant_id) {
    $debugReport = getDebugReport();
    $to = ADMIN_EMAIL;
    $subject = "LITW - " . TEST_NAME . " Encountered Error";
    $headers = "From: Lab in the Wild Bot <bot@labinthewild.org>";
    $body =
        "
Dear Test Administrator,

Participant No. $participant_id just encountered
a fatal error and was forced to drop out of the
test on Lab in the Wild.

=== The Error ===

$error

=== Other Info ===

$debugReport

Love,
Lab in the Wild Bot
";

    mail($to, $subject, $body, $headers);

    if (DEBUG)
        echo($body);
}

// generate a detailed debug report containing user agent, the full content of the
// http request and stack trace
function getDebugReport() {
    $userAgent = "[unspecified]";
    if (isset($_SERVER["HTTP_USER_AGENT"]))
        $userAgent = $_SERVER["HTTP_USER_AGENT"];
    $request = "[unspecified]";
    if (isset($_REQUEST))
        $request = var_export($_REQUEST, true);
    // generate stack trace
    $exception = new Exception;
    $stackTrace = $exception->getTraceAsString();
    return "
User agent: $userAgent

HTTP Request: $request

Stack trace:
$stackTrace
";
}

function logDebug($debug_msg) {
    if(DEBUG) {
        $handle = fopen("debug.txt", "a");
        fwrite($handle, date("m-d H:i:s") . " " . $debug_msg . "\n");
        fclose($handle);
    }
}


/***************************************
 *****  DATABASE-RELATED **********
 ****************************************/


// check if a row with a specific key already exists
function getRowByKey($tableName, $keyName, $keyValue) {
    global $mysqli;
    $query = "SELECT * FROM " . $tableName . " WHERE " . $keyName . " = " . $keyValue;
    if (DEBUG)
        echo $query . "<br/>\n";
    $res = mysqli_query($mysqli, $query);
    return $res;
}

// first checks if a row for a particular key-value pair already exists; if not, it inserts
// a new row.  Otherwise, it updates the existing row with new values
function insertOrUpdate($tableName, $keyName, $keyValue, $columnNames, $values, $sanitize = true) {
    global $mysqli;
    if ($sanitize) {
        $values = mysqli_real_escape_strings($mysqli, $values);
        $keyValue = mysqli_real_escape_string($mysqli, $keyValue);
    }
    $query = "";
    $res = getRowByKey($tableName, $keyName, $keyValue);
    if ($res && mysqli_num_rows($res) > 0) { // row already exists
        if (DEBUG) echo "Entry for " . $keyName . " = " . $keyValue . " already exists: " . var_dump($res) . "<br/>\n";
        for($i=0; $i<count($columnNames); $i++) {
            $query = "update " . $tableName . " set " . $columnNames[$i] . " = \"" . $values[$i] . "\""
                . " where " . $keyName . " = \"" . $keyValue . "\"";
            if (DEBUG) echo $query . "<br/>\n";
            $res = mysqli_query($mysqli, $query);
            if (DEBUG && $res) echo "Query executed successfully<br/>\n";
            if (DEBUG && !$res) echo "Error executing the query: " . mysqli_error($mysqli) . "<br/>\n";
        }
    } else { // row does not yet exist
        if (DEBUG) echo "Entry for " . $keyName . " = " . $keyValue . " does not yet exist: " . var_dump($res) . "<br/>\n";
        $query = "INSERT INTO " . $tableName . " (`" . $keyName . "`, `" . implode("`, `", $columnNames) . "`) VALUES ('" . $keyValue . "', '" . implode("', '", $values) . "')";
        if (DEBUG) echo $query . "<br/>\n";
        $res = mysqli_query($mysqli, $query);
        if (DEBUG && $res) echo "Query executed successfully<br/>\n";
        if (DEBUG && !$res) echo "Error executing the query: " . mysqli_error($mysqli) . "<br/>\n";
    }
    return $res;
}

/**
 * first checks if a row for a particular key-value pair already exists; if not, it inserts
 * a new row.  Otherwise, does nothing
 *
 * @param $tableName
 * @param $keyName
 * @param $keyValue
 * @param $columnNames
 * @param $values
 * @param bool $sanitize set to true by default; if true, each value is ran through mysqli_real_escape_string first
 * @return bool|mysqli_result
 */
function insertIfNotExist($tableName, $keyName, $keyValue, $columnNames, $values, $sanitize = true) {
    global $mysqli;
    if ($sanitize) {
        $values = mysqli_real_escape_strings($mysqli, $values);
        $keyValue = mysqli_real_escape_string($mysqli, $keyValue);
    }
    $query = "";
    $res = getRowByKey($tableName, $keyName, $keyValue);
    if ($res && mysqli_num_rows($res) > 0) { // row already exists
        if (DEBUG) echo "Entry for " . $keyName . " = " . $keyValue . " already exists: " . var_dump($res) . "<br/>\n";
    } else { // row does not yet exist
        if (DEBUG) echo "Entry for " . $keyName . " = " . $keyValue . " does not yet exist: " . var_dump($res) . "<br/>\n";
        $query = "INSERT INTO " . $tableName . " (`" . $keyName . "`, `" . implode("`, `", $columnNames) . "`) VALUES ('" . $keyValue . "', '" . implode("', '", $values) . "')";
        if (DEBUG) echo $query . "<br/>\n";
        $res = mysqli_query($mysqli, $query);
        if (DEBUG && $res) echo "Query executed successfully<br/>\n";
        if (DEBUG && !$res) echo "Error executing the query: " . mysqli_error($mysqli) . "<br/>\n";
        return $res;
    }
    return $res;
}

/**
 * Inserts a row into a table
 *
 * @param $tableName
 * @param $columnNames
 * @param $values
 * @param bool $sanitize set to true by default; if true, each value is ran through mysqli_real_escape_string first
 * @return bool|mysqli_result
 */
function insert($tableName, $columnNames, $values, $sanitize = true)
{
    global $mysqli;
    if ($sanitize)
        $values = mysqli_real_escape_strings($mysqli, $values);
    $query = "INSERT INTO " . $tableName . " (`" . implode("`, `", $columnNames) . "`) VALUES ('" . implode("', '", $values) . "')";
    if (DEBUG) echo $query . "<br/>\n";
    $res = mysqli_query($mysqli, $query);
    return $res;
}

/**
 * sanitizes an array of strings for safe use as values in SQL queries
 *
 * @param $mysqli
 * @param $strings
 * @return a new array of sanitized strings
 */
function mysqli_real_escape_strings($mysqli, $strings) {
    $res = array();
    for($i=0; $i<count($strings); $i++)
        $res[] = mysqli_real_escape_string($mysqli, $strings[$i]);
    return $res;
}

/**
 * Turns booleans into 0/1
 *
 * @param $boolValue
 * @return int 0/1
 */
function boolToInt($boolValue) {
    if ($boolValue) return 1;
    return 0;
}

// check if the relevant table exists
function tableExists($tableName) {
    global $mysqli;
    $query = "SHOW TABLES LIKE '" . $tableName . "'";
    $temp = mysqli_query($mysqli, $query);
    //if (DEBUG) echo "Response to query " . $query . " is: " . $temp . "<br/>\n";
    return ($temp && mysqli_num_rows($temp) > 0);
}

// checks if table exists; if it does not, it runs the tableCreateQuery to create it
function ensureTable($tableName, $tableCreateQuery) {
    global $mysqli;
    if (!tableExists($tableName)) {
        $result = mysqli_query($mysqli, $tableCreateQuery);
        if (!$result)
            logError(mysqli_error($mysqli),
                "Encountered an error while trying to create a table with the following mySQL query: " . $tableCreateQuery);
    }
}

// if a table has an autoincrement field, you get get its latest value using this function; useful, for example,
// for finding out how many people have already completed an experiment
function getAutoIncrementValueForTable($database, $tableName) {
    global $mysqli;
    $query = "SELECT AUTO_INCREMENT FROM  INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '"
        . $database
        . "' AND TABLE_NAME = '" . $tableName . "'";
    //echo $query . "<br/>\n";
    $result =  mysqli_query($mysqli, $query);
    return $result->fetch_array()[0];
}

// adding an abstraction layer for getting mysql errors
function getMySQLError() {
    global $mysqli;
    return mysqli_error($mysqli);
}

// takes an SQL query and returns an HTML table (as String)
// holding all the results
// $headerNames is an optional associative array that translates
// column names from the query to human-readable column names.
// For a usage example see report() function in sessionflow.php
function getQueryResultAsHTML($mysqli, $query, $headerNames = null) {
    // execute query
    $result = mysqli_query($mysqli, $query);
    if (!$result)
        logError("Error executing the query: "
            . mysqli_error($mysqli) . "<br/>\n"
            . "Query: " . $query . "<br/>\n", "(not available)");

    $html = "<table class=\"table table-striped\"><thead><tr>";

    $row = $result->fetch_array(MYSQLI_ASSOC);
    if ($row != null) {
        $keys = array_keys($row);

        // create table headers
        foreach ($keys as $key) {
            if ($headerNames != null && isset($headerNames[$key]))
                $html .= "<th>$headerNames[$key]</th>";
            else
                $html .= "<th>$key</th>";
        }

        $html .= "</tr></thead>\n<tbody>";
        // now create table rows
        while ($row) {
            $html .= "<tr>";
            foreach ($keys as $key) {
                $html .= "<td>$row[$key]</td>";
            }
            $html .= "</tr>\n";
            // fetch next row
            $row = $result->fetch_array(MYSQLI_ASSOC);
        }
    } else
        $html .= "<th>No results</th></tr>";

    $html .= "</tbody></table>";
    return $html;
}

// executes a query and turns it into a php array;
// if some problem is encountered, an empty array will be returned
// if $keyColumnName is set, an associative array will be returned keyed by the values form this column;
// otherwise, a regular array will be returned
function getQueryResultAsArray($mysqli, $query, $keyColumnName = null) {
    $res = array();

    $result = mysqli_query($mysqli, $query);
    if ($result) {
        while($row = $result->fetch_array(MYSQLI_ASSOC))
            if ($keyColumnName != null) {
                $res[$row[$keyColumnName]] = $row;
            } else
                $res[] = $row;
    } else
        logError("Error executing the query: "
            . mysqli_error($mysqli) . "<br/>\n"
            . "Query: " . $query . "<br/>\n", "(not available)");

    return $res;
}

function getQueryResultAsJSON($mysqli, $query, $keyColumnName = null) {
    return json_encode(getQueryResultAsArray($mysqli, $query, $keyColumnName));
}

// takes a query and produces a downloadable CVS file
function queryResultAsCSVFile($mysqli, $query) {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="export.csv"');
    header('Pragma: no-cache');
    header('Expires: 0');

    writeQueryResultToCSVFile($mysqli, $query, 'php://output');
}

function writeQueryResultToCSVFile($mysqli, $query, $fname) {
    $result = mysqli_query($mysqli, $query);
    if (!$result) {
        return ("Error executing the query: "
            . mysqli_error($mysqli) . "<br/>\n"
            . "Query: " . $query . "<br/>\n");
    }

    $headers = array();
    $finfo = mysqli_fetch_fields($result);
    foreach ($finfo as $val) {
        $headers[] = $val->name;
    }
    $fp = fopen($fname, 'w');
    if ($fp && $result)
    {
        fputcsv($fp, $headers);
        while ($row = mysqli_fetch_row($result))
        {
            fputcsv($fp, array_values($row));
        }
    }
    return "OK";
}


/***************************************
 *****  OTHER **********
 ****************************************/



// generate a random floating point number
function randomFloat($min = 0, $max = 1) {
    return $min + mt_rand() / mt_getrandmax() * ($max - $min);
}

// turn an array of associative arrays into an associative array of associative arrays
function toAssociativeArray($arrayOfAssociativeArrays, $keyName) {
    $res = array();
    foreach ($arrayOfAssociativeArrays as $a)
        $res[$a[$keyName]] = $a;
    return $res;
}

// simple check to see if we are running on localhost
function isRunningOnLocalhost() {
    return $_SERVER['SERVER_NAME'] == "localhost"
        || endsWith($_SERVER['SERVER_NAME'], ".local")
        || startsWith($_SERVER['SERVER_NAME'], "192.168")
        || 0 === strpos($_SERVER['SERVER_NAME'], 'PhpStorm'); // if using built-in server with PhpStorm
}

// returns the position of the first digit in a string (or false if no digit is present)
function getPositionOfFirstDigit($text){
    preg_match('/^\D*(?=\d)/', $text, $m);
    return isset($m[0]) ? strlen($m[0]) : false;
}

function startsWith($haystack, $needle) {
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle) {
    $length = strlen($needle);

    return $length === 0 ||
    (substr($haystack, -$length) === $needle);
}