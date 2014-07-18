<?php

include '../Classes/test_model.php';

//returns a json object containing the current amount of questions in the database for a particular SPO on a variant/fleet type.
//echo Test_Model::getCurrentQuestionQuantity();

//erj or crj
$variant = $_POST['variant'];


echo Test_Model::getQuestionQuantityForSPO($variant);

?>