<?php

include '../Classes/test_model.php';


$course_type = $_POST['course_type'];
$length = $_POST['length'];

$systems = array('air_condition' => $_POST['air_condition'],'acft_gen' => $_POST['acft_gen'],'apu' => $_POST['apu'],'autopilot' => $_POST['autopilot'],'crew_awareness' =>$_POST['crew_awareness'],'elec' => $_POST['elec'],'emerg_equip' => $_POST['emerg_equip'],'fire_prot' => $_POST['fire_prot'],'flt_control' => $_POST['flt_control'],'fuel'=> $_POST['fuel'],'hydraulics' => $_POST['hydraulics'],'ice_rain_prot' => $_POST['ice_rain_prot'],'ldg_gear_brk' => $_POST['ldg_gear_brk'],'lighting' => $_POST['lighting'],'limitations' => $_POST['limitations'],'oxy' => $_POST['oxy'],'performance' => $_POST['performance'], 'pneum' => $_POST['pneum'],'powerplant' => $_POST['powerplant'],'pressurization' => $_POST['pressurization'],'profiles' => $_POST['profiles'],'radar' => $_POST['radar'],'stall_prot' => $_POST['stall_prot'], 'mandatory' => $_POST['mandatory']);


//used to view passed parameters.
/*
echo $course_type."<br />";
echo $length."<br />";
foreach($systems as $k => $v){
	echo $k.": ".$v."<br />";
}
*/

//instantiate a new test model object and insert the values from testCRUD.html into the database.
$newTestModel = new Test_Model($course_type, $length, $systems);
$newTestModel->create_new_model();
?>