<?php


class Phase {

    public $number;    
    public $name;
    


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

    public function __construct($Number, $Name) {
        $this->number = $Number;
        $this->name = $Name;        
    }
    
    public function get($Id){
        // gets a phase for Id
    }
    
    public static function getAll(){
        // gets all phases
        $con = self::getConnection();
        
        $phases = array();
        
        $get_all_phases_query = "SELECT * from Phase";
        
		$get_all_phases_result = mysql_query($get_all_phases_query);

		if (!$get_all_phases_result) {
	    	echo "Could not successfully run query ($get_all_phases_query) from DB: " . mysql_error();
		}

        
		while($row = mysql_fetch_array($get_all_phases_result)) {
    		
    		$phase = array();
    		$phase['id'] = $row['Id'];
    		$phase['number'] = $row['Number'];    		
            $phase['name'] = $row['Name'];    		    		
			
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
        $insert_phase_query .= "'".$this->name."'";
        $insert_phase_query .= ")";     
        
        $new_phase_result = mysql_query($insert_phase_query);
        
		if (!$new_phase_result) {
	    	echo "Could not successfully run query ($insert_phase_query) from DB: " . mysql_error();
		}        
		
		mysql_close($con);
    }
    
    public function update($Id){
        // update a phase for an id
    }
    
    public function destroy($Id){
        // delete a phase for an id
        
    }
    
    }
?>