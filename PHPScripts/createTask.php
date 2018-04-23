<?php

include '../Classes/task.php';

$phaseId = $_POST['phaseId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];
$key_verb_id = $_POST['key_verb_id'];



$new_task = new Task($number, $name, $description, $key_verb_id);
$new_task->createTaskForPhase($phaseId);

echo 'done';

?>