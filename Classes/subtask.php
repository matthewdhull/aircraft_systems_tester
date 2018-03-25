<?php

include 'task.php';

class Subtask extends Task {
    
    
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
        
    public static function getAllSubtasksForTask($TaskId){        
        // gets all Subtasks for a Task
        $con = self::getConnection();
        
        $subtasks = array();
        
        $get_all_subtasks_for_task_query = "SELECT * FROM Subtask WHERE TaskId = '".$TaskId."'";
        
		$get_all_subtasks_for_task_result = mysql_query($get_all_subtasks_for_task_query);

		if (!$get_all_subtasks_for_task_result) {
	    	echo "Could not successfully run query ($get_all_subtasks_for_task_query) from DB: " . mysql_error();
		}

        
		while($row = mysql_fetch_array($get_all_subtasks_for_task_result)) {
    		
    		$subtask = array();
    		$subtask['id'] = $row['Id'];   
    		$subtask['number'] = $row['Number'];    		
            $subtask['name'] = $row['Name'];    
            $subtask['description'] = $row['Description'];		    		
			
			array_push($subtasks, $subtask);
		}
		
		mysql_close($con);
		
		$subtasks = json_encode($subtasks);
		
		return $subtasks;        
        
    }  
    
    public function createSubTaskForTask($TaskId){
        // insert a new Subtask into the db
    
        
        $con = self::getConnection();
        
        
        $insert_subtask_query = "INSERT INTO `Subtask` VALUES(";
        $insert_subtask_query .= "NULL,";
        $insert_subtask_query .= "".$TaskId.",";
        $insert_subtask_query .= "".$this->number.",";
        $insert_subtask_query .= "'".$this->name."',";
        $insert_subtask_query .= "'".$this->description."'";        
        $insert_subtask_query .= ")";     
        
        
        $new_subtask_result = mysql_query($insert_subtask_query);
        
		if (!$new_subtask_result) {
	    	echo "Could not successfully run query ($insert_subtask_query) from DB: " . mysql_error();
		}        
		
		mysql_close($con);
    }
    
    
    }
?>