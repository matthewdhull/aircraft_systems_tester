<?php

class Test_Model {
/*	table prototype
	create table test_model (
		testID int unsigned not null auto_increment primary key, 
		course_type char(25) not null, 
		length int unsigned not null, 
		air_condition int unsigned not null, 
		acft_gen int unsigned not null, 
		apu int unsigned not null, 
		autopilot int unsigned not null, 
		crew_awareness int unsigned not null, 
		elec int unsigned not null, 
		emerg_equip int unsigned not null, 
		fire_prot int unsigned not null, 
		flt_control int unsigned not null, 
		fuel int unsigned not null, 
		hydraulics int unsigned not null, 
		ice_rain_prot int unsigned not null, 
		ldg_gear_brk int unsigned not null, 
		lighting int unsigned not null, 
		limitations int unsigned not null, 
		oxy int unsigned not null, 
		performance int unsigned not null,
		pneum int unsigned not null, 
		powerplant int unsigned not null, 
		pressurization int unsigned not null, 
		profiles int unsigned not null, 
		radar int unsigned not null, 
		stall_prot int unsigned not null,
		mandatory int unsigned not null
	)
*/

	const AIR_CONDITION =  "air_condition";
	const ACFT_GEN = "acft_gen";
	const APU = "apu";
	const AUTOPILOT = "autopilot";
	const CREW_AWARENESS = "crew_awareness";
	const ELEC = "elec";
	const EMERG_EQUIP = "emerg_equip";
	const FIRE_PROT = "fire_prot";
	const FLT_CONTROL = "flt_control";
	const FUEL = "fuel";
	const HYDRAULICS = "hydraulics";
	const ICE_RAIN_PROT = "ice_rain_prot";
	const LDG_GEAR_BRK =  "ldg_gear_brk";
	const LIGHTING = "lighting";
	const LIMITATIONS = "limitations";
	const OXY = "oxy";
	const PERFORMANCE = "performance";
	const PNEUM = "pneum";
	const POWERPLANT = "powerplant";
	const PRESSURIZATION = "pressurization";
	const PROFILES = "profiles";
	const RADAR = "radar";
	const STALL_PROT = "stall_prot";
	const MANDATORY = "mandatory";
	
	public $systems_topics = array(AIR_CONDITION, ACFT_GEN, APU, AUTOPIOT, CREW_AWARENESS, ELEC, EMERG_EQUIP, FIRE_PROT,
	 FLT_CONTROL, FUEL, HYDRAULICS, ICE_RAIN_PROT, LDG_GEAR_BRK, LIGHTING, LIMITATIONS, OXY, PERFORMANCE, PNEUM, POWERPLANT, PRESSURIZATION, PROFILES, RADAR, STALL_PROT, MANDATORY);


	public $course_type;
	public $length;
	public $num_questions_from_category = array();
	public $testID;
	
	
	
	public function __get($name) {
		return $this->$name;
	}
	
	public function __set($name, $value) {
		$this->$name = $value;
	} 
	
	function __construct($cType, $len, $num_q_cArr){
			
		$this->course_type = $cType;
		$this->length = $len;
		$this->num_questions_from_category = $num_q_cArr;
	}
	
	
	//returns an unsaved model for a daily quiz
	public static function modelForDailyQuiz($systems_array){
		$model = new self(NULL, NULL, NULL);
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

        include 'XJTestDBConnect.php';
        $con = mysql_connect($host, $usn, $password);
        
        if(!$con){
        	die("could not connect: ".mysql_error());
        }
        
        mysql_select_db($database, $con);
        
		foreach($systems_array as $system){
			$questionQuantity[$system] = $qRow['COUNT(subcategory)'];
			$length += $qRow['COUNT(subcategory)'];
			$model->num_questions_from_category[$system] = $qRow['COUNT(subcategory)'];
		}
		
    	$model->length = $length;
		
		mysql_close($con);        
        return $model;
	}
	
	
	public static function modelForType($type) {
	 	//echo "modelFromID".$id."";
        $model = new self(NULL, NULL, NULL);
        
        include 'XJTestDBConnect.php';
        $con = mysql_connect($host, $usn, $password);
        
        if(!$con){
        	die("could not connect: ".mysql_error());
        }
        
        mysql_select_db($database, $con);
        
        
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
	
	
	//virtual constructor to retrieve test model by ID.
	 public static function modelFromID($id){
	 	//echo "modelFromID".$id."";
        $model = new self(NULL, NULL, NULL);
        
        include 'XJTestDBConnect.php';
        $con = mysql_connect($host, $usn, $password);
        
        if(!$con){
        	die("could not connect: ".mysql_error());
        }
        
        mysql_select_db($database, $con);
        
        
        $fetchModelQuery = "SELECT * FROM `test_model` WHERE `testID` = ".$id."";
        $fetchModelResult = mysql_query($fetchModelQuery);
        
        if(!$fetchModelResult){
        	echo "no result";
        }
        
        $model->testID = $id;
        while($row = mysql_fetch_array($fetchModelResult)){
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
	
	public function create_new_model(){
		include "XJTestDBConnect.php";

		
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);	
		
		$newModelQuery = "INSERT INTO `test_model` (course_type, length, air_condition, acft_gen, apu, autopilot, crew_awareness, elec, emerg_equip, fire_prot, flt_control, fuel, hydraulics, ice_rain_prot, ldg_gear_brk, lighting, limitations, oxy, performance, pneum, powerplant, pressurization, profiles, radar, stall_prot, mandatory) VALUES ('".$this->course_type."', '".$this->length."', '".$this->num_questions_from_category['air_condition']."', '".$this->num_questions_from_category['acft_gen']."', '".$this->num_questions_from_category['apu']."', '".$this->num_questions_from_category['autopilot']."', '".$this->num_questions_from_category['crew_awareness']."', '".$this->num_questions_from_category['elec']."', '".$this->num_questions_from_category['emerg_equip']."', '".$this->num_questions_from_category['fire_prot']."', '".$this->num_questions_from_category['flt_control']."', '".$this->num_questions_from_category['fuel']."', '".$this->num_questions_from_category['hydraulics']."',  '".$this->num_questions_from_category['ice_rain_prot']."', '".$this->num_questions_from_category['ldg_gear_brk']."', '".$this->num_questions_from_category['lighting']."', '".$this->num_questions_from_category['limitations']."', '".$this->num_questions_from_category['oxy']."', '".$this->num_questions_from_category['performance']."','".$this->num_questions_from_category['pneum']."', '".$this->num_questions_from_category['powerplant']."', '".$this->num_questions_from_category['pressurization']."', '".$this->num_questions_from_category['profiles']."', '".$this->num_questions_from_category['radar']."', '".$this->num_questions_from_category['stall_prot']."', '".$this->num_questions_from_category['mandatory']."')";
		
		$newModelResult = mysql_query($newModelQuery);
		if(!$newModelResult) {
			die("Could not run query ($newModelQuery) ".mysql_error());
		}
		
		mysql_close($con);
		
	}
	
	
	static function showModeledTestsFromType($courseType){
		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		
		
		$modelQuery = "SELECT * FROM `test_model` WHERE `course_type` = '".$courseType."'";
		
		$modelResult = mysql_query($modelQuery);
		
		if(!$modelResult){
			echo "could not run query ";
		}
		
		$models = array();
		
		while($row = mysql_fetch_array($modelResult)) {
			$modelAttr = array();
			$modelAttr['testID'] = $row['testID'];
			$modelAttr['length'] = $row['length'];
			$modelAttr['course_type'] = $row['course_type'];
			$modelAttr['air_condition'] = $row['air_condition'];
			$modelAttr['acft_gen'] = $row['acft_gen'];
			$modelAttr['apu'] = $row['apu'];
			$modelAttr['autopilot'] = $row['autopilot'];
			$modelAttr['crew_awareness'] = $row['crew_awareness'];
			$modelAttr['elec'] = $row['elec'];
			$modelAttr['emerg_equip'] = $row['emerg_equip'];
			$modelAttr['fire_prot'] = $row['fire_prot'];
			$modelAttr['flt_control'] = $row['flt_control'];
			$modelAttr['fuel'] = $row['fuel'];
			$modelAttr['hydraulics'] = $row['hydraulics'];
			$modelAttr['ice_rain_prot'] = $row['ice_rain_prot'];
			$modelAttr['ldg_gear_brk'] = $row['ldg_gear_brk'];
			$modelAttr['ldg_gear_brk'] = $row['ldg_gear_brk'];
			$modelAttr['lighting'] = $row['lighting'];
			$modelAttr['limitations'] = $row['limitations'];
			$modelAttr['oxy'] = $row['oxy'];
			$modelAttr['performance'] = $row['performance'];			
			$modelAttr['pneum'] = $row['pneum'];
			$modelAttr['powerplant'] = $row['powerplant'];
			$modelAttr['pressurization'] = $row['pressurization'];
			$modelAttr['profiles'] = $row['profiles'];
			$modelAttr['radar'] = $row['radar'];
			$modelAttr['stall_prot'] = $row['stall_prot'];
			$modelAttr['mandatory'] = $row['mandatory'];
			
			array_push($models, $modelAttr);
		}
		
		mysql_close($con);
		
		$models = json_encode($models);
		
		
		return $models;


	}
	
	
	static function removeModelWithID($testID) {
		$totalModels = array();
		
		include "XJTestDBConnect.php";
		$con = mysql_connect($host,$usn, $password);

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		
		
		$deleteModelQuery = "DELETE FROM `test_model` WHERE `testID` = '".$testID."'";
		
		$deleteModelResult = mysql_query($deleteModelQuery);
		
		if(!$deleteModelResult){
			echo "could not run query ";
		}
		
		$totalModelsQuery = "SELECT COUNT(testID) FROM `test_model`";
		$totalModelsResult = mysql_query($totalModelsQuery);
		
		while($row = mysql_fetch_array($totalModelsResult)){
			$totalModels['totalModels'] = $row["COUNT(testID)"];
		}
		

		mysql_close($con);
		$totalModels = json_encode($totalModels);
		return $totalModels;
		
	}
	
	
	public static function getCurrentQuestionQuantity(){
		
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
		
	}

}

?>