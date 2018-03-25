<?php

include '../Classes/subtask.php';

$taskId = $_POST['taskId'];

echo Subtask::getAllSubtasksForTask($taskId);

?>