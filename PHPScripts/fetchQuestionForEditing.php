<?php

include '../Classes/testClass.php';

$questionID = $_POST['questionID'];

echo Question::edit_question($questionID);

?>