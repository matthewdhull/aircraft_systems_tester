<?php


class Phase {

    public $number;    
    public $name;
    public $key_verb_id;
    


	function __get($name) {
		return $this->$name;
	}
	
	function __set($name, $value) {
		$this->$name = $value;
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

    public function __construct($Number, $Name, $KeyVerbId) {
        $this->number = $Number;
        $this->name = $Name;        
        $this->key_verb_id = $KeyVerbId;
    }
    
    public function get($Id){
        // gets a phase for Id
    }
    
    public static function getAll(){
        // gets all phases
        $con = self::getConnection();
        
        $phases = array();
        
        $get_all_phases_query = "SELECT "; 
        $get_all_phases_query .= "p.Id,";
        $get_all_phases_query .= "p.Number,";
        $get_all_phases_query .= "p.Name,";
        $get_all_phases_query .= "p.bloomId,";
        $get_all_phases_query .= "b.ordinality ";
        $get_all_phases_query .= "FROM Phase p ";
        $get_all_phases_query .= "JOIN blooms_taxonomy b ON p.bloomId = b.Id";
        
		$get_all_phases_result = mysql_query($get_all_phases_query);

		if (!$get_all_phases_result) {
	    	echo "Could not successfully run query ($get_all_phases_query) from DB: " . mysql_error();
		}

        
		while($row = mysql_fetch_array($get_all_phases_result)) {
    		
    		$phase = array();
    		$phase['id'] = $row['Id'];
    		$phase['number'] = $row['Number'];    		
            $phase['name'] = $row['Name'];
            $phase['bloomId'] = $row['bloomId'];    
            $phase['ordinality'] = $row['ordinality'];		    		
			
			array_push($phases, $phase);
		}
		
		mysql_close($con);
		
		$phases = json_encode($phases);
		
		return $phases;        
        
    }
    
    public function create(){
        // insert a new phase into the db
        
        $con = self::getConnection();
        
        $insert_phase_query = "INSERT INTO `Phase` VALUES(";
        $insert_phase_query .= "NULL,";
        $insert_phase_query .= "".$this->number.",";
        $insert_phase_query .= "'".$this->name."',";
        $insert_phase_query .= "".$this->key_verb_id."";
        $insert_phase_query .= ")";     
        
        $new_phase_result = mysql_query($insert_phase_query);
        
		if (!$new_phase_result) {
	    	echo "Could not successfully run query ($insert_phase_query) from DB: " . mysql_error();
		}        
		
		mysql_close($con);
    }
    
    public function update($Id){

		$con = self::getConnection();		
            

        $updatePhaseQuery = "UPDATE `Phase` SET `Number` = ".$this->number.", `Name` = '".$this->name."', `bloomId` = ".$this->key_verb_id." WHERE `Id` =  ".$Id."";

		
		$updatePhaseResult = mysql_query($updatePhaseQuery);
		
		if(!$updatePhaseResult) {
			die ("Could not update question with: ($updatePhaseQuery) from DB: " . mysql_error());
		}

        mysql_close($con);
    }
    
    public function destroy($Id){

        // delete a phase for an id
		$con = self::getConnection();				
		
		$deleteQuery = "DELETE FROM `Phase` where Id = ".$Id."";
		$deleteResult = mysql_query($deleteQuery);
		if(!$deleteResult){
			die("could not execute delete query ($deleteQuery) ".mysql_error());
		}
				
		mysql_close($con);        
        
    }
    
    }
?>