<?php

include 'subtask.php';

class Element extends Subtask {
    
    
    public function __construct ($Number, $Name, $Description){
        parent::__construct ($Number, $Name, $Description);
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

        
    public static function getAllElementsForSubtask($SubtaskId){
        // gets all Subtasks for a Task
        $con = self::getConnection();
        
        $elements = array();
        
        $get_all_elements_for_task_query = "SELECT * FROM Element WHERE SubtaskId = '".$SubtaskId."'";        
        
		$get_all_elements_for_subtask_result = mysql_query($get_all_elements_for_task_query);

		if (!$get_all_elements_for_subtask_result) {
	    	echo "Could not successfully run query ($get_all_elements_for_task_query) from DB: " . mysql_error();
		}

        
		while($row = mysql_fetch_array($get_all_elements_for_subtask_result)) {
    		
    		$element = array();
    		$element['id'] = $row['Id'];   
    		$element['number'] = $row['Number'];    		
            $element['name'] = $row['Name'];    
            $element['description'] = $row['Description'];		    		
			
			array_push($elements, $element);
		}
		
		mysql_close($con);
		
		$elements = json_encode($elements);
		
		return $elements;        
        
    }  
    
    public function createElementForSubtask($SubtaskId){
        // insert a new Subtask into the db
    
        
        $con = self::getConnection();
        
        
        $insert_element_query = "INSERT INTO `Element` VALUES(";
        $insert_element_query .= "NULL,";
        $insert_element_query .= "".$SubtaskId.",";
        $insert_element_query .= "".$this->number.",";
        $insert_element_query .= "'".$this->name."',";
        $insert_element_query .= "'".$this->description."'";        
        $insert_element_query .= ")";     
        
        
        $new_element_result = mysql_query($insert_element_query);
        
		if (!$new_element_result) {
	    	echo "Could not successfully run query ($insert_element_query) from DB: " . mysql_error();
		}        
		
		mysql_close($con);
    }
    
    public function update($Id){

		$con = self::getConnection();		
            

        $updateElementQuery = "UPDATE `Element` SET `Number` = ".$this->number.", `Name` = '".$this->name."', `Description` = '".$this->description."' WHERE `Id` =  ".$Id."";

		
		$updateElementResult = mysql_query($updateElementQuery);
		
		if(!$updateElementResult) {
			die ("Could not update question with: ($updateElementQuery) from DB: " . mysql_error());
		}

        mysql_close($con);
    }    
    
    public function destroy($Id){

        // delete a phase for an id
		$con = self::getConnection();				
		
		$deleteQuery = "DELETE FROM `Element` where Id = ".$Id."";
		$deleteResult = mysql_query($deleteQuery);
		if(!$deleteResult){
			die("could not execute delete query ($deleteQuery) ".mysql_error());
		}
				
		mysql_close($con);        
        
    }
     
    
    }
?>