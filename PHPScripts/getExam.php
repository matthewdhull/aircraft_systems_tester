<?php

include '../Classes/Exam.php';


$studentEmpNo = $_POST['studentEmpNo'];
$password = $_POST['password'];
$overridePassword = $_POST['overridePassword'];

echo Exam::fetchQuestionsForTest($studentEmpNo, $password, $overridePassword);


?>