
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

// generates an option list for a drop-down menu for the selected dictionary. Intended for embedding options into a <select></select> element.
function populateSystemChoicesWithSystem(system){
	var optionList = "";
	$.each(system, function(key,value){
		optionList += "<option value='"+key+"'>"+value+"</option>";
	});
	
	return optionList;
}

//convenience wrapper for the ERJ Systems option list.
function populateERJSystemChoices(){
		var choices = populateSystemChoicesWithSystem(erjSystems);
		$("#subcategory, #questionCategory, #edit_subcategory").append(choices);
}


//convenience wrapper for the CRJ Systems option list.
function populateCRJSystemChoices(){
		var choices = populateSystemChoicesWithSystem(crjSystems);
		$("#subcategory, #questionCategory, #edit_subcategory").append(choices);
}

