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

        $modelQuery .= "SELECT ";
        $modelQuery .= "tm.test_model_id, ";
        $modelQuery .= "CONCAT(UCASE(LEFT(bt.key_verb, 1)), SUBSTRING(bt.key_verb, 2),' ',s.Name) spo, ";
        $modelQuery .= "tm.count, ";
        $modelQuery .= "tm.name ";
        $modelQuery .= "FROM testModel tm ";
        $modelQuery .= "JOIN Subtask s ON tm.spo_id = s.Id ";
        $modelQuery .= "JOIN blooms_taxonomy bt ON bt.Id = s.bloomId ";
        $modelQuery .= "WHERE tm.variant_id = ".$variant." ";
        $modelQuery .= "AND tm.course_type = '".$course_type."' ";
        $modelQuery .= "AND tm.count > 0 ";
        $modelQuery .= "ORDER BY tm.name, ";
        $modelQuery .= "s.Number ASC";
		
		
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
				

    				$model[$row['spo']] = $row['count'];
    				$model['test_model_id'] = $row['test_model_id'];

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

    				$model[$row['spo']] = $row['count'];
    				$model['test_model_id'] = $row['test_model_id'];        				

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
	
    public static function getQuestionQuantityForSubtask(){
    				
    		$questionQuantity = array();
    		
    		include "XJTestDBConnect.php";
    		$con = mysql_connect($host,$usn, $password);
    
    		if (!$con){
    		  die('Could not connect: ' . mysql_error());
    		 }
    		
    		mysql_select_db($database, $con);

            $getQuantityQuery .= "SELECT q.subtask_id, ";
            $getQuantityQuery .= "s.Name AS subtask, ";
            $getQuantityQuery .= "COUNT(q.subtask_id) AS count ";
            $getQuantityQuery .= "FROM questions q ";
            $getQuantityQuery .= "JOIN Subtask s ON q.subtask_id = s.Id ";
            $getQuantityQuery .= "GROUP BY s.Id ";
    		
    		
    		$getQuantityQueryResult = mysql_query($getQuantityQuery);
    		
    		
    		if(!$getQuantityQueryResult){
    			die("could not run query ($getQuantityQuery) ".mysql_error());
    		}
    		while($qRow = mysql_fetch_array($getQuantityQueryResult)){
    			
    			$spo_info = array();
    			$spo_info['spo_id'] = $qRow['subtask_id'];
    			$spo_info['spo'] = $qRow['subtask'];
    			$spo_info['count'] = $qRow['count'];
    			
    			array_push($questionQuantity, $spo_info);			
    		}
    				
    		$questionQuantity = json_encode($questionQuantity);
    		
    		mysql_close($con);
    		
    		return $questionQuantity;		
    	}
	
	
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