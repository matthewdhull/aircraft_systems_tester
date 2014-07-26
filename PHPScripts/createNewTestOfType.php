<?php

include '../Classes/test_model.php';
include '../Classes/Exam.php';

$type = $_POST['type'];
$instructorID = $_POST['instructorID'];
$testPassword = $_POST['testPassword'];
$overridePassword = $_POST['overridePassword'];
$variant = 1;


//retreive model Object by TYPE
$model = Test_Model::modelForType($type);


//new exam object is initialized with the model object's questions/category specifics. 
$newTest = new Exam($variant, $model->num_questions_from_category, $instructorID, $testPassword, $overridePassword, $model->course_type, $model->length, $model->testID);


//returns an array of question objects generated from the supplied model.
$questions = array();
$questions = $newTest->generateTest();

//returns json object.  
echo $newTest->inspectTest();



?>