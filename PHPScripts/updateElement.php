<?php

include '../Classes/element.php';

$elementId = $_POST['elementId'];
$name = $_POST['name'];
$number = $_POST['number'];
$description = $_POST['description'];


$updated_element = new Element($number, $name, $description);

$updated_element->update($elementId);

echo 'done';

?>