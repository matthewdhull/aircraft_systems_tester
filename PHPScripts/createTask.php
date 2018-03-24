<?php

include '../Classes/task.php';

$phaseId = $_POST['phaseId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];



$new_task = new Task($number, $name, $description);
$new_task->createTaskForPhase($phaseId);

echo 'done';

?>