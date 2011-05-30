<?php

include '../Classes/testClass.php';
$questionID = $_POST['questionID'];
$type = $_POST['type'];
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

$updatedQ = new question($type, NULL, NULL, $questionWordingsArr, $correct_ans, $alt_correct_ans, $last_correct_ans, $wrong_ansArr);
$updatedQ->update_question($questionID);




?>