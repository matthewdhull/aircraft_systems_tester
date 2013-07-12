

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


function populateEOsForSPO(spo_id){
	var spo = spo_id;
	var opt = "getEOs";
	var eoList = "";
	$.post("PHPScripts/admin/getReports.php", {
		spo_id: spo,
		option: opt
	}, function(data){
		$.each(data, function(key,value){
			eoList += "<option id="+value.eo_id+" value="+value.eo_id+">"+value.element_name+"</option>";
			
		});
		
	$("#eo option, #edit_eo option").remove();
	$("#eo, #edit_eo").append(eoList);

	}, "json");	
}

//dynamically generates a <select> element list with all ERJ SPOs in the database
function populateERJSPOChoices(){

	var acType="erj";
	var opt = "getErjSpoList";
	var spoList;

	$.post("PHPScripts/admin/getReports.php", {
		acftType: acType,
		option: opt
	}, function(data){
		$.each(data, function(key,value){
			spoList += "<option id="+value.spo_id+" value="+value.spo_id+">"+value.spo_name+"</option>";
		});
		
		$("#spo option, #edit_spo option").remove();
		$("#spo, #edit_spo").append(spoList);
		var spo_id = $("#spo").children(":selected").attr("id");			
		populateEOsForSPO(spo_id);
	}, "json");	
	
	
}



