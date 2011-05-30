<?php

include '../Classes/test_model.php';

$testID = $_POST['testID'];

echo Test_Model::removeModelWithID($testID);

?>