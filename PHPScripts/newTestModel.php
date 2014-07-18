<?php

include '../Classes/test_model.php';


$course_type = $_POST['course_type'];
$length = $_POST['length'];
$model = $_POST['model'];
$variant = $_POST['variant'];

//instantiate a new test model object and insert the values from testCRUD.html into the database.
$newTestModel = new Test_Model($variant, $course_type, $length, $model);
$newTestModel->create_new_model();



?>