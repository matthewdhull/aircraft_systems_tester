

// The following variables dictionaries that contain the master system category lists for the erj / crj.  
// This dictionary is currently loaded in questionCRUD.php

var questionTypes = {
	"ac":"All Correct",
	"mc":"Multiple Choice",
	"c2":"Multiple Correct",
	"tf":"True/False",
	"nc":"None Correct"
};

var erjSystems = {
	 'air_condition' : "Air Conditioning",
	'acft_gen' : "Aircraft General",
	'apu' : "APU",
	'autopilot' : "Autopilot",
	'crew_awareness' : "Crew Awareness",
	'elec' : "Electrical",
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


function populateEOsForSPO(spo_id, autoselect_eo_id){
	var spo = spo_id;
	var eo = autoselect_eo_id; //auto-select eo for question being edited if desired.
	
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
	$("#edit_eo").val(eo);

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

function tableForQuestion(questionID,type, jta, spo_eo_description, question_a, question_b, correct_ans, alt_correct_ans, last_correct_ans, ans_x, ans_y, ans_z) {
	var html = "";
	var tableContent = "";
	var tdo = "<td>";
	var tdc = "</td>";
	var tro = "<tr>";
	var trc = "</tr>";
	
	var table = $('<table></table>').addClass('singleQuestion').attr('id', "t"+questionID);
	
	tableContent += ("<tr><td><button value='edit' id='e"+questionID+"'>Edit</button><button value='delete' id='d"+questionID+"'>Delete</button></td></tr>");
	tableContent += ("<tr><td>Question Type:</td><td>"+questionTypes[type]+"</td></tr><tr><td>JTA:</td><td>"+jta+"</td></tr><tr><td>SPO-EO:</td><td>"+spo_eo_description+"</td></tr><tr><td>Question Wording A:</td><td>"+question_a+"</td></tr><tr><td>Question Wording B:</td><td>"+question_b+"</td></tr> ");
	
 	if (type != "nc"){
 		tableContent += tro + tdo + "Correct Answer:" + tdc;
 		tableContent += "<td style='background-color:rgb(195,255,199)'>" + correct_ans + tdc + trc;
	}
	
	if (type == "ac" || type == "c2") {
 		tableContent += tro + tdo + "Alternate Correct Answer:" + tdc;
 		tableContent += "<td style='background-color:rgb(195,255,199)'>" + alt_correct_ans + tdc + trc;

		if(type=="ac") {
	 		tableContent += tro + tdo + "Last Correct Answer:" + tdc;
	 		tableContent += "<td style='background-color:rgb(195,255,199)'>" + last_correct_ans + tdc + trc;
		}
	}

	if (type != "ac" && type != "tf"){
 		tableContent += tro + tdo + "Answer X:" + tdc;
 		tableContent += "<td style='background-color:rgb(254,198,201)'>" + ans_x + tdc + trc;
	}

	if (type == "mc" || type == "nc"){
 		tableContent += tro + tdo + "Answer Y:" + tdc;
 		tableContent += "<td style='background-color:rgb(254,198,201)'>" + ans_y + tdc + trc;
 		tableContent += tro + tdo + "Answer Z:" + tdc;
 		tableContent += "<td style='background-color:rgb(254,198,201)'>" + ans_z + tdc + trc;
	}
	
	table.append(tableContent);
	
	return table;

}







