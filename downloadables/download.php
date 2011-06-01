<?php
/*
session_start();
session_cache_limiter("no-cache");
*/

include "../Classes/ReportsClass.php";

$data = array();

$data = Reports::cumulativeTestStats();

$fp = fopen('testStatistics.csv', 'w');

foreach ($data as $row) {
    fputcsv($fp, $row);
}

fclose($fp);

header('Content-disposition: attachment; filename=testStatistics.csv');
header('Content-type: text/csv');
readfile("testStatistics.csv");


?>