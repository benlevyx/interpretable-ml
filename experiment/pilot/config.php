<?php

require_once(__DIR__ . "/../utils/php/utils.php");

define('DEBUG', 0);

// the mySQL host -- if you are running on labinthewild server, leave as is
define('DATABASE_HOST', '127.0.0.1');

// TODO fill out the values below
define('TEST_NAME', "carPrice");
define('DATABASE', 'iaiml');
define('DB_USER', 'user');
define('DB_PASS', 'password'); // database password
define('ADMIN_EMAIL', 'zilinma@g.harvard.edu'); // email of the person who should receive notifications of errors

// connect to database -- if the code is running on localhost, it will connect to database on localhost using root/root for user name and password
// otherwise, it will connect to the production database using information specified above
$mysqli = mysqli_init();
if (isRunningOnLocalhost()) {
    // local connection
    $success = mysqli_real_connect($mysqli, "localhost", "root", "root", DATABASE) or die('Could not connect to localhost DB!');
} else {
    // connection on the production environment
    $success = mysqli_real_connect($mysqli, DATABASE_HOST, DB_USER, DB_PASS, DATABASE) or die('Could not connect to ' . DATABASE_HOST);
}

// make sure that timestamps mean the same thing regardless of where we host
mysqli_query($mysqli, "SET time_zone = 'US/Eastern'");

// TODO make sure to have correct SQL definitions for all your database tables. It will save you a lot of time as you move
// from developing on local host to production server.

ensureTable("participants", "CREATE TABLE `participants` (
  `participant_id` int(11) NOT NULL AUTO_INCREMENT,
  `retake` tinyint(1) DEFAULT NULL,
  `age` smallint(6) DEFAULT NULL,
  `gender` tinyint(4) DEFAULT NULL COMMENT '0=male, 1=female, 2=complicated',
  `education` varchar(20) DEFAULT NULL,
  `comp_usage` tinyint(4) DEFAULT NULL,
  `country_young` varchar(100) DEFAULT NULL,
  `country_now` varchar(100) DEFAULT NULL,
  `participant_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_agent` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`participant_id`),
  KEY `retake` (`retake`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

ensureTable("tasks", "CREATE TABLE `tasks` (
  `tasks_id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id` int(11) DEFAULT NULL,
  `confidence` int(11) DEFAULT NULL,
  `sequence` text DEFAULT NULL,
  `user_agent` text DEFAULT NULL, 
  `error` int(11) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  PRIMARY KEY (`tasks_id`),
  KEY `participant_id` (`participant_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;");

ensureTable("comments", "CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `participant_id_in_comments` int(11) NOT NULL,
  `general_comment` text,
  `cheatingBool` tinyint(4) DEFAULT NULL,
  `cheating` text,
  `technicalBool` tinyint(4) DEFAULT NULL,
  `technical` text,
  `comment_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `participant_id_in_comments` (`participant_id_in_comments`),
  KEY `cheatingBool` (`cheatingBool`),
  KEY `technicalBool` (`technicalBool`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;");