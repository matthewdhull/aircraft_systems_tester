<?php


class Blooms {
    
    
    public $ordinality;    
    public $level;
    

	function __get($name) {
		return $this->$name;
	}
	
	function __set($name, $value) {
		$this->$name = $value;
	} 
	
    public function __construct($Ordinality, $Level) {
        $this->ordinality = $Ordinality;
        $this->level = $Level;        
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
        
    public function getAllLevels(){
       $con = self::getConnection();
        
        $levels = array();
        
        $get_all_levels_query = "SELECT DISTINCT `ordinality`, `level` FROM `blooms_taxonomy`";
        
		$get_all_levels_result = mysql_query($get_all_levels_query);

		if (!$get_all_levels_result) {
	    	echo "Could not successfully run query ($get_all_levels_result) from DB: " . mysql_error();
		}

        
		while($row = mysql_fetch_array($get_all_levels_result)) {
    		
			$level = array();
			$level['ordinality'] = $row['ordinality'];
			$level['level'] = ucfirst($row['level']);

			array_push($levels, $level);
		}
		
		mysql_close($con);
		
		$levels = json_encode($levels);
		
		return $levels;              
    }    
    
    public function getKeyVerbsForLevel($ordinality) {
       $con = self::getConnection();
        
        $verbs = array();
        
        $get_verbs_query = "SELECT `id`, `key_verb` FROM `blooms_taxonomy` WHERE `ordinality` = ".$ordinality." ORDER BY `key_verb` ASC";
        

		$get_verbs_result = mysql_query($get_verbs_query);

		if (!$get_verbs_result) {
	    	echo "Could not successfully run query ($get_verbs_query) from DB: " . mysql_error();
		}

        
		while($row = mysql_fetch_array($get_verbs_result)) {
    		$verb = array();
			$verb['id'] = $row['id'];
			$verb['key_verb'] = ucfirst($row['key_verb']);
			array_push($verbs, $verb);
		}
		
		mysql_close($con);
		
		$verbs = json_encode($verbs);
		
		return $verbs;          
    }
    
    
    }
?>