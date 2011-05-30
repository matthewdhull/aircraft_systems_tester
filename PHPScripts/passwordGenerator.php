<?php

include '../Classes/XJTestDBConnect.php';


$pwd  = "";
$override = "";

$pair = array();

function generateRandStr($length){
      $randstr = "";
      for($i=0; $i<$length; $i++){
         $randnum = mt_rand(0,61);
         if($randnum < 10){
            $randstr .= chr($randnum+48);
         }else if($randnum < 36){
            $randstr .= chr($randnum+55);
         }else{
            $randstr .= chr($randnum+61);
         }
      }
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