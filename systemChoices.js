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
	'performance' : "Performance",
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
	"11.11.1" : "Description, Equipment and Furnishings",  
	"11.11.6" : "ECS",
	"11.11.16" : "Aural and Visual Warning",
	"11.11.4" : "Electrical",
	"11.11.18" : "Lighting",
	"11.11.17" : "Fire and Overheat Detection",
	"11.11.11" : "Fuel",
	"11.11.7" : "APU",
	"11.11.3" : "Powerplant",
	"11.11.8" : "Hydraulics",
	"11.11.9" : "Landing Gear and Brakes",
	"11.11.10" : "Flight Controls and Stall Protection",
	"11.11.5" : "Pneumatics",
	"11.11.19" : "Ice and Rain Protection",
	"11.11.2" : "Oxygen", 
	"11.11.13" : "Flight Instruments",  
	"11.11.12" : "Communications",
	"11.11.15" : "AFCS",
	"11.11.14" : "Navigation"
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

