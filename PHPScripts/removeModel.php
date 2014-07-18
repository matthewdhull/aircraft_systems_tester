<?php

include '../Classes/test_model.php';

$test_model_id = $_POST['test_model_id'];

echo Test_Model::removeModelWithID($test_model_id);

?>