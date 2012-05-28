<?php

session_start();
session_cache_limiter('nocache');

if(isset($_SESSION['name'])){

	$option = $_POST['option'];
	if($option == ""){
		$option = $_GET['option'];
	}
	
	

	if($option == "makeFile"){
		include "../Classes/ReportsClass.php";
		$orgSpec = $_POST['orgSpec'];
		$year = $_POST['year'];
		
		$data = array();
		
		$data = Reports::spoAnalysisForQuarter($orgSpec, $year);	
		$fp = fopen('quarterlySPO.csv', 'w');
		
		foreach ($data as $row) {
		    fputcsv($fp, $row);
		}
	
		fclose($fp);
	}
	elseif($option == "getFile"){
		header('Content-disposition: attachment; filename=quarterlySPO.csv');
		header('Content-type: text/csv');
		readfile("quarterlySPO.csv");
	}
}


?>