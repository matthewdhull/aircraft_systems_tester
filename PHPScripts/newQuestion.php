<?php

include '../Classes/testClass.php';

$type = $_POST['type'];
$category = $_POST['category'];
$subcategory = $_POST['subcategory'];
$spo = $_POST['spo'];
$element = $_POST['element'];
$wording_a = $_POST['wording_a'];
$wording_b = $_POST['wording_b'];
$correct_ans = $_POST['correct_ans'];
$alt_correct_ans = $_POST['alt_correct_ans'];
$last_correct_ans = $_POST['last_correct_ans'];
$ans_x = $_POST['ans_x'];
$ans_y = $_POST['ans_y'];
$ans_z = $_POST['ans_z'];

$questionWordingsArr = array($wording_a, $wording_b);
$wrong_ansArr = array($ans_x, $ans_y, $ans_z);

$newQ = new question($type, $category, $subcategory, $spo, $element, $questionWordingsArr, $correct_ans, $alt_correct_ans, $last_correct_ans, $wrong_ansArr);
$newQ->insert_new_question($type);
echo $newQ->json_question();


/*

$jsonObject = array();
$jsonObject = array('type'=>$type, 'category'=>$category, 'subcategory'=>$subcategory, 'spo'=>$spo, 'wording_a'=>$wording_a, 'wording_b'=>$wording_b, 'correct_ans'=>$correct_ans, 'ans_x'=>$ans_x, 'ans_y'=>$ans_y, 'ans_z'=>$ans_z);
echo $jsonObject = json_encode($jsonObject);
*/


?>