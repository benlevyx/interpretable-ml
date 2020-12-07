<?php
require_once(__DIR__ . "/../php/utils.php");

/*
 * Config file for testing the survey infrastructure on a local machine
 */

define('DEBUG', 1);
define('TEST_NAME', "Test");
define('ADMIN_EMAIL', 'kgajos@eecs.harvard.edu');
define('DATABASE', "test");

// connect to local database for testing
$mysqli = mysqli_init();
$success = mysqli_real_connect($mysqli, "127.0.0.1", "root", "root", DATABASE, 8889,'localhost:/Applications/MAMP/tmp/mysql/mysql.sock') or die('Could not connect!');

