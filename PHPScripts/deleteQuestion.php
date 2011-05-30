<?php

include '../Classes/testClass.php';

$questionID = $_POST['questionID'];

echo Question::delete_question($questionID);

?>