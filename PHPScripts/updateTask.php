<?php

include '../Classes/Task.php';

$taskId = $_POST['taskId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];


$updated_task = new Task($number, $name, $description);

$updated_task->update($taskId);

echo 'done';

?>