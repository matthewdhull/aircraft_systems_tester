<?php

include '../Classes/subtask.php';

$subtaskId = $_POST['subtaskId'];

Subtask::destroy($subtaskId);

echo 'done';

?>