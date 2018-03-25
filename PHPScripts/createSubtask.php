<?php

include '../Classes/subtask.php';

$taskId = $_POST['taskId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];

$new_subtask = new Subtask($number, $name, $description);
$new_subtask->createSubtaskForTask($taskId);

echo 'done';

?>