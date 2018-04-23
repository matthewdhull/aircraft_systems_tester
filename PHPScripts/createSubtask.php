<?php

include '../Classes/subtask.php';

$taskId = $_POST['taskId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];
$key_verb_id = $_POST['key_verb_id'];

$new_subtask = new Subtask($number, $name, $description, $key_verb_id);
$new_subtask->createSubtaskForTask($taskId);

echo 'done';

?>