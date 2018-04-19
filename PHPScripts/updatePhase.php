<?php

include '../Classes/phase.php';

$phaseId = $_POST['phaseId'];
$name = $_POST['name'];
$number = $_POST['number'];
$key_verb_id = $_POST['key_verb_id'];

$updated_phase = new Phase($number, $name, $key_verb_id);

$updated_phase->update($phaseId);

echo 'done';

?>