<?php

include '../Classes/task.php';

$taskId = $_POST['taskId'];

Task::destroy($taskId);

echo 'done';

?>