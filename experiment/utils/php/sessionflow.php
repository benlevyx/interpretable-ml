<?php
/**
 * Created by PhpStorm.
 * User: kgajos
 * Date: 11/10/15
 * Time: 1:35 PM
 */

// make sure that all the right tables exist in the database
ensureTable("sessions", "CREATE TABLE `sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id_in_sessions` int(11) DEFAULT NULL,
  `first_activity_id` int(11) DEFAULT NULL,
  `last_activity_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `participant_id_in_sessions` (`participant_id_in_sessions`)
);");

ensureTable("session_activities", "CREATE TABLE `session_activities` (
  `activity_id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id_in_activities` int(11) NOT NULL,
  `activity_number` int(11) NOT NULL,
  `activity_stage` varchar(100) NOT NULL DEFAULT '',
  `activity_code` varchar(100) NOT NULL,
  `activity_data` text,
  `client_activity_start_time` double NOT NULL,
  `time_stamp_in_activities` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_id`),
  KEY `session_id_in_activities` (`session_id_in_activities`),
  KEY `activity_code` (`activity_code`),
  KEY `activity_stage` (`activity_stage`)
);");

// process the HTTP request
sessionFlowRequest($mysqli);

/*
 * The main function
 */
function sessionFlowRequest($mysqli)
{
    if (isset($_REQUEST["requests"])) {
        $data = json_decode($_REQUEST["requests"], true);

        foreach ($data as $request) {
            if (isset($request['action'])) {
                $action = $request['action'];
                if ($action == "start") {
                    echo sessionFlowStart($mysqli);
                } else if ($action == "setParticipantID") {
                    $sessionID = $request['sessionID'];
                    $participantID = $request['participantID'];
                    echo sessionFlowSetParticipantID($mysqli, $sessionID, $participantID);
                } else if ($action == "recordActivity") {
                    $sessionID = $request['sessionID'];
                    $clientStartTime = $request['clientStartTime'];
                    $activityNumber = $request['activityNumber'];
                    $activityStage = $request['activityStage'];
                    $activityCode = $request['activityCode'];
                    $activityData = $request['activityData'];
                    if (isset($request['firstActivity']))
                        $firstActivity = $request['firstActivity'];
                    else
                        $firstActivity = false;
                    echo sessionFlowActivity($mysqli, $sessionID, $clientStartTime, $activityNumber, $activityStage, $activityCode, $activityData, $firstActivity);
                }
            }
        }
    } else if (isset($_REQUEST["report"]))
        report($mysqli);
}

/*
 * record a new session
 */
function sessionFlowStart($mysqli) {
    $query = "insert into sessions () VALUES ();";
    $result = mysqli_query($mysqli, $query);

    // catch errors
    if (!$result) {
        logError(("Failed: Cannot record session start! MySQL said: " . mysqli_error($mysqli)), -1);
        //echo $query . "<br/>\n";
        //echo "Failed: Cannot record session start! MySQL said: " . mysqli_error($mysqli);
    } else {
        // get the session_id
        return mysqli_insert_id($mysqli);
    }
    return -1;
}

/*
 * Call this if you want to start a session on server side (by embedding this in your index.php file)
 * rather than by initiating session start from client side JavaScript;
 * Make sure to place a call to this function after you've included jQuery
 */
function embeddedSessionFlowStart() {
    global $mysqli;
    $sessionID = sessionFlowStart($mysqli);
    define("SESSIONID", $sessionID);
    ?>
    <script>
        $(function() {sessionFlow.setSessionID(<?php echo $sessionID ?>)});
    </script>
    <?php
    return $sessionID;
}

/*
 * Update session info once participant_id has been set for this participant
 */
function sessionFlowSetParticipantID($mysqli, $sessionID, $participantID) {
    $query = "UPDATE sessions SET `participant_id_in_sessions` = "
        .  mysqli_real_escape_string($mysqli, $participantID)
        . " WHERE `session_id` = " . mysqli_real_escape_string($mysqli, $sessionID);
    $result = mysqli_query($mysqli, $query);
    // catch errors
    if (!$result) {
        logError(("Failed: Cannot set participant_id for sessionflow . " . $sessionID . "! MySQL said: "
            . mysqli_error($mysqli)), -1);
    }
    return "OK";
}

/*
 * Record an activity
 */
function sessionFlowActivity($mysqli, $sessionID, $clientStartTime, $activityNumber, $activityStage, $activityCode, $activityData, $firstActivity) {
    $sessionID = mysqli_real_escape_string($mysqli, $sessionID);
    $activityCode = mysqli_real_escape_string($mysqli, $activityCode);
    $clientStartTime = mysqli_real_escape_string($mysqli, $clientStartTime);
    $result = insert("session_activities",
        array("session_id_in_activities",
            "activity_number", "activity_stage", "activity_code", "activity_data",
            "client_activity_start_time"),
        array($sessionID,
            mysqli_real_escape_string($mysqli, $activityNumber),
            mysqli_real_escape_string($mysqli, $activityStage),
            $activityCode,
            mysqli_real_escape_string($mysqli, $activityData),
            $clientStartTime));
    if (!$result) {
        logError(("Failed: Cannot record session flow activity for session . " . $sessionID . "! MySQL said: "
            . mysqli_error($mysqli)), -1);
    }
    $activityID = mysqli_insert_id($mysqli);

    // update the last_activity_code and client_end_time fields for this session
    $query = "UPDATE sessions SET `last_activity_id` = " . $activityID;
    if ($firstActivity)
        $query = $query . ", `first_activity_id` = " . $activityID;
    $query = $query . " WHERE `session_id` = " . mysqli_real_escape_string($mysqli, $sessionID);
    //echo "First activity: " . $firstActivity . "<br/>\n";
    //echo $query . "<br/>\n";
    $result = mysqli_query($mysqli, $query);
    // catch errors
    if (!$result) {
        logError(("Failed: Cannot update session info for session . " . $sessionID . "! MySQL said: "
            . mysqli_error($mysqli)), -1);
    }
    return "OK";
}

function report($mysqli)
{
    $query1 = "SELECT activity_stage, count(*) AS count FROM session_activities "
        . "WHERE activity_code = 'page_view' "
        . " AND `session_activities`.`time_stamp_in_activities` > (curdate() - interval 30 day) "
        . "GROUP BY activity_stage ORDER BY count DESC";
    $results1 = mysqli_query($mysqli, $query1);

    $query2 = "select session_activities.activity_stage as activity_stage, count(*) as count "
        . "from sessions, session_activities "
        . "where sessions.`last_activity_id` = `session_activities`.`activity_id` "
        . " AND `session_activities`.`time_stamp_in_activities` > (curdate() - interval 30 day) "
        . "GROUP BY activity_stage order by count desc";
    $results2 = mysqli_query($mysqli, $query2);

    $query3 = "select session_activities.activity_stage as activity_stage, `session_activities`.`activity_code` as activity_code, count(*) as count from session_activities where `session_activities`.`time_stamp_in_activities` > (curdate() - interval 30 day) GROUP BY activity_stage, activity_code order by activity_stage, count desc";
    $results3 = mysqli_query($mysqli, $query3);


    $html1 = getQueryResultAsHTML($mysqli, $query1,
        array("activity_stage" => "Page/Context",
            "count" => "Number of people who reached it"));
    $html2 = getQueryResultAsHTML($mysqli, $query2,
        array("activity_stage" => "Page/Context",
            "count" => "Number of people who dropped out there"));
    $html3 = getQueryResultAsHTML($mysqli, $query3,
        array("activity_stage" => "Page/Context",
            "activity_code" => "Activity",
            "count" => "Number of actions recorded"));

    $graphQueryHelper = "";
    global $activityStatesToVisualize;
    foreach($activityStatesToVisualize as $activity) {
        if ($graphQueryHelper != "") $graphQueryHelper .= ", ";
        $graphQueryHelper .= "sum(CASE activity_stage WHEN \"$activity\" THEN 1 ELSE 0 END) AS \"$activity\" ";
    }
    $graphQuery = "SELECT date(time_stamp_in_activities) AS date, "
        . $graphQueryHelper
        . "FROM `session_activities`
WHERE `session_activities`.`time_stamp_in_activities` > (curdate() - INTERVAL 30 DAY)
AND activity_code = \"page_view\"
GROUP BY date";
    $graphDataJSON = getQueryResultAsJSON($mysqli, $graphQuery);

    ?>
    <html>
    <head><title>Session flow - <?php echo TEST_NAME ?></title>
        <script src="../utils/external/jquery-2.2.1.min.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css"/>
        <script src="../utils/external/d3/d3.min.js"></script>
        <style>

            body {
                font: 10px sans-serif;
            }

            .axis path,
            .axis line {
                fill: none;
                stroke: #000;
                shape-rendering: crispEdges;
            }

            .tick line{
                opacity: 0.2;
            }

            .line {
                fill: none;
                stroke: steelblue;
                stroke-width: 1.5px;
            }

        </style>
    </head>
<body>

    <div id="chart"></div>
    <script>
        var data = JSON.parse('<?php echo $graphDataJSON ?>');

        var margin = {top: 20, right: 80, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%Y-%m-%d").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
            .outerTickSize(0)
            .tickPadding(10);

        var line = d3.svg.line()
            .interpolate("linear")
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.temperature); });

        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

        data.forEach(function(d) {
            d.date = parseDate(d.date);
        });

        var cities = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {date: d.date, temperature: +d[name]};
                })
            };
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));

        y.domain([
            0, d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Daily count");

        var city = svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
            .attr("class", "city");

        city.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); });

        city.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

    </script>

    <h1><?php echo TEST_NAME ?>: Experiment flow stats for the past 30 days</h1>
    <p>The tables below show the same data, but in different ways.</p>

    <h2>Number of people who reached different stages of the experiment</h2>
    <?php echo $html1 ?>

    <h2>Places where people drop out/leave</h2>
    <p>If they leave on #results_page, it means that they completed the whole experiment.</p>
    <?php echo $html2 ?>

    <h2>Detailed log of activities</h2>
    <?php echo $html3 ?>

    <?php
}
?>