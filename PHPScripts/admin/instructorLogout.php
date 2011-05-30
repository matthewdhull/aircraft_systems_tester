<?php
session_start();
	
	//logout the instructor by unsetting session variables.

	if(isset($_SESSION['employeeNo'])){
		unset($_SESSION['admin']);
		unset($_SESSION['name']);
		unset($_SESSION['message']);
		unset($_SESSION['employeeNo']);
		unset($_SESSION['instructorID']);
	
	}

?>