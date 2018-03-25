<?php

include '../Classes/phase.php';

$phaseId = $_POST['phaseId'];
$name = $_POST['name'];
$number = $_POST['number'];


$updated_phase = new Phase($number, $name);

$updated_phase->update($phaseId);

echo 'done';

?>