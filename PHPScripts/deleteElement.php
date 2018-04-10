<?php

include '../Classes/element.php';

$elementId = $_POST['elementId'];

Element::destroy($elementId);

echo 'done';

?>