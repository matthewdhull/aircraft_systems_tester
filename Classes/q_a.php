<?php

//SUMMARY
// This script analyses all questions in the database against the Enabling Objectives
// A .csv file is generated containing the SPO, EO ID
//
//
//
//
//
		include 'XJTestDBConnect.php';
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);	
		
		$spo_names = Array();
		$final_arr = Array();
		$csv_arr = Array();
		
		$spo_name_query = "SELECT `spo_name` FROM `SPO`";
		$spo_name_result = mysql_query($spo_name_query);
		if(!$spo_name_result) {
			echo "no result from spo name query";
		}
		
		
		//populate list of spos by id
		while($row = mysql_fetch_array($spo_name_result)){
			array_push($spo_names, $row['spo_name']);
		}
		
		
		
		//iterate through list and populate array of element ids populate sub-arrays		
		foreach($spo_names as $spo){
			
			$eo_id_query = "SELECT DISTINCT EO.eo_id FROM EO, SPO WHERE EO.spo_id = SPO.spo_id AND SPO.spo_name = '".$spo."'"; 
			$eo_id_result = mysql_query($eo_id_query);
			
			if(!$eo_id_result){
				echo "no eo id result";
			}
			
			$eo_id_arr = Array();
			while($row = mysql_fetch_array($eo_id_result)){
				array_push($eo_id_arr, $row['eo_id']);
			}
			
			$final_arr[$spo] = $eo_id_arr;
			
			
		}
		
		//grab each spo_name
		foreach($final_arr as $spo_name => $eos){

			//grab all eo ids for the spo_name
			foreach($eos as $eo_id){
				$question_count_query = "SELECT `EO`.`element_name` AS 'element_name', COUNT(*) AS 'count' FROM `questions`, `EO` WHERE `questions`.`eo_id` = ".$eo_id." AND `questions`.`eo_id` = `EO`.`eo_id`";
				$question_count_result = mysql_query($question_count_query);
				if(!$question_count_result){
					echo "Could not get count for query ".error_log($question_count_query);
				}
				while($row=mysql_fetch_array($question_count_result)){
					$arr = Array();
					$arr['spo_name'] = $spo_name;
					$arr['element_name'] = $row['element_name'];
					$arr['count'] = $row['count'];
					array_push($csv_arr, $arr);
				}
				
			}

		}
		
		/*


		iterate through each sub array get count of questions per element
		generate csv
		| spo_name | element_name | count | 
		
		
		
		
		*/
		
		mysql_close($con);
		
		$data = $csv_arr;
		
		$fp = fopen('eo_question_analysis.csv', 'w');
		
		foreach ($data as $row) {
		    fputcsv($fp, $row);
		}
	
		fclose($fp);
		


?>