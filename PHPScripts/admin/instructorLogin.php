<?php

session_start();
session_cache_limiter('nocache');


$employeeNo = $_POST['employeeNo'];
$loginPassword = $_POST['loginPassword'];
$loginMessages = array();


//if the instructor is already logged in, return the session variables. 
if(isset($_SESSION['name'])){
	$loginMessages['message'] = "You are logged in as ".$_SESSION['name']."";
	$loginMessages['loggedIn'] = true;
	$loginMessages['admin'] = $_SESSION['admin'];
	$loginMessages['instructorID'] =  $_SESSION['instructorID'];
	$loginMessages['employeeNo'] = $_SESSION['employeeNo'];
	$loginMessages['name'] = $_SESSION['name'];
	
}



elseif(!isset($_SESSION['name'])) {
	$loginMessages['loggedIn'] = false;
		
	if($employeeNo && $loginPassword) {
	
		include '../../Classes/XJTestDBConnect.php';
		
		$con = mysql_connect($host,$usn, $password);
		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);	
		
		$loginQuery = "SELECT `instructorID`, `employeeNo`, `password` , `firstName`, `lastName`, `admin` FROM `instructors` WHERE `employeeNo` = '".$employeeNo."'";
		$loginResult = mysql_query($loginQuery);
		
		if (!$loginResult) {
	    	echo "Could not successfully run query ($loginQuery) from DB: " . mysql_error();
		}
	
		if (mysql_num_rows($loginResult) == 0) {
	    	//echo "No username record found.  Only registered users can login";
	    	$loginMessages['message'] = "No instructor record found. Only registered users can login";
	    	$loginMessages['loggedIn'] = false;
		}
	
		if (mysql_num_rows($loginResult) > 0) {
			//echo "User found";
			
			while($row = mysql_fetch_array($loginResult)) {

				//check input password against stored password
				$retrievedPassword = $row['password'];
				if($loginPassword == $retrievedPassword){
					$_SESSION['name'] = $row['firstName']." ".$row['lastName'];
					$_SESSION['instructorID'] = $row['instructorID'];
					$_SESSION['employeeNo'] = $row['employeeNo'];
					
					if($row['admin'] == 1){
						$_SESSION['admin'] = true;
					}
					elseif($row['admin'] == 0){
						$_SESSION['admin'] = false;
					}
					
					$loginMessages['message'] = "You are logged in as ".$_SESSION['name']."";
					$loginMessages['loggedIn'] = true;
					$loginMessages['name'] = $_SESSION['name'];
					$loginMessages['admin'] = $_SESSION['admin'];
					$loginMessages['employeeNo'] = $_SESSION['employeeNo'];
				}
				
				else {
					//echo "the username/password combination not found";
					$loginMessages['message'] = "the username/password combination not found";
					$loginMessages['loggedIn'] = false;
				}
				
			}
		}

		
	
	}
	
	else {
		//Echo "Please enter a username and password";	
		$loginMessages['message'] = "Please enter a username and password";
		$loginMessages['loggedIn'] =  false;
		
	}
}


//pass error messages to the client through JSON.  \
echo $loginMessages = json_encode($loginMessages);





?>