<?php

include '../Classes/Subtask.php';

$subtaskId = $_POST['subtaskId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];


$updated_subtask = new Subtask($number, $name, $description);

$updated_subtask->update($subtaskId);

echo 'done';

?>