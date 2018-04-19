<?php

include '../Classes/blooms.php';

$ordinality = $_POST['ordinality'];

echo Blooms::getKeyVerbsForLevel($ordinality);

?>