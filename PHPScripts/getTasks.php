<?php


include '../Classes/task.php';

$phaseId = $_POST['phaseId'];

echo Task::getAllTasksForPhase($phaseId);

?>