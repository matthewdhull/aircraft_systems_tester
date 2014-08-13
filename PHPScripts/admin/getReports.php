<?php
session_start();
session_cache_limiter('nocache');

include "../../Classes/ReportsClass.php";

$option = $_POST['option'];
$testID = $_POST['testID'];
$questionID = $_POST['questionID'];
$year = $_POST['year'];
$orgType = $_POST['orgType'];
$orgSpec = $_POST['orgSpec'];
$testDate = $_POST['testDate'];
$idForInstructor = $_POST['instructorEmpNo'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$password = $_POST['password'];
$admin = $_POST['admin'];
$spo_id = $_POST['spo_id'];
$variant = $_POST['variant'];


$instructorEmployeeNo = $_SESSION['employeeNo'];
$studentEmpNo = $_POST['studentEmpNo'];
$studentReportTestDate = $_POST['testDate'];



if(isset($_SESSION['name'])){
	$instructorEmpNo = $_SESSION['employeeNo'];

	if($option == "getCreatedTests"){
		echo Reports::createdTests($instructorEmpNo);
	}
	
	elseif($option == "getQuestionsForTestID"){
		echo Reports::questionsForTest($testID);
	}
	
	elseif($option == "getStudentReport") {
		echo Reports::reportForStudent($instructorEmployeeNo, $admin, $studentEmpNo, $studentReportTestDate);
	}
	
	elseif($option == "getAllScores"){
		echo Reports::showAllScores($year, $orgType, $orgSpec);
	}
	
	elseif($option == "getInstructors"){
		echo Reports::getInstructors();
	}
	
	elseif($option == "getInstructorInfo"){
		echo Reports::getInfoForInstructor($idForInstructor);
	}
	
	elseif($option == "deleteInstructor") {
		echo Reports::deleteInstructor($idForInstructor);
	}	
	
	//handles adding and updating instructor records by passing the $option var.  	
	elseif($option == "addInstructor" || $option == "updateInstructor"){
		echo Reports::editInstructor($idForInstructor, $firstName, $lastName, $password, $admin, $option);
	}
	
	elseif($option == "ejectQuestion"){
		echo Reports::ejectQuestion($testID, $questionID);
	}
	
	elseif($option == "getTestDates"){
		echo Reports::getTestDates();
	}
	
	elseif($option == "getInstructorTestDates"){
		echo Reports::getTestDatesForInstructor($instructorEmployeeNo);
	}
	
	elseif($option == "getInstructorsForDate"){
		echo Reports::getInstructorsForTestDate($testDate);
	}
	
	elseif($option == "getScoresForClass"){
		echo Reports::getScoresForClass($testDate);
	}
	elseif($option == "getSpoAnalysisForClass"){
		echo Reports::spoAnalysisForClass($testDate, $idForInstructor);
	}
	elseif($option == "getSPOList") {
		echo Reports::spoListForAcftType();
	}
	elseif($option == "getEOs"){
		echo Reports::eoListforSPO($spo_id);
	}
	
	elseif($option == "getEnteredEOs"){
		echo Reports::questionsEnteredEoListForSpo($variant, $spo_id);
	}
	
}


?>