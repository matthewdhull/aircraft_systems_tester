<?php

include '../Classes/test_model.php';

$variant = $_POST['variant'];
$course_type = $_POST['course_type'];


echo Test_Model::showModeledTestsFromType($variant, $course_type);


?>