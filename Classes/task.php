<?php

include 'phase.php';

class Task extends Phase {
    
    public $number;
    public $name;
    public $description;   

    public function __construct($Number, $Name, $Description) {
        $this->number = $Number;
        $this->name = $Name; 
        $this->description = $Description;       
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
        
    public static function getAllTasksForPhase($PhaseId){
        // gets all Tasks for a Phase
        $con = self::getConnection();
        
        $tasks = array();
        
        $get_all_tasks_for_phase_query = "SELECT * FROM Task WHERE PhaseId = '".$PhaseId."'";
        
		$get_all_tasks_for_phase_result = mysql_query($get_all_tasks_for_phase_query);

		if (!$get_all_tasks_for_phase_result) {
	    	echo "Could not successfully run query ($get_all_tasks_for_phase_query) from DB: " . mysql_error();
		}

        
		while($row = mysql_fetch_array($get_all_tasks_for_phase_result)) {
    		
    		$task = array();
    		$task['id'] = $row['Id'];   
    		$task['number'] = $row['Number'];    		
            $task['name'] = $row['Name'];    
            $task['description'] = $row['Description'];		    		
			
			array_push($tasks, $task);
		}
		
		mysql_close($con);
		
		$tasks = json_encode($tasks);
		
		return $tasks;        
        
    }
    
    
    public function createTaskForPhase($PhaseId){
        // insert a new Task into the db
    
        
        $con = self::getConnection();
        
        
        $insert_task_query = "INSERT INTO `Task` VALUES(";
        $insert_task_query .= "NULL,";
        $insert_task_query .= "".$PhaseId.",";
        $insert_task_query .= "".$this->number.",";
        $insert_task_query .= "'".$this->name."',";
        $insert_task_query .= "'".$this->description."'";        
        $insert_task_query .= ")";     
        
        
        $new_task_result = mysql_query($insert_task_query);
        
		if (!$new_task_result) {
	    	echo "Could not successfully run query ($insert_task_query) from DB: " . mysql_error();
		}        
		
		mysql_close($con);
    }
    
    
    }
?>