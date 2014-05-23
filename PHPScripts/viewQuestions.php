<?php
include '../Classes/testClass.php';
$spo  = $_POST['spo'];
$variant = $_POST['variant'];


//json object 
echo Question::view_questions($spo, $variant);

?>