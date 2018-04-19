

// The following variables dictionaries that contain the master system category lists for the erj / crj.  
// This dictionary is currently loaded in questionCRUD.php

var questionTypes = {
	"ac":"All Correct",
	"mc":"Multiple Choice",
	"c2":"Multiple Correct",
	"tf":"True/False",
	"nc":"None Correct"
};

function populateSystemChoices(){


	var opt = "getSPOList";
	var spoList;

	$.post("PHPScripts/admin/getReports.php", {
		option: opt
	}, function(data){
		$.each(data, function(key,value){
			spoList += "<option id="+value.spo_id+" value="+value.spo_id+">"+value.spo_name+"</option>";
		});
		
		
		$("#subcategory option, #questionCategory option").remove();
		$("#subcategory, #questionCategory").append(spoList);
		$("#questionCategory").trigger("change");		

	}, "json");	
}

function populateViewSubtaskChoices(){


	var opt = "getSubtasks";
	var spoList;

	$.post("PHPScripts/admin/getReports.php", {
		option: opt
	}, function(data){
		$.each(data, function(key,value){
			spoList += "<option id="+value.id+" value="+value.id+">"+value.name+"</option>";
		});
		
		
		$("#subcategory option, #questionCategory option").remove();
		$("#subcategory, #questionCategory").append(spoList);
		$("#questionCategory").trigger("change");		

	}, "json");	
}

function populateElementsForSubtask(subtask_id, autoselect_element_id){

	var opt = "getElements";
	var elementList = "";
	$.post("PHPScripts/admin/getReports.php", {
		subtaskId: subtask_id,
		option: opt
	}, function(data){
		$.each(data, function(key,value){
			elementList += "<option id="+value.id+" value="+value.id+">"+value.name+"</option>";
			
		});
		
	$("#eo option, #edit_eo option").remove();
	$("#eo, #edit_eo").append(elementList);
	$("#edit_eo").val(autoselect_element_id);  //auto-select eo for question being edited if desired.

	}, "json");	
}

function populateEditSubtaskChoices(){	

	var opt = "getSubtasks";
	var spoList;

	$.post("PHPScripts/admin/getReports.php", {
		option: opt
	}, function(data){
		$.each(data, function(key,value){
			spoList += "<option id="+value.id+" value="+value.id+">"+value.name+"</option>";
		});
		
		$("#spo option, #edit_spo option").remove();
		$("#spo, #edit_spo").append(spoList);
		var spo_id = $("#spo").children(":selected").attr("id");			
		//  populateEOsForSPO(spo_id);
		populateElementsForSubtask(spo_id,null);
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
	tableContent += ("<tr><td>Question Type:</td><td>"+questionTypes[type]+"</td></tr><tr><td>Task Ref No.:</td><td>"+jta+"</td></tr><tr><td>Task-Subtask:</td><td>"+spo_eo_description+"</td></tr><tr><td>Question Wording A:</td><td>"+question_a+"</td></tr><tr><td>Question Wording B:</td><td>"+question_b+"</td></tr> ");
	
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







