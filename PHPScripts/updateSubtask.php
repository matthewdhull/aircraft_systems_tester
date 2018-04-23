<?php

include '../Classes/subtask.php';

$subtaskId = $_POST['subtaskId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];
$key_verb_id = $_POST['key_verb_id'];


$updated_subtask = new Subtask($number, $name, $description, $key_verb_id);

$updated_subtask->update($subtaskId);

echo 'done';

?>