<?php

include '../Classes/XJTestDBConnect.php';


$pwd  = "";
$override = "";

$pair = array();


function generateRandStr($length){
	$randstr = "";
	$numbers = "";
	$letters = "";
	for ($i = 0; $i < ($length/2); $i++){
		$numbers .= chr(mt_rand(48,57));
	}
	for ($i = 0; $i < ($length/2); $i++){
		$letters .= chr(mt_rand(97,122));
	}
	
	$randstr = $numbers.$letters;
	return $randstr;
}



$con = mysql_connect($host, $usn, $password);

if(!$con){
	die("could not connect: ".mysql_error());
}
//generate random password and check it against used passwords to ensure that it is unique.
mysql_select_db($database, $con);
for($i=0; $i<10000; $i++){
	$pwd = generateRandStr(8);
	$override = generateRandStr(8);
	$checkNewPassword = "SELECT testPassword from createdTests where testPassword = '".$pwd."'";        
	$equalPwd = mysql_query($checkNewPassword);
	if(!$equalPwd){
		die ("could not run query ($checkNewPassword) ".mysql_error());
	}
	if(mysql_num_rows($equalPwd) == 0){
		$pair['password'] = $pwd;
		$pair['override'] = $override;
		break;
	}
}

mysql_close($con);	

$pair = json_encode($pair);
echo $pair;
?>