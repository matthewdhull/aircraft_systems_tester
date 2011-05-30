<?php

include '../Classes/test_model.php';

//returns a json object containing the current amount of questions in the database for a particular category.
echo Test_Model::getCurrentQuestionQuantity();

?>