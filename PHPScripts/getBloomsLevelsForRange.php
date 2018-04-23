<?php

include '../Classes/blooms.php';

$startLevel = $_POST['startLevel'];
$endLevel = $_POST['endLevel'];

echo Blooms::getLevelsForRange($startLevel, $endLevel);

?>