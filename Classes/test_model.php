<?php

class Test_Model {

	public $course_type;
	public $length;
	public $num_questions_from_category = array();
	public $requiredEOs = array();
	public $variant;
	public $testID;
	public $modelName;
	public $modelId;
		
	
	public function __get($name) {
		return $this->$name;
	}
	
	public function __set($name, $value) {
		$this->$name = $value;
	} 
	
	function __construct($vnt, $cType, $len, $num_q_cArr, $rqdEOs, $modelNm, $mId){
			
		$this->course_type = $cType;
		$this->length = $len;
		$this->num_questions_from_spo = $num_q_cArr;
		$this->requiredEOs = $rqdEOs;
		$this->variant = $vnt;
		$this->modelName = $modelNm;
		$this->modelId = $mId;

	}
	
	private static function getConnection(){

        include 'XJTestDBConnect.php';

		$con = mysql_connect( $host, $usn, $password);		

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		return $con;
	
	}	
	
	//deprecated	
	//returns an unsaved model for a daily quiz
	/*public static function modelForDailyQuiz($systems_array){
		$model = new self(NULL, NULL, NULL, NULL, NULL, NULL);
		$model->course_type = "DQUIZ";
		
		//set all systems to zero questions and then fill in as needed after querying the database for the desired systems in the quiz
		$model->num_questions_from_category['air_condition'] = 0;
		$model->num_questions_from_category['acft_gen'] = 0;
		$model->num_questions_from_category['apu'] = 0;
		$model->num_questions_from_category['autopilot'] = 0;
		$model->num_questions_from_category['crew_awareness'] = 0;
		$model->num_questions_from_category['elec'] = 0;
		$model->num_questions_from_category['emerg_equip'] = 0;
		$model->num_questions_from_category['fire_prot'] = 0;
		$model->num_questions_from_category['flt_control'] = 0;
		$model->num_questions_from_category['fuel'] = 0;
		$model->num_questions_from_category['hydraulics'] = 0;
		$model->num_questions_from_category['ice_rain_prot'] = 0;
		$model->num_questions_from_category['ldg_gear_brk'] = 0;
		$model->num_questions_from_category['ldg_gear_brk'] = 0;
		$model->num_questions_from_category['lighting'] = 0;
		$model->num_questions_from_category['limitations'] = 0;
		$model->num_questions_from_category['oxy'] = 0;
		$model->num_questions_from_category['performance'] = 0;
		$model->num_questions_from_category['pneum'] = 0;
		$model->num_questions_from_category['powerplant'] = 0;
		$model->num_questions_from_category['pressurization'] = 0;
		$model->num_questions_from_category['profiles'] = 0;
		$model->num_questions_from_category['radar'] = 0;
		$model->num_questions_from_category['stall_prot'] = 0;
		$model->num_questions_from_category['mandatory'] = 0;
		

		$questionQuantity = array();
		$length = 0;

		$con = self::getConnection();        

		foreach($systems_array as $system){
			$questionQuantity[$system] = $qRow['COUNT(subcategory)'];
			$length += $qRow['COUNT(subcategory)'];
			$model->num_questions_from_category[$system] = $qRow['COUNT(subcategory)'];
		}
		
    	$model->length = $length;
		
		mysql_close($con);        
        return $model;
	}*/
	
	//deprecated
	/*
		public static function modelForType($type) {
	 	//echo "modelFromID".$id."";
        $model = new self(NULL, NULL, NULL, NULL, NULL, NULL, NULL);
        
		$con = self::getConnection();        
        
        $fetchModelQuery = "SELECT * FROM `test_model` WHERE `course_type` = '".$type."'";
        $fetchModelResult = mysql_query($fetchModelQuery);
        
        if(!$fetchModelResult){
			echo "Couldn't run query $fetchModelQuery ".mysql_error();
        }
        

        while($row = mysql_fetch_array($fetchModelResult)){
	        $model->testID = $row['testID'];
        	$model->course_type = $row['course_type'];
        	$model->length = $row['length'];
			$model->num_questions_from_category['air_condition'] = $row['air_condition'];
			$model->num_questions_from_category['acft_gen'] = $row['acft_gen'];
			$model->num_questions_from_category['apu'] = $row['apu'];
			$model->num_questions_from_category['autopilot'] = $row['autopilot'];
			$model->num_questions_from_category['crew_awareness'] = $row['crew_awareness'];
			$model->num_questions_from_category['elec'] = $row['elec'];
			$model->num_questions_from_category['emerg_equip'] = $row['emerg_equip'];
			$model->num_questions_from_category['fire_prot'] = $row['fire_prot'];
			$model->num_questions_from_category['flt_control'] = $row['flt_control'];
			$model->num_questions_from_category['fuel'] = $row['fuel'];
			$model->num_questions_from_category['hydraulics'] = $row['hydraulics'];
			$model->num_questions_from_category['ice_rain_prot'] = $row['ice_rain_prot'];
			$model->num_questions_from_category['ldg_gear_brk'] = $row['ldg_gear_brk'];
			$model->num_questions_from_category['ldg_gear_brk'] = $row['ldg_gear_brk'];
			$model->num_questions_from_category['lighting'] = $row['lighting'];
			$model->num_questions_from_category['limitations'] = $row['limitations'];
			$model->num_questions_from_category['oxy'] = $row['oxy'];
			$model->num_questions_from_category['performance'] = $row['performance'];
			$model->num_questions_from_category['pneum'] = $row['pneum'];
			$model->num_questions_from_category['powerplant'] = $row['powerplant'];
			$model->num_questions_from_category['pressurization'] = $row['pressurization'];
			$model->num_questions_from_category['profiles'] = $row['profiles'];
			$model->num_questions_from_category['radar'] = $row['radar'];
			$model->num_questions_from_category['stall_prot'] = $row['stall_prot'];
			$model->num_questions_from_category['mandatory'] = $row['mandatory'];

	     }
	     
        mysql_close($con);

        return $model;
		
	}
		*/

	//virtual constructor to retrieve test model by ID.	
	public static function modelWithID($test_model_id){
		
		$model = new self(NULL, NULL, NULL, NULL, NULL, NULL, NULL);
		
        include 'XJTestDBConnect.php';
        $con = mysql_connect($host, $usn, $password);
        
        mysql_select_db($database, $con);
        
        
        $fetchModelQuery = "SELECT * FROM `testModel` WHERE `test_model_id` = '".$test_model_id."'";
        
        
        $fetchModelResult = mysql_query($fetchModelQuery);
        
        if(!$fetchModelResult){
        	die("could not run query ($fetchModelQuery) ".mysql_error());
        }
        
		$model->testID = $test_model_id;
		
		while($row = mysql_fetch_array($fetchModelResult)){
			$model->modelId = $row['test_model_id'];
			$model->course_type = $row['course_type'];
			$model->length = $row['test_length'];
			$model->variant = $row['variant_id'];
			if($row['eo_id'] === NULL) {
				$model->num_questions_from_category[$row['spo_id']] = $row['count'];
			}
			if($row['count'] === NULL){
				$model->requiredEOs[$row['eo_id']] = $row['spo_id'];				
			}
			

		}
        
        mysql_close($con);
        
		return $model;        
        		
	}
		
	public function create_new_model(){

		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);
		if (!$con){
		  die('Could not connect: ' . mysql_error());
		}
		
		mysql_select_db($database, $con);			
	
		//generate random identifier for new model
		$length = 6;
		$randstr = "";
	      for($i=0; $i<$length; $i++){
	         $randnum = mt_rand(0,61);
	         if($randnum < 10){
	            $randstr .= chr($randnum+48);
	         }else if($randnum < 36){
	            $randstr .= chr($randnum+55);
	         }else{
	            $randstr .= chr($randnum+61);
	         }
	      }
	      
	     $modelNm = mysql_escape_string($this->modelName);
	     
	      
	    $model_identifier = $randstr;
		
		$insertNewModelQuery = "INSERT INTO `testModel` (test_model_id, variant_id, spo_id, count, eo_id, course_type, test_length, name) ";
		$insertNewModelQuery .= "VALUES ";

		$last_key = end(array_keys($this->num_questions_from_spo));

		foreach($this->num_questions_from_spo as $k => $v){		
			$insertNewModelQuery .= "('".$model_identifier."',";
			$insertNewModelQuery .= "".$this->variant.",";			
			$insertNewModelQuery .= "".$v['id'].",";
			$insertNewModelQuery .= "".$v['count'].",";
			$insertNewModelQuery .= "NULL,";
			$insertNewModelQuery .= "'".$this->course_type."', ";		
			$insertNewModelQuery .= "".$this->length.", ";	
			$insertNewModelQuery .= "'{$modelNm}'";

			
		 if($k == $last_key){
			$insertNewModelQuery .= ")";			  
		  }			
		  else {
			$insertNewModelQuery .= "),";			  
		  }
						
		}


		$insertNewModelQueryResult = mysql_query($insertNewModelQuery);
		if(!$insertNewModelQueryResult){
			die("could not run SPO insertion query ($insertNewModelQuery) ".mysql_error());
		}
		
		
		$insertMandatoryEOsInModelQuery = "INSERT INTO `testModel` (test_model_id, variant_id, spo_id, count, eo_id, course_type, test_length, name) ";
		$insertMandatoryEOsInModelQuery .= "VALUES ";
		
		$last_EO_key = end(array_keys($this->requiredEOs));
		foreach($this->requiredEOs as $k => $v){		
			$insertMandatoryEOsInModelQuery .= "('".$model_identifier."',";
			$insertMandatoryEOsInModelQuery .= "".$this->variant.",";			
			$insertMandatoryEOsInModelQuery .= "".$v['parentSpo'].",";
			$insertMandatoryEOsInModelQuery .= "NULL,";
			$insertMandatoryEOsInModelQuery .= "".$v['eo'].",";
			$insertMandatoryEOsInModelQuery .= "'".$this->course_type."',";		
			$insertMandatoryEOsInModelQuery .= "".$this->length.", ";	
			$insertMandatoryEOsInModelQuery .= "'{$modelNm}'";

			
		 if($k == $last_EO_key){
			$insertMandatoryEOsInModelQuery .= ")";			  
		  }			
		  else {
			$insertMandatoryEOsInModelQuery .= "),";			  
		  }
						
		}
		
		$insertMandatoryEOsInModelQueryResult = mysql_query($insertMandatoryEOsInModelQuery);
		if(!$insertMandatoryEOsInModelQueryResult){
			die("could not run EO insertion query ($insertMandatoryEOsInModelQuery) ".mysql_error());
		}
		
		
		mysql_close($con);
		
	}
	
	static function showModeledTestsFromType($variant, $course_type){
		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		
		$modelQuery = "SELECT `test_model_id`, ";
		$modelQuery .= "`spo_name` as spo, ";
		$modelQuery .= "`count`, `name` ";
		$modelQuery .= "FROM `testModel` ";
		$modelQuery .= "JOIN `SPO` USING (`spo_id`) ";
		$modelQuery .= "WHERE `variant_id` = ".$variant." ";
		$modelQuery .= "AND `course_type` = '".$course_type."' ";
		$modelQuery .= "AND `count` IS NOT NULL";
		
		
		$modelQueryResult = mysql_query($modelQuery);
		if(!$modelQueryResult){
			die("could not run query ($modelQuery) ".mysql_error());
		}

		$models = array();
		$current_name = "";
       

        $model = array();        
		$i = 0;        
        while($row = mysql_fetch_array($modelQueryResult)){
        
				        


			
			if ($current_name == $row['name']){
				
				if($row['count'] > 0) {
    				$model[$row['spo']] = $row['count'];
    				$model['test_model_id'] = $row['test_model_id'];
                }				
			}

			else {
				//push current array to $models
				if($current_name != ""){
					//if the current_id is null, this is the first model to add to the models array
					$models[$current_name] = $model;
				}
				//start new array
				unset($model);
				$current_name = $row['name'];
								
				//set the first item in the array
				if($row['count'] > 0){
    				$model[$row['spo']] = $row['count'];
    				$model['test_model_id'] = $row['test_model_id'];        				
                }    				
			}		
			

	
	  	}      
	  	
	 	$models[$current_name] = $model;
	 		 		 	 	
	  	$models = json_encode($models);
	  	
	  	return $models;
		
		mysql_close($con);
		
	}
	
	static function removeModelWithID($test_model_id) {
		$totalModels = array();
		
		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);

		mysql_select_db($database, $con);
		
		
		$deleteModelQuery = "DELETE FROM `testModel` WHERE `test_model_id` = '".$test_model_id."'";
		
		$deleteModelResult = mysql_query($deleteModelQuery);
		
		if(!$deleteModelResult){
			echo "could not run query ($deleteModelQuery) ".mysql_error();
		}
		
		$totalModelsQuery = "SELECT COUNT(DISTINCT(test_model_id)) AS models FROM `testModel`";
		$totalModelsResult = mysql_query($totalModelsQuery);
		
		while($row = mysql_fetch_array($totalModelsResult)){
			$totalModels['totalModels'] = $row['models'];
		}
		

		mysql_close($con);
		$totalModels = json_encode($totalModels);
		return $totalModels;
		
	}
	
	public static function getQuestionQuantityForSPO($variant){
				
		$questionQuantity = array();
		
		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		
		$getQuantityQuery = "SELECT questions.spo_id, spo_name AS spo, count(questions.spo_id) AS count FROM questions INNER JOIN SPO using (spo_id) WHERE questions.variant_id = ".$variant." GROUP BY spo_id";		
		
		
		$getQuantityQueryResult = mysql_query($getQuantityQuery);
		
		
		if(!$getQuantityQueryResult){
			die("could not run query ($getQuantityQuery) ".mysql_error());
		}
		while($qRow = mysql_fetch_array($getQuantityQueryResult)){
			
			$spo_info = array();
			$spo_info['spo_id'] = $qRow['spo_id'];
			$spo_info['spo'] = $qRow['spo'];
			$spo_info['count'] = $qRow['count'];
			
			array_push($questionQuantity, $spo_info);			
		}
				
		$questionQuantity = json_encode($questionQuantity);
		
		mysql_close($con);
		
		return $questionQuantity;		
	}
	
	//deprecated
	/*public static function getCurrentQuestionQuantity(){
		
		$systems = array('air_condition', 'acft_gen','apu', 'autopilot','crew_awareness', 'elec', 'emerg_equip', 'fire_prot', 'flt_control', 'fuel', 'hydraulics',  'ice_rain_prot',  'ldg_gear_brk', 'ldg_gear_brk', 'lighting','limitations', 'oxy', 'performance', 'pneum', 'powerplant', 'pressurization', 'profiles',  'radar', 'stall_prot', 'mandatory');

		$questionQuantity = array();
		
		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		
		foreach($systems as $system){
			
			$getQuantity = "SELECT COUNT(subcategory) FROM questions WHERE subcategory = '".$system."'";

			$qResult = mysql_query($getQuantity);
			if(!$qResult){
				die("could not run query ($getQuantity) ".mysql_error());
			}
			while($qRow = mysql_fetch_array($qResult)){
				$questionQuantity[$system] = $qRow['COUNT(subcategory)'];
			}
		}
		
		$questionQuantity = json_encode($questionQuantity);
		return $questionQuantity;

		mysql_close($con);
		
	}*/
	
	public static function getSPOForModeling(){
		$spo = array();

		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		
		//get SPOs
		$getSPOquery = "SELECT `spo_name` from `SPO`";
		$getSPOResult = mysql_query($getSPOquery);
		if(!$getSPOResult){
			die("could not run query ($getSPOquery) ".mysql_error());
		}
		while($row = mysql_fetch_array($getSPOResult)){
			array_push($spo, $row["spo_name"]);
		}
		
		mysql_close($con);
		$totalModels = json_encode($totalModels);
		$spo = json_encode($spo);
		return $spo;
		
	}

}

?>