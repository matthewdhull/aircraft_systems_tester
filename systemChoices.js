// The following variables dictionaries that contain the master system category lists for the erj / crj.  
// This dictionary is currently loaded in questionCRUD.php
var erjSystems = {
	 'air_condition' : "Air Conditioning",
	'acft_gen' : "Aircraft General",
	'apu' : "APU",
	'autopilot' : "Autopilot",
	'crew_awareness' : "Crew Awareness",
	'elec' : "Electrical",
	'emerg_equip' : "Emergency Equipment",
	'fire_prot' : "Fire Protection",
	'flt_control' : "Flight Controls",
	'fuel' : "Fuel",
	'hydraulics' : "Hydraulics",
	'ice_rain_prot' : "Ice/Rain Protection",
	'ldg_gear_brk' : "Landing Gear/Brakes",
	'lighting' : "Lighting",
	'limitations' : "Limitations",
	'oxy' : "Oxygen",
	'pneum' : "Pneumatics",
	'powerplant' : "Powerplant",
	'pressurization' : "Pressurization",
	'profiles' : "Profiles",
	'radar' : "Radar",
	'stall_prot' : "Stall Protection",
	'mandatory' : "Mandatory"
};						

var crjSystems = {
	'acft_gen' : "Aircraft General",
	'oxy' : "Oxygen",
	'powerplant ' : "Powerplant",
	'elec' : "Electrical",
	'pneum' : "Pneumatics",
	'ecs' : "ECS",
	'ecs ' : "APU",
	'hydraulics' : "Hydraulics",
	'ldg_gear_brk' : "Landing Gear/Brakes",
	'flt_control_stall_prot' : " Flight Controls/Stall Protection",
	'fuel' : "Fuel",
	'comm' : "Communications",
	'flight_instruments' : "Flight Instruments",
	'nav' : "Navigation",
	'afcs' : "AFCS",
	'aural_vis_warn' : "Aural/Visual Warnings",
	'fire_ovht_det' : "Fire /Overheat Detection",
	'lighting' : "Lighting",
	'water_waste' : "Water and Waste",
	'ice_rain' : "Ice/Rain",
	'doors' : "Doors",
};	

var erj_SPO = {
 '9.1.1' : "Airplane Description",
 '9.1.2' : "Equipment and Furnishings",
 '9.1.3' : "Emergency Equipment",
 '9.1.4' : "Crew Awareness System",
 '9.1.5' : "Electrical Systems",
 '9.1.6' : "Lighting Systems",
 '9.1.7' : "Fire Protection Systems",
 '9.1.8' : "Fuel Systems",
 '9.1.9': "Auxiliary Power Unit",
 '9.1.10' : "Powerplant",
 '9.1.11' : "Hydraulic Systems",
 '9.1.12' : "Landing Gear and Brakes",
 '9.1.13' : "Flight Controls",
 '9.1.14' : "Pneumatics Air Conditioning and Pressurization Systems",
 '9.1.15' : "Ice and Rain Systems",
 '9.1.16' : "Oxygen System",
 '9.1.17' : "Flight Instrument Systems",
 '9.1.18' : "Navigation and Communications Systems",
 '9.1.19' : "Autopilot Systems",
 '9.1.20' : "Aircraft Performance and Limitations",
 '9.1.21' : "MEL/CDL/DDP Procedures",
 '10.1.1' : "Perform Emergency/Abnormal Maneuvers",
 '10.1.4' : "Perform Flight Maneuvers",
 '10.1.9' : "Perform TCAS Procedures",
 '11.1.1' : "Weather Avoidance Procedures",
 '11.1.2' : "Perform Windshear Escape Maneuver",
 '11.1.3' : "Flying in Adverse Weather Procedures",
};


function populateSPOChoices(spoDictionary){
	var optionList = "";
	$.each(spoDictionary, function(key,value){
		optionList += "<option value='"+key+"'>"+value+"</option>";
	});
	
	return optionList;
}

// generates an option list for a drop-down menu for the selected dictionary. Intended for embedding options into a <select></select> element.
function populateSystemChoicesWithSystem(system){
	var optionList = "";
	$.each(system, function(key,value){
		optionList += "<option value='"+key+"'>"+value+"</option>";
	});
	
	return optionList;
}

/*
Convenience wrappers for the ERJ/CRJ Systems option list.  This function removes existing choices and replaces them with options appropriate to the 
selected acft type.  These are used in questionCRUD.php.
*/

function populateERJSystemChoices(){
		var choices = populateSystemChoicesWithSystem(erjSystems);
		$("#subcategory option, #questionCategory option, #edit_subcategory option").remove();
		$("#subcategory, #questionCategory, #edit_subcategory").append(choices);
}


function populateCRJSystemChoices(){
		var choices = populateSystemChoicesWithSystem(crjSystems);
		$("#subcategory option, #questionCategory option, #edit_subcategory option").remove();		
		$("#subcategory, #questionCategory, #edit_subcategory").append(choices);
}

function populateERJSPOChoices(){
	var choices = populateSPOChoices(erj_SPO);
	$("#spo option, #edit_spo option").remove();
	$("#spo, #edit_spo").append(choices);
	
}

