<?php

include '../Classes/element.php';

$subtaskId = $_POST['subtaskId'];

echo Element::getAllElementsForSubtask($subtaskId);

?>