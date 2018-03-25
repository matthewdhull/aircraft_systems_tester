<?php

include '../Classes/phase.php';

$phaseId = $_POST['phaseId'];

Phase::destroy($phaseId);

echo 'done';

?>