<?php

include '../Classes/phase.php';

$name = $_POST['name'];
$number = $_POST['number'];


$new_phase = new Phase($number, $name);

$new_phase->create();

echo 'done';

?>