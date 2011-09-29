<?php

	//offline connection info.
	$usn = 'root';
	$password = 'root';
	$database = 'xjtest';
	$host = 'localhost';
	
/*
	
	//online connection info	
	$host = 'mdhblog.db'; 
	$usn = 'gv3zF'; 
	$password = 'p3rn1c10uzSquId'; 
	$database = 'xjtest';
	
*/

	function getConnection(){
		//$con = mysql_connect($host,$usn, $password);
		$con = mysql_connect('localhost','root', 'root');		

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db('xjtest', $con);
		return $con;
	}

?>
