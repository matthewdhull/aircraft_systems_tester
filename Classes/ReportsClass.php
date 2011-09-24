<?php


class Reports {

	public function __get($name) {
		return $this->$name;
	}
	
	public function __set($name, $value) {
		$this->$name = $value;
	} 
		
	
	public static function questionsForTest($testID){
			$testQuestionsAndTimeout = array();
			$testQuestions = array();
			
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			
			$getTimeSinceTest = "SELECT unix_timestamp(`genDate`) FROM `createdTests` WHERE `genTestID` = '".$testID."'";
			$timeSinceTest = mysql_query($getTimeSinceTest);
			if(!$timeSinceTest){
				die("invalid fetchID query".mysql_error());
			}
			
			$unixTimestamp;
			
			while($tRow = mysql_fetch_array($timeSinceTest)){
				$unixTimestamp = $tRow["unix_timestamp(`genDate`)"];
			}
			
			//check for test expiration. (8 hours or 28800 seconds)
			$now = time();
			$timeElapsedSinceTestCreation = $now - $unixTimestamp;
			
			if($timeElapsedSinceTestCreation >= 86400){
			 	$testQuestionsAndTimeout['timeout'] = "YES";
			}
			 
			else{
				$testQuestionsAndTimeout['timeout'] = "NO";
			}
			
			
			$getQuestions = "SELECT `questionID`, `genTestID`, `subcategory`, `questionText`, `a`, `b`, `c`, `d`, `answerKey` FROM `usedQuestions` WHERE `genTestID` = ".$testID."";
			
			
			$questionsResult = mysql_query($getQuestions);
			if(!$questionsResult){
				die("could not run query ($questionsResult) ".mysql_error());
			}
			
			while($row = mysql_fetch_array($questionsResult)){
				$question = array();
				$question['questionID'] = $row['questionID'];
				$question['genTestID'] = $row['genTestID'];
				$question['subcategory'] = $row['subcategory'];
				$question['questionText'] = $row['questionText'];
				$question['a'] = $row['a'];
				$question['b'] = $row['b'];
				$question['c'] = $row['c'];
				$question['d'] = $row['d'];
				$question['answerKey'] = $row['answerKey'];
				array_push($testQuestions, $question);
			}
			mysql_close($con);
			
			$testQuestionsAndTimeout['testQuestions'] = $testQuestions;
			
			
			$testQuestionsAndTimeout = json_encode($testQuestionsAndTimeout);
			return $testQuestionsAndTimeout;
	
	}
	public static function createdTests($instructorEmpNo){
		
			$createdTests = array();
			$subcategoriesArr = array();
			$qAmountForCategory = "";
			$correctCount = "";
		
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);

			$getTests = "SELECT DISTINCT createdTests.genTestID, createdTests.testModelID, createdTests.genDate , createdTests.course_type, createdTests.length, createdTests.testPassword FROM createdTests, studentTestRecords WHERE createdTests.instructorID = '".$instructorEmpNo."' AND studentTestRecords.genTestID = createdTests.genTestID";
			
						
												
			$getTestResult = mysql_query($getTests);
			if(!$getTestResult){
				die("could not run query ($getTests) ".mysql_error());
			}
					
			while($row = mysql_fetch_array($getTestResult)){
				$aTest = array();
				$aTest['genTestID'] = $row['genTestID'];
				$aTest['testModelID'] = $row['testModelID'];	
				$formattedDate = substr($row['genDate'], 0, 10);
				$formattedDateArr = explode("-", $formattedDate);
				$aTest['genDate'] = $formattedDateArr[1]."-".$formattedDateArr[2]."-".$formattedDateArr[0];
				$aTest['course_type'] = $row['course_type'];
				$aTest['testPassword'] = $row['testPassword'];

				//get class average
				$getAverage = "SELECT TRUNCATE(AVG(studentTestRecords.score),2) FROM createdTests, studentTestRecords WHERE createdTests.instructorID = '".$instructorEmpNo."' AND studentTestRecords.genTestID = ".$aTest['genTestID']."";
				$avgResult = mysql_query($getAverage);
				if(!$avgResult){
					die("could not run query ($getAverate) ".mysql_error());
				}
				while($avgRow = mysql_fetch_array($avgResult)){
					$aTest['avg'] = $avgRow['TRUNCATE(AVG(studentTestRecords.score),2)'];
				}
				
				
				//gets amount of testsIssued.
				 $testsIssuedQuery = "SELECT COUNT(studentTestRecords.genTestID) FROM studentTestRecords WHERE genTestID = ".$aTest['genTestID']."";
				 $testsIssuedResult = mysql_query($testsIssuedQuery);
				 if(!$testsIssuedResult){
				 	die("could not run get subcatresult query ($testsIssuedQuery) ".mysql_error());
				 }
				 
				 while($tRow = mysql_fetch_array($testsIssuedResult)){
				 	$aTest['testsIssued'] = $tRow['COUNT(studentTestRecords.genTestID)'];
				 }
				
				
				if($aTest['testsIssued'] != 0){
						
						//gets a list of ALL subcategories used in a particular test.
						$getSubcategories = "SELECT DISTINCT questions.subcategory from questions, testResults where questions.questionID = testResults.questionID and testResults.genTestID = ".$aTest['genTestID']."";
						
						$getSubcatResult = mysql_query($getSubcategories);
						
						if(!$getSubcatResult){
							die("could not run get subcatresult query ($getSubcatResult) ".mysql_error());
						}
						
						
						while($subcatRow = mysql_fetch_array($getSubcatResult)){
							$subcategory = $subcatRow['subcategory'];

							//get amount of questions asked for a particular category
							$getNumberOfQuestions = "SELECT ".$subcategory." from test_model, createdTests where test_model.testID = createdTests.testModelID and createdTests.genTestID = ".$aTest['genTestID']."";
							$numberOfQuestions = mysql_query($getNumberOfQuestions);
							if(!$numberOfQuestions){
								die("could not run numberOfQuestions query ($getNumberOfQuestions) ".mysql_error());
							}
							while($noQuestions = mysql_fetch_array($numberOfQuestions)){
								$qAmountForCategory = $noQuestions[$subcategory];
							}
								
							
							
							
							//get the amount of correct/incorrect questions per subcategory used.
							$getCorrectAmount = "SELECT questions.subcategory, SUM(testResults.correct), COUNT(testResults.correct) FROM testResults, questions WHERE testResults.questionID = questions.questionID AND genTestID = ".$aTest['genTestID']." AND questions.subcategory = '".$subcategory."'";	
							
							$correctAmount = mysql_query($getCorrectAmount);
							if(!$correctAmount){
								die("could not run correctAmount query ($correctAmount) ".mysql_error());
							}
							while($correctRow = mysql_fetch_array($correctAmount)){
								$correctCount = $correctRow['SUM(testResults.correct)'];
								$totalQsAskedForCat = $correctRow['COUNT(testResults.correct)'];
							} 
							
							if($totalQsAskedForCat != 0){
								$percentageForCat = (int)(($correctCount * 100) / $totalQsAskedForCat);
								$subcategoriesArr[$subcategory] = $percentageForCat;
							}
							
					}
					
										
					$aTest['perSubcatAnalysis'] = $subcategoriesArr;
				}
				
				array_push($createdTests, $aTest);
			}
			mysql_close($con);

			$createdTests = json_encode($createdTests);
			return $createdTests;
		}
		
		public static function reportForStudent($instructorEmployeeNo, $admin, $studentEmpNo, $studentReportTestDate){

			$report = array();
			$weakestSystems = array();
			$missedQuestionSet = array();
			$employeeInfo = array();
			$genTestID = "";

			
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			
			
			$tempDate = explode("-",$studentReportTestDate);
			$studentReportTestDate = $tempDate[2]."-".$tempDate[0]."-".$tempDate[1];
			
			$getTestIDForDate = "";
			if($admin == false){
				$getTestIDForDate = "SELECT testDate, genTestID FROM studentTestRecords WHERE testDate = '".$studentReportTestDate."' AND instructorID = '".$instructorEmployeeNo."'";
			}
			elseif($admin == true){	
				$getTestIDForDate = "SELECT testDate, genTestID FROM studentTestRecords WHERE testDate = '".$studentReportTestDate."' AND employeeNo = '".$studentEmpNo."'";
			}
			$getTestIDResult = mysql_query($getTestIDForDate);
			if(!$getTestIDResult){
				die("could not run query ($getTestIDResult) ".mysql_error());
			}
			
						
			if (mysql_num_rows($getTestIDResult) == 0) {
				$report['msg'] = false;
			}
			
			else {
				while($idRow = mysql_fetch_array($getTestIDResult)){
					$genTestID = $idRow['genTestID'];
					$getTestScore = "SELECT questions.subcategory, testResults.questionID, TRUNCATE((avg(testResults.correct) * 100),2) FROM questions, testResults WHERE genTestID = ".$genTestID." AND questions.questionID = testResults.questionID AND employeeNo = '".$studentEmpNo."' GROUP BY questions.subcategory ORDER BY TRUNCATE((avg(testResults.correct) * 100),2)";					
					$getTestResult = mysql_query($getTestScore);
		
					if(!$getTestResult){
						die("could not run query ($getTestScore) ".mysql_error());
					}
					
					while($resultRow = mysql_fetch_array($getTestResult)){
						$weakestSystems[$resultRow['subcategory']] = $resultRow['TRUNCATE((avg(testResults.correct) * 100),2)'];
					}
					$report['weakSystems'] = $weakestSystems;
				}
					
					$getMissedQuestions = "SELECT usedQuestions.subcategory, usedQuestions.questionText, usedQuestions.a, usedQuestions.b, usedQuestions.c, usedQuestions.d, usedQuestions.answerKey FROM usedQuestions, testResults WHERE usedQuestions.genTestID = testResults.genTestID AND usedQuestions.questionID = testResults.questionID AND testResults.correct = 0 AND testResults.genTestID = ".$genTestID." AND testResults.employeeNO = '".$studentEmpNo."' ORDER BY usedQuestions.subcategory";	
					
					$missedQuestionsResult = mysql_query($getMissedQuestions);
					
					if(!$missedQuestionsResult){
						die("could not run query ($getMissedQuestions) ".mysql_error());
					}
					
					while($mqRow = mysql_fetch_array($missedQuestionsResult)){
						$missedQuestion = array();
						$missedQuestion['subcategory'] = $mqRow['subcategory'];
						$missedQuestion['questionText'] = $mqRow['questionText'];
						$missedQuestion['a'] = $mqRow['a'];
						$missedQuestion['b'] = $mqRow['b'];
						$missedQuestion['c'] = $mqRow['c'];
						$missedQuestion['d'] = $mqRow['d'];
						$missedQuestion['answerKey'] = $mqRow['answerKey'];
						array_push($missedQuestionSet, $missedQuestion);
					}
					
					$report['missedQuestions'] = $missedQuestionSet;
					
				}
			
			
			
			mysql_close($con);
			
			$report = json_encode($report);
			return $report;
			
		}	
		
		//returns all studentTestRecords for .csv (not json)
		public static function cumulativeTestStats(){
			$statsReport = array();
			$columnNames = array("Employee Number", "Name", "Class Date", "Test Date", "Instructor", "Syllabus", "Qual Code", "Retrain", "Result", "Score");
			array_push($statsReport, $columnNames);
					
			include "XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			$getStats = "SELECT employeeNo, firstName, lastName, classDate, testDate, instructorID, syllabus, qualCode, retrain, result, score FROM studentTestRecords";
			
			$statsResult = mysql_query($getStats);
			if(!$statsResult) {
				die("could not get stats ($getStats) ".mysql_error());
			}
			
			while($row = mysql_fetch_array($statsResult)){
				$employeeNo = $row['employeeNo'];
				$name = $row['firstName']." ".$row['lastName'];
				$classDate = $row['classDate'];
				$testDate = $row['testDate'];
				$instructor = $row['instructorID'];
				$syllabus = $row['syllabus'];
				$qualCode = $row['qualCode'];
				$decodedRetrain = "no";
				if($row['retrain'] == 1){
					$decodedRetrain = "yes";
				}
				$retrain = $decodedRetrain;
				$result = $row['result'];
				$score = $row['score'];
				$studentTestRecord = array($employeeNo, $name, $classDate, $testDate, $instructor, $syllabus, $qualCode, $retrain, $result, $score);
				array_push($statsReport, $studentTestRecord);
			}
			
			mysql_close($con);
			
			return $statsReport;
		}
		
		
		
		
		public static function showAllScores($year, $orgType, $orgSpec){
			$statsReport = array();
		
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
			
			$getReport = "SELECT employeeNo, firstName, lastName, classDate, testDate, instructorID, syllabus, qualCode, retrain, result, score FROM studentTestRecords WHERE testDate ";
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);

			
			if($orgType == "month"){
				$getReport = $getReport."LIKE '".$year."-".$orgSpec."-%'";
			}
			elseif($orgType == "quarter"){
				$startDate = "";
				$endDate = "";
				if($orgSpec == "q1"){
					$startDate = $year."-1-1";
					$endDate = $year."-3-31";
				}
				elseif($orgSpec == "q2"){
					$startDate = $year."-4-1";
					$endDate = $year."-6-30";
				}
				elseif($orgSpec == "q3"){
					$startDate = $year."-7-1";
					$endDate = $year."-9-30";
				}
				elseif($orgSpec == "q4"){
					$startDate = $year."-10-1";
					$endDate = $year."-12-31";
				}
				$getReport = $getReport."BETWEEN '".$startDate."' AND '".$endDate."'";
				//echo $getReport;
			} 
			elseif($orgType == "year"){
				$getReport = $getReport." LIKE '".$year."-%-%'";
				//echo $getReport;

			}
			
			$reportResult = mysql_query($getReport);
			if(!$reportResult){
				die("could not run query ($getReport) ".mysql_error());
			}
			
			while($row = mysql_fetch_array($reportResult)){
				$testScore = array();
				$testScore['employeeNo'] = $row['employeeNo'];
				$testScore['firstName'] = $row['firstName']; 
				$testScore['lastName'] = $row['lastName'];
				$formattedClassDate = explode("-",$row['classDate']); 
				$testScore['classDate'] = $formattedClassDate[1]."-".$formattedClassDate[2]."-".$formattedClassDate[0];
				$formattedTestDate = explode("-", $row['testDate']); 
				$testScore['testDate'] = $formattedTestDate[1]."-".$formattedTestDate[2]."-".$formattedTestDate[0];
				$testScore['instructorID'] = $row['instructorID']; 
				$testScore['syllabus'] = $row['syllabus'];
				$testScore['qualCode'] = strtoupper($row['qualCode']); 
				$retrainResult = "";
				if($row['retrain'] == 0) {
					$retrainResult = "NO";
				}
				else {
					$retrainResult = "YES";
				}
				$testScore['retrain'] = $retrainResult;
				$testScore['result'] = ucfirst($row['result']);
				$testScore['score'] = $row['score'];
				array_push($statsReport, $testScore);
			}
			mysql_close($con);
			
			$statsReport = json_encode($statsReport);
			return $statsReport;
			
		}
		
		//gets ALL instructors authorized on SJTester.
		public static function getInstructors(){
			
			$instructors = array();
			
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
		
			
			$getInstructorList = "SELECT instructorID, employeeNo, firstName, lastName, password, admin from instructors";
			$instructorList = mysql_query($getInstructorList);
			while($row = mysql_fetch_array($instructorList)){
				$instructor = array();
				 $instructor['instructorID'] = $row['instructorID'];
				 $instructor['employeeNo'] = $row['employeeNo'];
				 $instructor['firstName'] = $row['firstName'];
				 $instructor['lastName'] = $row['lastName'];
				 $instructor['password'] = $row['password']; 
				 $admin = "";
				 if($row['admin'] == 0){
					 $admin = "NO"; 
				 }
				 else {
				 	$admin = "YES";
				 }
				 $instructor['admin'] = $admin;
				 array_push($instructors, $instructor);
			}
			
			mysql_close($con);
			
			$instructors = json_encode($instructors);
			return $instructors;
		}
		
		public static function getInfoForInstructor($idForInstructor){
		
			$instructorInfo = array();
		
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			
			$getInfo = "SELECT * from instructors where employeeNo = '".$idForInstructor."'";
			$infoResult = mysql_query($getInfo);
			if(!$infoResult){
				die("could not run query ($getInfo) ".mysql_error());
			}
			
			while($row = mysql_fetch_array($infoResult)){
				 $instructorInfo['instructorID'] = $row['instructorID'];
				 $instructorInfo['employeeNo'] = $row['employeeNo'];
				 $instructorInfo['firstName'] = $row['firstName'];
				 $instructorInfo['lastName'] = $row['lastName'];
				 $instructorInfo['password'] = $row['password']; 
				 $admin = "";
				 if($row['admin'] == 0){
					 $admin = "NO"; 
				 }
				 else {
				 	$admin = "YES";
				 }
				 $instructorInfo['admin'] = $admin;

			}
			mysql_close($con);
			
			$instructorInfo = json_encode($instructorInfo);
			return $instructorInfo;
						
		}
		
		public static function deleteInstructor($idForInstructor){
			$deleteMessage = array();
			
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			
			$deleteIns = "DELETE FROM instructors WHERE employeeNo = '".$idForInstructor."'";
			$deleteResult = mysql_query($deleteIns);
			
			if(!$deleteResult){
				die("could not run query ($deleteIns) ".mysql_error());
			}
			
/*
			if(mysql_num_rows($deleteResult) == 1){
				$deleteMessage['message'] = "Instructor ".$idForInstructor." deleted";
			}
			
*/
			mysql_close($con);			
			$deleteMessage = json_decode($deleteMessage);
			return $deleteMessage;
		}
		
		public static function editInstructor($idForInstructor, $firstName, $lastName, $insPassword, $admin, $option) {
			$editMessage = array();
		
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			$editInstructor = "";
			
			if($option == "updateInstructor"){
				$editInstructor = "UPDATE instructors SET firstName = '".$firstName."', lastName = '".$lastName."', password = '".$insPassword."', admin = ".$admin." where employeeNo = '".$idForInstructor."'";
			}
			
			elseif($option == "addInstructor"){
				$editInstructor = "INSERT INTO instructors VALUES (NULL, '".$idForInstructor."', '".$firstName."', '".$lastName."', '".$insPassword."', ".$admin.")";
			}
			
			
			$editResult = mysql_query($editInstructor);
			if(!$editResult){
				die("could not run query ($editInstructor) ".mysql_error());
			}
			
/*
			if(mysql_affected_rows($editResult) == 1){
				$editMessage['message'] = $option." operation for ".$idForInstructor." successful";
			}
*/
			
			
			mysql_close($con);
			
			$editMessage = json_encode($editMessage);
			return $editMessage;
		
		}
		
		public static function ejectQuestion($testID, $questionID){
			$length = "";
			$valuePerQ = "";
			$scoreBeforeUpdate = "";
			$resultBeforeUpdate = "";
			$newScore = "";
			$newResult = "";
			$resultNeedsUpdate = false;
			
			//empty query.
			$updateResultsAndScore = "";

			//will be used to hold employeeNumbers of students needing scores updated for ejected questions.
			$studentsNeedingUpdate = array();
			
			//this will be returned from the function and contains a list of students with a result changing from unsat -> sat.
			$resultsChangeReport = array();
			
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			$getLength = "SELECT length FROM createdTests where genTestID = ".$testID."";
			$lengthResult = mysql_query($getLength);
			if(!$lengthResult){
				die("could not run query ($getLength) ".mysql_error());
			}
			while($lRow = mysql_fetch_array($lengthResult)){
				$length = $lRow['length'];
			}
			
			$valuePerQ = 100 / $length;			
			
			//get records of students that missed the ejected question.
			
			$getStudentsWhoMissed = "SELECT employeeNo FROM testResults WHERE questionID = ".$questionID." AND genTestID = ".$testID." AND correct = 0";
			$studentsWhoMissedResult = mysql_query($getStudentsWhoMissed);
			if(!$studentsWhoMissedResult){
				die("Could not run query ($getStudentsWhoMissed) ".mysql_error());
			}
			
			
			if(mysql_num_rows($studentsWhoMissedResult) == 0){
				echo "no students missed this question";	
			}
			
			//for each student who missed the question; set the result to correct, update the score, and determine if the result should be changed.
			else {
					while($mRow = mysql_fetch_array($studentsWhoMissedResult)){
						array_push($studentsNeedingUpdate, $mRow['employeeNo']);
					}
					
					foreach($studentsNeedingUpdate as $student){
						$updateTestResults = "UPDATE testResults SET correct = 1 WHERE questionID = ".$questionID." AND genTestID = ".$testID."";
						$updateTests = mysql_query($updateTestResults);
						if(!$updateTests){
							die("could not run query ($updateTestResults) ".mysql_error());
						}
						
						$getResultAndScore = "SELECT result, score FROM studentTestRecords WHERE employeeNo = '".$student."' AND genTestID = ".$testID."";
						$resAndScore = mysql_query($getResultAndScore);
						if(!$resAndScore){
							die("could not run query ($getResultAndScore) ".mysql_error());
						}
						while($rsRow = mysql_fetch_array($resAndScore)){
							$scoreBeforeUpdate = $rsRow['score'];
							$resultBeforeUpdate = $rsRow['result'];
						}
						
						$newScore = $scoreBeforeUpdate + $valuePerQ;
						if($newScore >= 80 && $resultBeforeUpdate == "unsatisfactory"){
							$resultNeedsUpdate = true;
							array_push($resultsChangeReport, $student);
						}
						
						//execute a query that either updates the score alone OR both score and result (example, if the new score >= 80, it results in a satisfactory result where previously the student was unsatisfactory.
						if($resultNeedsUpdate == true){
							$updateResultsAndScore = "UPDATE studentTestRecords SET result = 'satisfactory', score = ".$newScore." WHERE employeeNo = '".$student."' AND genTestID = ".$testID."";
						}
						else {
							$updateResultsAndScore = "UPDATE studentTestRecords SET score = ".$newScore." WHERE employeeNo = '".$student."' AND genTestID = ".$testID."";
						}
						
						$updateStudentResult = mysql_query($updateResultsAndScore);
						if(!$updateStudentResult){
							die("could not run query ($updateResultsAndScore) ".mysql_error());
						}
					}
			}
			
			mysql_close($con);
			
			$resultsChangeReport = json_encode($resultsChangeReport);
			return $resultsChangeReport;
		}
		
		public static function getInstructorsForTestDate($testDate){
			$instructors = array(); // return result.
			include "XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			$tempDate = explode("-", $testDate);
			$testDate = $tempDate[2]."-".$tempDate[0]."-".$tempDate[1];			
			
			$getInstructorsForDateQuery = "SELECT DISTINCT instructorID FROM studentTestRecords WHERE testDate = '".$testDate."'";
			$insResult = mysql_query($getInstructorsForDateQuery);
			if(!$insResult){
				die("could not run query ($getInstructorsForDateQuery) ".mysql_error());
			} 			
			else {
				while($row = mysql_fetch_array($insResult)){
					array_push($instructors, $row['instructorID']);
				}
			}
			mysql_close($con);
			
			$instructors = json_encode($instructors);
			return $instructors;
		}
		
		public static function getTestDates(){
			
			$testDates = array();
		
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			$selectTestDateQuery = "SELECT DISTINCT testDate from studentTestRecords ORDER BY testDate DESC";
			$testDatesResult = mysql_query($selectTestDateQuery);
			if(!$testDatesResult){
				die("could not run query ($selectTestDateQuery) ".mysql_error());
			}
			while($row = mysql_fetch_array($testDatesResult)){
				$dateArray = explode("-",$row['testDate']);
				$formattedDate = $dateArray[1]."-".$dateArray[2]."-".$dateArray[0];
				array_push($testDates, $formattedDate);
			}
			
			mysql_close($con);
			
			$testDates = json_encode($testDates);
			return $testDates;
		
		}
		
		public static function getTestDatesForInstructor($instructorEmployeeNo){
					
			$testDates = array();
		
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			$selectTestDateQuery = "SELECT DISTINCT testDate from studentTestRecords where instructorID = '".$instructorEmployeeNo."'";
			$testDatesResult = mysql_query($selectTestDateQuery);
			if(!$testDatesResult){
				die("could not run query ($selectTestDateQuery) ".mysql_error());
			}
			while($row = mysql_fetch_array($testDatesResult)){
				$dateArray = explode("-",$row['testDate']);
				$formattedDate = $dateArray[1]."-".$dateArray[2]."-".$dateArray[0];
				array_push($testDates, $formattedDate);
			}
			
			mysql_close($con);
			
			$testDates = json_encode($testDates);
			return $testDates;

		}
		
		public static function getScoresForClass($testDate){
			$scoresForClass = array();
			$testInfo = array();
			$testInfo['testDate'] = $testDate;
			$scores = array();

			//format the test date from m-d-y, to y-m-d
			
			$tempDate = explode("-", $testDate);
			$testDate = $tempDate[2]."-".$tempDate[0]."-".$tempDate[1];
		
			include "../../Classes/XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			
			
			//first get instructor/date/class type information.
			$testInfoQuery = "select DISTINCT instructorID, TRUNCATE(avg(score),2) from studentTestRecords where testDate = '".$testDate."'";
			$testInfoResult = mysql_query($testInfoQuery);
			if(!$testInfoResult){
				die("could not run query ($testInfoQuery) ".mysql_error());
			}
			
			while($tRow = mysql_fetch_array($testInfoResult)){
				$testInfo['instructorID'] = $tRow['instructorID'];
				$testInfo['classAverage'] = $tRow['TRUNCATE(avg(score),2)'];
			}
			
			$scoresForClass['testInfo']  = $testInfo;
			
			//second, get scores for entire class.
			$classScoresQuery = "select firstName, lastName, employeeNo, result, score from studentTestRecords where testDate = '".$testDate."'";
			$classScoreResult = mysql_query($classScoresQuery);
			if(!$classScoreResult){
				die("could not run query ($classScoresQuery) ".mysql_error());
			}
			
			
			while($row = mysql_fetch_array($classScoreResult)){
				$testRecord = array();
				$testRecord['name'] = $row['firstName']." ".$row['lastName'];
				$testRecord['employeeNo'] = $row['employeeNo'];
				$testRecord['result'] = $row['result'];
				$testRecord['score'] = $row['score'];
				array_push($scores, $testRecord);
 			}
 			
 			$scoresForClass['scores'] = $scores;
			
			mysql_close($con);
			
			$scoresForClass = json_encode($scoresForClass);
			return $scoresForClass;
		}
		
		public static function spoAnalysisForClass($testDate, $instructorID){
			$perSpoAnalysis = array(); //returned array
			$spoList = array();
			$genTestID = "";

			//format test date.
			$tempDate = explode("-", $testDate);
			$testDate = $tempDate[2]."-".$tempDate[0]."-".$tempDate[1];			


			include "XJTestDBConnect.php";
			$con = mysql_connect($host,$usn, $password);
	
			if (!$con){
			  die('Could not connect: ' . mysql_error());
			 }
			
			mysql_select_db($database, $con);
			
			//grab genTestID for the instructor/date match.
			$testIdQuery = "SELECT DISTINCT genTestID from studentTestRecords where instructorID = '".$instructorID."' AND testDate = '".$testDate."'";
			$testIdResult = mysql_query($testIdQuery, $con);
			
			if(!$testIdResult) {
				die("Could not run query ($testIdQuery) ".mysql_error());
			}
			else {
				while($row = mysql_fetch_array($testIdResult)){
					$genTestID = $row['genTestID'];
				}
			}
			
			//get list of SPO's used for the test (identified by genTestID)
			$spoQuery = "SELECT DISTINCT questions.spo, spo.spo_name FROM usedQuestions, spo, questions WHERE usedQuestions.genTestID = ".$genTestID." AND usedQuestions.questionID = questions.questionID AND questions.spo = spo.spo_number";
			$spoResult = mysql_query($spoQuery, $con);
			if(!$spoResult) {
				die("Could not run query ($spoQuery) ".mysql_error());
			}
					
			//add all results to the $spoList
			while($row = mysql_fetch_array($spoResult)){
				$spo = array();
				$spo['spo_number'] = $row['spo'];
				$spo['spo_name'] = $row['spo_name'];
				array_push($spoList, $spo);
			}
			
			//spo number, spo name, percentage.
			foreach($spoList as $singleSpec){
				$spoWithPercentageCorrect = array();
				$getAmountAskedAndAmountCorrectQuery = "select count(testResults.questionID), SUM(testResults.correct) from testResults, questions where testResults.questionID = questions.questionID and testResults.genTestID = ".$genTestID." and questions.spo = '".$singleSpec['spo_number']."'";
				$queryResult = mysql_query($getAmountAskedAndAmountCorrectQuery);
				if(!$queryResult){
					die("Could not run query ($getAmountAskedAndAmountCorrectQuery) ".mysql_error());
				}
				else {
					while($row = mysql_fetch_array($queryResult)){
						$amtAsked = $row['count(testResults.questionID)'];
						$amtCorrect = $row['SUM(testResults.correct)'];
						$percentageScore = round(($amtCorrect * 100) / $amtAsked, 1); 
						$spoWithPercentageCorrect['spo_number'] = $singleSpec['spo_number'];
						$spoWithPercentageCorrect['spo_name'] = $singleSpec['spo_name'];
						$spoWithPercentageCorrect['percentage'] = $percentageScore;
						array_push($perSpoAnalysis, $spoWithPercentageCorrect);											
					}
				} 
			}
			mysql_close($con);
			
			$perSpoAnalysis = json_encode($perSpoAnalysis);
			return $perSpoAnalysis;
		}




	} 
?>