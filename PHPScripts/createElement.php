<?php

include '../Classes/element.php';

$subtaskId = $_POST['subtaskId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];

$new_element = new Element($number, $name, $description);
$new_element->createElementForSubtask($subtaskId);

echo 'done';

?>