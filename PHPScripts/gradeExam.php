<?php

include '../Classes/Exam.php';

$answeredQuestionsArr = array();
$answeredQuestionsArr = $_POST['answeredQuestionsArr'];
$password = $_POST['password'];
$empNo = $_POST['empNo'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$syllabus = $_POST['syllabus'];
$qualCode = $_POST['qualCode'];
$retrain = $_POST['retrain'];

$classMonth = $_POST['classMonth'];
$classDay = $_POST['classDay'];
$classYear = $_POST['classYear'];
//format date.
$classDate = $classYear."-".$classMonth."-".$classDay;


function array_push_assoc($array, $key, $value){
	$array[$key] = $value;
	return $array;
}



$questionsAnswers = array();



foreach($answeredQuestionsArr as $elem){
	$questionsAnswers[$elem["questionID"]] = $elem['selectedAnswer'];
}

echo Exam::gradeExam($password, $empNo, $firstName, $lastName, $classDate, $syllabus, $qualCode, $retrain, $questionsAnswers);


?>