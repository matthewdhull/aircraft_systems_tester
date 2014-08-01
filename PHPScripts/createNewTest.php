<?php

include '../Classes/test_model.php';
include '../Classes/Exam.php';

$id = $_POST['id'];
$instructorID = $_POST['instructorID'];
$testPassword = $_POST['testPassword'];
$overridePassword = $_POST['overridePassword'];



//retreive model Object by ID
$model = Test_Model::modelWithID($id);


//new exam object is initialized with the model object's questions/category specifics. 
$newTest = new Exam($model->variant, $model->num_questions_from_category, $instructorID, $testPassword, $overridePassword, $model->course_type, $model->length, $model->testID);


//returns an array of question objects generated from the supplied model.
$questions = array();
$questions = $newTest->generateTest();

//returns json object.  
echo $newTest->inspectTest();



?>