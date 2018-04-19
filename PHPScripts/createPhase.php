<?php

include '../Classes/phase.php';

$name = $_POST['name'];
$number = $_POST['number'];
$key_verb_id = $_POST['key_verb_id'];


$new_phase = new Phase($number, $name, $key_verb_id);

$new_phase->create();

echo 'done';

?>