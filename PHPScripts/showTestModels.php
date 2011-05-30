<?php

include '../Classes/test_model.php';

$model = $_POST['model'];

echo Test_Model::showModeledTestsFromType($model);

?>