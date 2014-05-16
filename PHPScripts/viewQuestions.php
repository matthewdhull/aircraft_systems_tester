<?php
include '../Classes/testClass.php';
$subcategory  = $_POST['subcategory'];
$variant = $_POST['variant'];


//json object 
echo Question::view_questions($subcategory,$variant);

?>