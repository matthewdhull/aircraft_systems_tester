<?php

include '../Classes/test_model.php';
include '../Classes/Exam.php';

$systems = $_POST['sys'];
$instructorID = $_POST['instructorID'];
$instructorID = 34125;
$testPassword = $_POST['testPassword'];
$overridePassword = $_POST['overridePassword'];


//retreive model Object by TYPE
$model = Test_Model::modelForDailyQuiz($systems);

$model->testID = 0;

/*
echo $model->length." <br />";
foreach($model->num_questions_from_category as $cat => $num){
	echo $cat.": ".$num." <br />";
}		
*/


//new exam object is initialized with the model object's questions/category specifics. 
$newTest = new Exam($model->num_questions_from_category, $instructorID, $testPassword, $overridePassword, $model->course_type, $model->length, $model->testID);



//returns an array of question objects generated from the supplied model.
$questions = array();


$questions = $newTest->generateTest();

//returns json object.  
echo $newTest->inspectTest();




?>