<?php
include '../Classes/testClass.php';
$subcategory  = $_POST['subcategory'];


//json object 
echo Question::view_questions($subcategory);

?>