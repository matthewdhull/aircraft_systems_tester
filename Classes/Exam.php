<?php

class Exam {

	public $num_questions_from_category = array();
	public $instructorID;
	public $testPassword;
	public $overridePassword;
	public $course_type;
	public $length;
	public $testID;
	public $timestamp;
	public $generatedID;
	public $gen_error;
	public $variant;

	public function __get($name) {
		return $this->$name;
	}
	
	public function __set($name, $value) {
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
	
	public function __construct($varnt, $numQuestionsArr, $insID, $testPwd, $ovrPwd, $crs_type, $len, $id){
		
		$this->variant = $varnt;
		$this->num_questions_from_category = $numQuestionsArr;
		$this->instructorID = $insID;
		$this->testPassword = $testPwd;
		$this->overridePassword = $ovrPwd;
		$this->course_type = $crs_type;
		$this->length = $len;
		$this->testID = $id;
		
		$this->gen_error = "";
/*
		echo "initialized EXAM with : <br />";

		foreach($this->num_questions_from_category as $k => $v){
			echo $k.": ".$v."<br />";
		}

		echo "instructorID: ".$this->instructorID."<br />";
		echo "testPassword: ".$this->testPassword."<br />";
		echo "testID: ".$this->testID."<br />";
		echo "course_type: ".$this->course_type."<br />";
		echo "length: ".$this->length."<br />";
*/
	
	}
	
	public function generateTest(){
	
		include 'testClass.php';

		$con = self::getConnection();
				
		$testObj = array();
		$idArr = array();

		
		foreach($this->num_questions_from_category as $k => $v){
			if ($v > 0){
			
				//select all questionID for subcategory
				//echo "requested ".$v." for ".$k." ";
				$getIdQuery = "SELECT `questionID` FROM `questions` WHERE `spo_id` = ".$k." AND `variant_id` = ".$this->variant."";
				$idResult = mysql_query($getIdQuery);
				$amt = mysql_num_rows($idResult);
				//echo "totalIDs : ".$amt." ";
				
				//add results to array.
				$tmpArr = array();
				while($row = mysql_fetch_array($idResult)){
					//echo "question ID ".$row['questionID'].", ";
					array_push($tmpArr, $row['questionID']);
				}
				
				
				//randomly select number of questions desired (5 electrical questions, for example)
				for($i = 0; $i<$v; $i++){
					shuffle($tmpArr);
					array_push($idArr, $tmpArr[0]);
					unset($tmpArr[0]);
				}
			}
		}	
		
		
		$createTestQuery = "INSERT INTO `createdTests` VALUES ";
		$createTestQuery .= "(NULL, ";
		$createTestQuery .= "'".$this->testID."', ";
		$createTestQuery .= "NULL, ";
		$createTestQuery .= "'".$this->course_type."', ";
		$createTestQuery .= "".$this->length.", ";
		$createTestQuery .= "'".$this->instructorID."', ";
		$createTestQuery .= "'".$this->testPassword."', ";
		$createTestQuery .= "'".$this->overridePassword."')";
		
		
		$createTestResult = mysql_query($createTestQuery);
		if(!$createTestResult){
			echo "couldn't create test ".mysql_error();
		}
		
		$timeStampQuery = "SELECT `genTestID`, `genDate` FROM `createdTests` ORDER BY `genDate` DESC LIMIT 1";
		$timeStampResult = mysql_query($timeStampQuery);
		if(!$timeStampResult){
			echo "could not get timestamp ".mysql_error();
		}
		
		//fetch generated date and testID AFTER a test has been created.
		while($row = mysql_fetch_array($timeStampResult)){
			
			$this->timestamp = $row['genDate'];
			$this->generatedID = $row['genTestID'];

		}
		

		//instantiate new question object for each questionID.
		foreach ($idArr as $value) {
 		   $question = Question::questionFromID($value);
 		   $testQ = $question->generate_test_question();
 		   
 		   
 		   
			$questionText = mysql_real_escape_string($testQ['questionText']);
			$a = mysql_real_escape_string($testQ['a']);
			$b = mysql_real_escape_string($testQ['b']);
			$c = mysql_real_escape_string($testQ['c']);			
			$d = mysql_real_escape_string($testQ['d']);						
			$key = mysql_real_escape_string($testQ['key']);			
			

			$insertTestQuestionQuery = "INSERT INTO `usedQuestions` VALUES(";
			$insertTestQuestionQuery .= "".$this->generatedID.", ";
			$insertTestQuestionQuery .= "".$testQ['questionID'].", ";
			$insertTestQuestionQuery .= "'".$testQ['type']."', ";
			$insertTestQuestionQuery .= "".$testQ['spo_id'].", ";
			$insertTestQuestionQuery .= "' ',"; //using spo_id instead of subcategory
			$insertTestQuestionQuery .= "'{$questionText}', ";
			$insertTestQuestionQuery .= "'{$a}', ";
			$insertTestQuestionQuery .= "'{$b}', ";
			$insertTestQuestionQuery .= "'{$c}', ";
			$insertTestQuestionQuery .= "'{$d}', ";
			$insertTestQuestionQuery .= "'{$key}')";
						
 		   $tqResult = mysql_query($insertTestQuestionQuery);
 		   
 		   if(!$tqResult){
 		   	  $this->gen_error = $this->gen_error.' Invalid test question insertion query: ' . mysql_error();
 		   }
		}
		
		
		/*
			fetch attributes of teach test question and insert into the questionsUsed table.
		*/
		
		array_push($testObj, $testQ);


		
		//uncomment to see results
		$testObj = json_encode($testObj);
		return $testObj;
				
	}
	
	public static function fetchQuestionsForTest($studentEmpNo, $testPassword, $ovrdPassword){
		$finalTest = array();
		$retrievedOverridePwd = "";


		include 'testClass.php';
		$con = self::getConnection();
			
		$fetchIdQuery = "SELECT `genTestID`, unix_timestamp(`genDate`), overridePassword FROM `createdTests` WHERE `testPassword` = '".$testPassword."'";
		$fetchIdResult = mysql_query($fetchIdQuery);
		if(!$fetchIdResult){
			die("invalid fetchID query".mysql_error());
		}
		
		$fetchID = "";
		$unixTimestamp;
		
		while($row = mysql_fetch_array($fetchIdResult)){
			$fetchID = $row['genTestID'];
			$unixTimestamp = $row["unix_timestamp(`genDate`)"];
			$retrievedOverridePwd = $row['overridePassword'];
		}
		
			
		//check for test expiration. (1 hours or 3600 seconds)
		$now = time();
		$timeElapsedSinceTestCreation = $now - $unixTimestamp;
		
		if($fetchID == "" || $timeElapsedSinceTestCreation >= 3600){
		 	$finalTest['error'] = "Invalid or expired password";
		 	$finalTest = json_encode($finalTest);	
		 	return $finalTest;
		 	exit;
		}
		
		//if test password is not expired, check for previous login attempt.  If previous login attempt is recorded, require override
		else {
			if($ovrdPassword == "") { //user may be trying to login for first time.
				$hasLoggedIn = "SELECT password, genTestID, studentEmpNo from logins where password = '".$testPassword."' AND studentEmpNo = '".$studentEmpNo."'";
				$loginResult = mysql_query($hasLoggedIn);
				if(!$loginResult) {
					die ("could not run query ($hasLoggedIn) ".mysql_error());
				}
				else {
					if(mysql_num_rows($loginResult) == 0){ //user has not logged in. retrieve test.
						$fetchTestQuestionsQuery = "SELECT * FROM `usedQuestions` WHERE `genTestID` = ".$fetchID."";
						$fetchTestQuestionsResult = mysql_query($fetchTestQuestionsQuery);
						if(!$fetchTestQuestionsResult){
							die("invalid fetchQuestionQuery ". mysql_error());
						}
						
						
						
						while($row = mysql_fetch_array($fetchTestQuestionsResult)){
							$questionCollection = array();
							$questionCollection['questionID'] = $row['questionID'];
							$questionCollection['type'] = $row['type'];
							$questionCollection['questionText'] = $row['questionText'];
							$questionCollection['a'] = $row['a'];
							$questionCollection['b'] = $row['b'];
							$questionCollection['c'] = $row['c'];
							$questionCollection['d'] = $row['d'];
							array_push($finalTest, $questionCollection);
						}	
						
						//make record of login.
						
						$loginAttempt = "INSERT INTO logins values (NULL, '".$testPassword."', '".$retrievedOverridePwd."', ".$fetchID.", 1, '".$studentEmpNo."')";						$loginAtmpResult = mysql_query($loginAttempt);
						if(!$loginAtmpResult){
							die("could not record loginAttempt ($loginAttempt) ".mysql_error());	
						}
						mysql_close($con);
						
						$finalTest = json_encode($finalTest);
						return $finalTest;
					}
					
					else { //student has logged in before.
						mysql_close($con);
					 	$finalTest['error'] = "Override password required for re-login";
					 	$finalTest = json_encode($finalTest);	
					 	return $finalTest;
					 	exit;
						
					}
				}
			}
            elseif ($ovrdPassword != "") { // override password has been supplied
				$reLogin = "SELECT password, override, genTestID, studentEmpNo from logins where password = '".$testPassword."' AND override = '".$ovrdPassword."' AND genTestID = ".$fetchID." AND studentEmpNo = '".$studentEmpNo."'";
				
				$reLoginResult = mysql_query($reLogin);
				if(!$reLoginResult) {
					die ("could not run query ($reLogin) ".mysql_error());
				}
				else {
                    if(mysql_num_rows($reLoginResult) == 0) {
						mysql_close($con);
					 	$finalTest['error'] = "Password or override incorrect";
					 	$finalTest = json_encode($finalTest);	
					 	return $finalTest;
					 	exit;
                        
                    }
					elseif(mysql_num_rows($reLoginResult)>0){
						$fetchTestQuestionsQuery = "SELECT * FROM `usedQuestions` WHERE `genTestID` = ".$fetchID."";
						$fetchTestQuestionsResult = mysql_query($fetchTestQuestionsQuery);
						if(!$fetchTestQuestionsResult){
							die("invalid fetchQuestionQuery ". mysql_error());
						}

						while($row = mysql_fetch_array($fetchTestQuestionsResult)){
							$questionCollection = array();
							$questionCollection['questionID'] = $row['questionID'];
							$questionCollection['type'] = $row['type'];
							$questionCollection['questionText'] = $row['questionText'];
							$questionCollection['a'] = $row['a'];
							$questionCollection['b'] = $row['b'];
							$questionCollection['c'] = $row['c'];
							$questionCollection['d'] = $row['d'];
							array_push($finalTest, $questionCollection);
						}
						
						mysql_close($con);
						
						$finalTest = json_encode($finalTest);
						return $finalTest;

            		} 
                }
            }
		}
		
	}

	public static function gradeExam($testPassword, $employeeNo, $firstName, $lastName, $classDate, $syllabus, $qualCode, $retrain, $qaArr, $doNotGrade){
		include 'testClass.php';

		$con = self::getConnection();		
		
		//object to return:
		$resultsObject = array();
		if($doNotGrade != "true") {
			$doNotGrade = "false";
			$resultsObject['queryResult'] = "ran query";
		}
					
		//get specific test information from testPassword
		$testInfoQuery = "SELECT `genDate`,`genTestID`, `instructorID`, `length` FROM `createdTests` WHERE `testPassword` = '".$testPassword."'";	
		$testInfoResults = mysql_query($testInfoQuery);
		if(!$testInfoResults){
			$this->gen_error = $this->gen_error."could not complete testInfo Query".mysql_error();
		}
		
		
		while($row = mysql_fetch_array($testInfoResults)){
			$testDate = date('y-m-d', strtotime($row['genDate']));
			$genTestID = $row['genTestID'];
			$instructorID = $row['instructorID'];
			$testLength = $row['length'];
			
		}
		
		//sort submitted questions/answers by ID ascending (low - high)
		ksort($qaArr);
		
		
		//get answer keys by selected testID
		$getAnswerKeyQuery = "SELECT `questionID`, `answerKey` FROM `usedQuestions` WHERE `genTestID` = ".$genTestID." order by `questionID` asc";
		$getAnswerKeyResult = mysql_query($getAnswerKeyQuery);
		if(!$getAnswerKeyResult){
			die("could not get answerKey: ".mysql_error());
		}
		
		//construct a KEY VALUE array from retrieved results. (this format is used for comparison with SUBMITTED RESULTS)
		$answerKeyArr = array();
		while($row = mysql_fetch_array($getAnswerKeyResult)){
			$kv = array($row['questionID']=>$row['answerKey']);
			array_push($answerKeyArr, $kv);
		}
		
		//Loop through the answer key and compare each submitted answer for comparison.
		$insertResultQuery = "";
		$incorrectAns = 0;
		$incorrectQuestionIDs = array();
		foreach ($answerKeyArr as $elem){
			foreach($elem as $key => $value){
				
			    if ($qaArr[$key] != $value){
			    	//$isCorrect = false;
					$incorrectAns++;
					$insertResultQuery = "INSERT INTO `testResults` VALUES (null, '".$employeeNo."', ".$genTestID.", ".$key.",  false)"; 
					$incorrectQuestionIDs[$key] = $value;
			     
			    }
			    elseif($qaArr[$key] == $value){
			    	//$isCorrect = true;
			    	$insertResultQuery = "INSERT INTO `testResults` VALUES (null, '".$employeeNo."', ".$genTestID.", ".$key.", true)"; 
			    }
			    
				if($doNotGrade == "false") { //used to prevent grading if the test-taker is an instructor
					$insertResult = mysql_query($insertResultQuery);
				     if(!$insertResultQuery){
				     	$this->gen_error = "could not insert result ($insertResultQuery)".mysql_error();
				     }
			    }
			     
		  	}	
		 }
		 
		$ic = $incorrectAns;		
		$pct = (100 - ((100 / $testLength)*$ic));

		$resultsObject['incorrectAnswers'] = $incorrectAns;
		$resultsObject['percentage'] = $pct;
		$resultsObject['outcome'] = ($pct >= 80 ? "satisfactory" : "unsatisfactory");
		$resultsObject['incorrectQuestions'] = $incorrectQuestionIDs;
		$resultsObject['doNotGrade'] = $doNotGrade;
		
		
		//record full test record into database.	
		$completeExamRecord = "INSERT INTO `studentTestRecords` VALUES(null, '".$employeeNo."', '".$firstName."', '".$lastName."', '".$classDate."', '".$testDate."', '".$instructorID."', '".$syllabus."', '".$qualCode."', ".$genTestID.", ".$retrain.", '".$resultsObject['outcome']."', ".$pct.")";
		
		if($doNotGrade == "false") { //used to prevent grading if the test-taker is an instructor		
			$completeExamResult = mysql_query($completeExamRecord);
			if(!$completeExamResult){
				$this->gen_error = $this->gen_error." unable to insert complete exam result ".mysql_error();
			}
		}
		
		mysql_close($con);
				
				
		$resultsObject = json_encode($resultsObject);
		return $resultsObject;		
		
				
	}
	
	public function inspectTest() {
		$testData = array();
		$testData['error'] = $this->gen_error;
		$testData['message'] = $this->course_type." Test ID(".$this->generatedID.") created successfully.";
		$testData['instructorID'] = $this->instructorID;
		$testData['testPassword'] = $this->testPassword;
		$testData['overridePassword'] = $this->overridePassword;
		$testData['course_type'] = $this->course_type;
		$testData['length'] = $this->length;
		$testData['generatedID'] = $this->generatedID;
		$testData['timestamp'] = $this->timestamp;
		
		$testData = json_encode($testData);
		return $testData;

	}
	
}

?>