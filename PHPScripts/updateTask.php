<?php

include '../Classes/Task.php';

$taskId = $_POST['taskId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];
$key_verb_id = $_POST['key_verb_id'];


$updated_task = new Task($number, $name, $description, $key_verb_id);

$updated_task->update($taskId);

echo 'done';

?>