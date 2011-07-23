<!DOCTYPE HTML>
<html>
<head>
	<title>Question Modeling</title>
	
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
	<script src="systemChoices.js"></script>
	<style type='text/css'>
		@import url("CSS/questionCRUD.css");
	</style>
	
	<?php
		include 'Classes/contentClass.php';
		ContentSnippets::showFavicon();
	?>
		
	<script type="text/javascript">
		$(document).ready(function(){
		
			var EDIT = "edit";
			var CREATE = "create";
			var isAdmin = false;
			var switchPosition = "CREATE";
			var currentSubcategory = "none";
			
			$("#adminAreaOnly").css("visibility", "hidden");
		
			function clearScreenForLogout(){
				$("body").html("You are not logged in or do not possess privileges for this area.");
			}
			
			
			function checkLoginStatus(){
			
				$.post("PHPScripts/admin/instructorLogin.php",
					 function(data){
						isAdmin = data.admin;
						if(data.loggedIn == true){
							if(isAdmin == true){
								$("#adminAreaOnly").css("visibility", "visible");
							}
						}
						else{
							clearScreenForLogout();
						}
					}, "json");
			}

			
			$("#submit_new_question_button").click(function(){
				var questionType = $("#type").val();
				var cat = $("#category").val();
				var subcat = $("#subcategory").val();
				var question_text = $("#question_text").val();
				var alternate_wording = $("#alternate_wording").val();
				var corr_ans = $("#correct_ans").val();
				var alt_corr_ans = $("#alt_correct_ans").val();
				var last_corr_ans = $("#last_correct_ans").val();
				var incorrect_x = $("#incorrect_ans_x").val();
				var incorrect_y = $("#incorrect_ans_y").val();
				var incorrect_z = $("#incorrect_ans_z").val(); 

				$.post("PHPScripts/newQuestion.php", {
					type: questionType,
					category: cat,
					subcategory: subcat,
					wording_a: question_text,
					wording_b: alternate_wording,
					correct_ans: corr_ans,
					alt_correct_ans: alt_corr_ans,
					last_correct_ans: last_corr_ans,
					ans_x: incorrect_x,
					ans_y: incorrect_y,
					ans_z: incorrect_z
				}, function(data){
				}, "json");
				
				$("#question_text, #alternate_wording, #correct_ans, #alt_correct_ans, #last_correct_ans, #incorrect_ans_x, #incorrect_ans_y,#incorrect_ans_z").val(""); 
				return false;
		});
		
		//short variables names for the various table elements
		var ccAnsL = $("#correct_ansLabel");
		var ccAns = $("#correct_ans");
		var caAnsL = $("#alt_correct_ansLabel");
		var caAns = $("#alt_correct_ans");
		var clAnsL = $("#last_correct_ansLabel");
		var clAns = $("#last_correct_ans");
		var ciAnsXL = $("#incorrect_ans_xLabel");
		var ciAnsX = $("#incorrect_ans_x");
		var ciAnsYL = $("#incorrect_ans_yLabel");
		var ciAnsY = $("#incorrect_ans_y");
		var ciAnsZL = $("#incorrect_ans_zLabel");
		var ciAnsZ = $("#incorrect_ans_z");
		
		var ecAnsL = $("#edit_correct_ansLabel");
		var ecAns = $("#edit_correct_ans");
		var eaAnsL = $("#edit_alt_correct_ansLabel");
		var eaAns = $("#edit_alt_correct_ans");
		var elAnsL = $("#edit_last_correct_ansLabel");
		var elAns = $("#edit_last_correct_ans");
		var eiAnsXL = $("#edit_incorrect_ans_xLabel");
		var eiAnsX = $("#edit_incorrect_ans_x");
		var eiAnsYL = $("#edit_incorrect_ans_yLabel");
		var eiAnsY = $("#edit_incorrect_ans_y");
		var eiAnsZL = $("#edit_incorrect_ans_zLabel");
		var eiAnsZ = $("#edit_incorrect_ans_z");
		
		
	
	function bindEditEvents(){
			$("#questions_from_subcategory :button").click(function(){
					//pull the questionID from the edit or delete button. Example id: "d25", or "e25".
					var qID = $(this).attr("id");
					var noLetterID = qID.substr(1);
					var idNumber = parseInt(noLetterID);
			
				if($(this).html()=="Edit"){				
					$("#editTitle").click(); //trigger edit mode.
			
					//remove all questions that are displayed and pre-fill the form with current question information.
					$("#questions_from_subcategory table").remove();
					$("#editID").val(idNumber);
						$.post("PHPScripts/fetchQuestionForEditing.php", {
							questionID: idNumber
						}, function(data){
							//console.log(data);
							$.each(data, function(key, value){
								$("#edit_type").val(value.type).trigger("change");
								$("#edit_subcategory").val(value.subcategory);
								$("#edit_question_text").val(value.question_a);
								$("#edit_alternate_wording").val(value.question_b);
								$("#edit_correct_ans").val(value.correct_answer);
								$("#edit_alt_correct_ans").val(value.alt_correct_answer);						
								$("#edit_last_correct_ans").val(value.last_correct_answer);						
								$("#edit_incorrect_ans_x").val(value.ans_x);
								$("#edit_incorrect_ans_y").val(value.ans_y);
								$("#edit_incorrect_ans_z").val(value.ans_z);
							});
						}, "json");			
					}
					
					else if($(this).html()=="Delete"){
						//get id of parent table so that it is removed in the callback function.
						var tableID = "#t"+idNumber;
						//console.log("tableID: "+tableID);
						var tableToRemove = $(tableID);
						
						$.post("PHPScripts/deleteQuestion.php", {
							questionID: idNumber
						}, function(data){
							$(tableToRemove).remove();
						},"json");
						
					}
				return false;
			});
		}
		
		
		
		
		
		$("#view_questions_button").click(function(){
			
				var questionCategory = $("#questionCategory").val();
				currentSubcategory = questionCategory;
				$("#questions_from_subcategory table").remove();
			$.post("PHPScripts/viewQuestions.php", {
				subcategory: questionCategory
			}, function(data) {
		 		$.each(data, function(key,value){
	 				$("#questions_from_subcategory").append("<table class='singleQuestion' id='t"+value.questionID+"'><tr><td><button value='edit' id='e"+value.questionID+"'>Edit</button><button value='delete' id='d"+value.questionID+"'>Delete</button></td></tr><tr><td>Question Type:</td><td>"+value.type+"</td></tr><tr><td>Question Wording A:</td><td>"+value.question_a+"</td></tr><tr><td>Question Wording B:</td><td>"+value.question_b+"</td></tr><tr><td>Correct Answer:</td><td>"+value.correct_answer+"</td></tr><tr><td>Alternate Correct Answer:</td><td>"+value.alt_correct_answer+"</td></tr><tr><td>Last Correct Answer:</td><td>"+value.last_correct_answer+"</td></tr><tr><td>Answer X:</td><td>"+value.ans_x+"</td></tr><tr><td>Answer Y:</td><td>"+value.ans_y+"</td></tr><tr><td>Answer Z:</td><td>"+value.ans_z+"</td></tr></table>");
	 			});
	 			
	 			//allows user to click 'edit' button and edit question information.
	 			bindEditEvents();
				
			}, "json");
			
			return false;
		
		});
		
		
		$("#edit_question_button").click(function(){
			var qID =  $("#editID").val();
			var tp = $("#edit_type").val();
			var sc = $("#edit_subcategory").val();
			var newText = $("#edit_question_text").val();
			var newAltnText = $("#edit_alternate_wording").val();
			var newCorrectAns = $("#edit_correct_ans").val();
			var newAltCorrectAns = $("#edit_alt_correct_ans").val();
			var newLastCorrectAns = $("#edit_last_correct_ans").val();
			var newIncorrectAnsX = $("#edit_incorrect_ans_x").val();
			var newIncorrectAnsY = $("#edit_incorrect_ans_y").val();
			var newIncorrectAnsZ = $("#edit_incorrect_ans_z").val();
			
			$.post("PHPScripts/updateQuestion.php",{
				questionID: qID,
				type: tp,
				subcategory: sc,
				wording_a: newText,
				wording_b: newAltnText,
				correct_ans: newCorrectAns,
				alt_correct_ans: newAltCorrectAns,
				last_correct_ans: newLastCorrectAns,
				ans_x: newIncorrectAnsX,
				ans_y: newIncorrectAnsY,
				ans_z:newIncorrectAnsZ
			});
			$("#editID").val("");
			$("#edit_question_text").val("");
			$("#edit_alternate_wording").val("");
			$("#edit_correct_ans").val("");
			$("#edit_alt_correct_ans").val("");
			$("#edit_last_correct_ans").val("");			
			$("#edit_incorrect_ans_x").val("");
			$("#edit_incorrect_ans_y").val("");
			$("#edit_incorrect_ans_z").val("");
			

			return false;
		});
					
		$("#edit_type").change(function(){

			if($(this).val()=="tf"){
				ecAnsL.css("visibility", "visible");
				ecAns.css("visibility", "visible");
				eaAnsL.css("visibility", "hidden");
				eaAns.css("visibility", "hidden");
				elAnsL.css("visibility", "hidden");
				elAns.css("visibility", "hidden");
				eiAnsXL.css("visibility", "hidden");
				eiAnsX.css("visibility", "hidden");
				eiAnsYL.css("visibility", "hidden");
				eiAnsY.css("visibility", "hidden");
				eiAnsZL.css("visibility", "hidden");
				eiAnsZ.css("visibility", "hidden");
				$("#edit_correct_ans").replaceWith("<select id='edit_correct_ans' name='edit_correct_ans'><option value='TRUE'>TRUE</option><option value='FALSE'>FALSE</option></select>");
			}
			
			else if($(this).val()=="mc"){
				ecAnsL.css("visibility", "visible");
				ecAns.css("visibility", "visible");
				eaAnsL.css("visibility", "hidden");
				eaAns.css("visibility", "hidden");
				elAnsL.css("visibility", "hidden");
				elAns.css("visibility", "hidden");
				eiAnsXL.css("visibility", "visible");
				eiAnsX.css("visibility", "visible");
				eiAnsYL.css("visibility", "visible");
				eiAnsY.css("visibility", "visible");
				eiAnsZL.css("visibility", "visible");
				eiAnsZ.css("visibility", "visible");
				$("#edit_correct_ans").replaceWith("<input type='text' id='edit_correct_ans' name='edit_correct_ans' size='50'></input>");
			}
			
			else if($(this).val()=="c2"){
				ecAnsL.css("visibility", "visible");
				ecAns.css("visibility", "visible");
				eaAnsL.css("visibility", "visible");
				eaAns.css("visibility", "visible");
				elAnsL.css("visibility", "hidden");
				elAns.css("visibility", "hidden");
				eiAnsXL.css("visibility", "visible");
				eiAnsX.css("visibility", "visible");
				eiAnsYL.css("visibility", "hidden");
				eiAnsY.css("visibility", "hidden");
				eiAnsZL.css("visibility", "hidden");
				eiAnsZ.css("visibility", "hidden");
				$("#edit_correct_ans").replaceWith("<input type='text' id='edit_correct_ans' name='edit_correct_ans' size='50'></input>");
			}
			else if($(this).val()=="ac"){
				ecAnsL.css("visibility", "visible");
				ecAns.css("visibility", "visible");
				eaAnsL.css("visibility", "visible");
				eaAns.css("visibility", "visible");
				elAnsL.css("visibility", "visible");
				elAns.css("visibility", "visible");
				eiAnsXL.css("visibility", "hidden");
				eiAnsX.css("visibility", "hidden");
				eiAnsYL.css("visibility", "hidden");
				eiAnsY.css("visibility", "hidden");
				eiAnsZL.css("visibility", "hidden");
				eiAnsZ.css("visibility", "hidden");
			
				$("#edit_correct_ans").replaceWith("<input type='text' id='edit_correct_ans' name='edit_correct_ans' size='50'></input>");
			}			
			else if($(this).val()=="nc"){
				ecAnsL.css("visibility", "hidden");
				$("#edit_correct_ans").css("visibility", "hidden");
				eaAnsL.css("visibility", "hidden");
				eaAns.css("visibility", "hidden");
				elAnsL.css("visibility", "hidden");
				elAns.css("visibility", "hidden");
				eiAnsXL.css("visibility", "visible");
				eiAnsX.css("visibility", "visible");
				eiAnsYL.css("visibility", "visible");
				eiAnsY.css("visibility", "visible");
				eiAnsZL.css("visibility", "visible");
				eiAnsZ.css("visibility", "visible");
			}
	
			
		});
		
		$("#type").change(function(){
			if($(this).val()=="tf"){
				$("#correct_ansLabel").css("visibility", "visible");
				$("#correct_ans").css("visibility", "visible");
				$("#alt_correct_ansLabel").css("visibility", "hidden");
				$("#alt_correct_ans").css("visibility", "hidden");
				$("#last_correct_ansLabel").css("visibility", "hidden");
				$("#last_correct_ans").css("visibility", "hidden");
				$("#incorrect_ans_xLabel").css("visibility", "hidden");
				$("#incorrect_ans_x").css("visibility", "hidden");
				$("#incorrect_ans_yLabel").css("visibility", "hidden");
				$("#incorrect_ans_y").css("visibility", "hidden");
				$("#incorrect_ans_zLabel").css("visibility", "hidden");
				$("#incorrect_ans_z").css("visibility", "hidden");
				$("#correct_ans").replaceWith("<select id='correct_ans' name='correct_ans'><option value='TRUE'>TRUE</option><option value='FALSE'>FALSE</option></select>");
			}
			
			else if($(this).val()=="mc"){
				$("#correct_ansLabel").css("visibility", "visible");
				$("#correct_ans").css("visibility", "visible");
				$("#alt_correct_ansLabel").css("visibility", "hidden");
				$("#alt_correct_ans").css("visibility", "hidden");
				$("#last_correct_ansLabel").css("visibility", "hidden");
				$("#last_correct_ans").css("visibility", "hidden");
				$("#incorrect_ans_xLabel").css("visibility", "visible");
				$("#incorrect_ans_x").css("visibility", "visible");
				$("#incorrect_ans_yLabel").css("visibility", "visible");
				$("#incorrect_ans_y").css("visibility", "visible");
				$("#incorrect_ans_zLabel").css("visibility", "visible");
				$("#incorrect_ans_z").css("visibility", "visible");
			
				$("#correct_ans").replaceWith("<input type='text' id='correct_ans' name='correct_ans' size='50'></input>");
			}
			
			else if($(this).val()=="c2"){
				ccAnsL.css("visibility", "visible");
				ccAns.css("visibility", "visible");
				caAnsL.css("visibility", "visible");
				caAns.css("visibility", "visible");
				clAnsL.css("visibility", "hidden");
				clAns.css("visibility", "hidden");
				ciAnsXL.css("visibility", "visible");
				ciAnsX.css("visibility", "visible");
				ciAnsYL.css("visibility", "hidden");
				ciAnsY.css("visibility", "hidden");
				ciAnsZL.css("visibility", "hidden");
				ciAnsZ.css("visibility", "hidden");
				$("#correct_ans").replaceWith("<input type='text' id='correct_ans' name='correct_ans' size='50'></input>");
			}
			
			else if($(this).val()=="ac"){
				ccAnsL.css("visibility", "visible");
				ccAns.css("visibility", "visible");
				caAnsL.css("visibility", "visible");
				caAns.css("visibility", "visible");
				clAnsL.css("visibility", "visible");
				clAns.css("visibility", "visible");
				ciAnsXL.css("visibility", "hidden");
				ciAnsX.css("visibility", "hidden");
				ciAnsYL.css("visibility", "hidden");
				ciAnsY.css("visibility", "hidden");
				ciAnsZL.css("visibility", "hidden");
				ciAnsZ.css("visibility", "hidden");
				$("#correct_ans").replaceWith("<input type='text' id='correct_ans' name='correct_ans' size='50'></input>");

			}
			
			else if($(this).val()=="nc"){
				ccAnsL.css("visibility", "hidden");
				$("#correct_ans").css("visibility", "hidden");
				caAnsL.css("visibility", "hidden");
				caAns.css("visibility", "hidden");
				clAnsL.css("visibility", "hidden");
				clAns.css("visibility", "hidden");
				ciAnsXL.css("visibility", "visible");
				ciAnsX.css("visibility", "visible");
				ciAnsYL.css("visibility", "visible");
				ciAnsY.css("visibility", "visible");
				ciAnsZL.css("visibility", "visible");
				ciAnsZ.css("visibility", "visible");
			}

		});
		
		$("#editTitle").click(function(){
			$(this).css("color", "#00d36c");
			$("#createTitle").css("color", "#d9d9d9");
			$("#editQuestionArea").css("visibility", "visible");
			$("#createQuestionArea").css("visibility", "hidden");
			$("#switch").animate({"margin-left": '71px'}, 'fast');
			$("#arrow").removeClass("arrow-left").addClass("arrow-right").css("margin-left", "8px");
			$("#createQuestionArea *").css("visibility", "hidden");
			$("#editQuestionArea *").css("visibility", "visible");
			$("#edit_type").trigger("change");
			switchPosition = "EDIT";
		});
		
		$("#createTitle").click(function(){
			$(this).css("color", "#00d36c");
			$("#editTitle").css("color", "#d9d9d9");
			$("#createQuestionArea").css("visibility", "visible");
			$("#editQuestionArea").css("visibility", "hidden");
			$("#switch").animate({"margin-left": '2px'},'fast');
			$("#arrow").removeClass("arrow-right").addClass("arrow-left").css("margin-right", "6px");
			$("#editQuestionArea *").css("visibility", "hidden");
			$("#createQuestionArea *").css("visibility", "visible");
			$("#type").trigger("change");
			switchPosition = "CREATE";
		
		});

		function toggleSwitch(){
			if(switchPosition == "CREATE"){
				$("#editTitle").click();
			}
			else if(switchPosition == "EDIT"){
				$("#createTitle").click();
			}
		}
				
		$("#toggleSwitch").click(function(){
			toggleSwitch();
		});
		
		
		$("#type").trigger("change");
		
		

		checkLoginStatus();
		populateERJSystemChoices();		
		
	});
	
	
		
	</script>

	
</head>
<body>
	<?php
		ContentSnippets::doHeader();
		ContentSnippets::doNavigationBar();
	?>
	<div id="adminAreaOnly">
		<div id="questionCUDArea"
			<div id="toggleEditModeArea">
				<h4 id="createTitle">CREATE</h4>
				<div id="toggleSwitch">
					<div id="switch">
						<div id="arrow" class="arrow-left"></div>
					</div>
				</div>
				<h4 id="editTitle">EDIT</h4>
			</div>
			<div id="createQuestionArea"
				<form id="new_question_form" action="" method="post">
					<table>
						<tr>
							<td>Type: </td>
							<td><select id="type" name="type">
								<option value="tf">true/false</option>
								<option value="mc">multiple choice</option>
								<option value="c2">multiple correct</option>
								<option value="ac">all correct</option>
								<option value="nc">none correct</option>
								</select>
							</td>
						</tr>
				
						<tr>
							<td>Category:</td>
							<td> <select id="category" name="category">
								<option value="systems">systems</option>
								<option value="flt_ops">flight ops</option>
							</select>
							</td>
						</tr>
						<tr>
							<td>Subcategory: </td>
							<td> <select id="subcategory" name="subcategory">
									<?php /* auto-populated with system choices. */ ?>
								</select> 
							</td>
						</tr>
						
					</table>
					<table>
					
						<tr>
							<td><label id="question_textLabel" for="question_text">Question Text</label></td>
						</tr>
						<tr>
							<td><textarea id="question_text" name="question_text"></textarea></td>
						</tr>
						<tr>
							<td><label id="alternate_wordingLabel" for="alternate_wording">Alternate Question Wording (optional)</label></td>	
						</tr>
						<tr>
							<td><textarea id="alternate_wording" name="alternate_wording"></textarea></td>
						</tr>
						<tr>
							<td><label id="correct_ansLabel" for="correct_ans">Correct Answer</label></td>
						</tr>
						<tr>
							<td><input type="text" id="correct_ans" name="correct_ans" ></input></td>
						</tr>
						<tr>
							<td><label id="alt_correct_ansLabel" for="alt_correct_ans">Alternate Correct Answer</label></td>
						</tr>
						<tr>
							<td><input type="text" id="alt_correct_ans" name="alt_correct_ans" ></input></td>
						</tr>
						<tr>
							<td><label id="last_correct_ansLabel" for="last_correct_ans">Last Correct Answer</label></td>
						</tr>
						<tr>
							<td><input type="text" id="last_correct_ans" name="last_correct_ans" ></input></td>
						</tr>
						<tr>
							<td><label id="incorrect_ans_xLabel" for="incorrect_ans_x">Incorrect Answer X</label></td>
						</tr>
						<tr>
							<td><input type="text" id="incorrect_ans_x" name="incorrect_ans_x" ></input></td>
						</tr>
						<tr>
							<td><label id="incorrect_ans_yLabel" for="incorrect_ans_y">Incorrect Answer Y</label></td>
						</tr>
						<tr>
							<td><input type="text" id="incorrect_ans_y" name="incorrect_ans_y" ></input></td> 
						</tr>
						<tr>
							<td><label id="incorrect_ans_zLabel"  for="incorrect_ans_z">Incorrect Answer Z</label></td>
						</tr>
						<tr>
							<td><input type="text" id="incorrect_ans_z" name="incorrect_ans_z" ></input></td>
						</tr>
						<tr>
							<td><input id="submit_new_question_button" type="submit" name="submit" value="submit"></input></td>					
						</tr>
						</table>
						
				</form>
				
			</div>  <!-- end of create question div -->
			<div id="editQuestionArea">
				<form id="edit_question_form" method="post" action="">
					<table>
						<tr>
							<td>Type: </td>
							<td><select id="edit_type" name="type">
									<option value="tf">true/false</option>
									<option value="mc">multiple choice</option>
									<option value="c2">multiple correct</option>
									<option value="ac">all correct</option>
									<option value="nc">none correct</option>
								</select>
							</td>
						</tr>
						<tr>
							<td>Subcategory: </td>
							<td><select id="edit_subcategory">
								<?php /*Pre-populated with options*/ ?>
							</select></td>
						</tr>
					</table>
					<table>
						<tr>
							<td><label id="edit_question_textLabel" for="edit_question_text">Question Text</label></td>	
						</tr>
						<tr>
							<td><textarea id="edit_question_text" name="edit_question_text"></textarea></td>
						</tr>
						<tr>
							<td><label id="edit_alternate_wordingLabel" for="edit_alternate_wording">Alternate Question Wording (optional)</label></td>
						</tr>
						<tr>
							<td><textarea id="edit_alternate_wording" name="edit_alternate_wording" ></textarea></td>
						</tr>
						<tr>
							<td><label id="edit_correct_ansLabel" for="edit_correct_ans">Correct Answer</label></td>
						</tr>
						<tr>
							<td><input type="text" id="edit_correct_ans" name="edit_correct_ans" ></input></td>
						</tr>
						<tr>
							<td><label id="edit_alt_correct_ansLabel" for="edit_alt_correct_ans">Alternate Correct Answer</label></td>
						</tr>
						<tr>
							<td><input type="text" id="edit_alt_correct_ans" name="edit_alt_correct_ans" ></input></td>
						</tr>
						<tr>
							<td><label id="edit_last_correct_ansLabel" for="edit_last_correct_ans">Alternate Correct Answer</label></td>
						</tr>
						<tr>
							<td><input type="text" id="edit_last_correct_ans" name="edit_last_correct_ans" ></input></td>
						</tr>
						<tr>
							<td><label id="edit_incorrect_ans_xLabel" for="edit_incorrect_ans_x">Incorrect Answer X</label></td>
						</tr>
						<tr>
							<td><input type="text" id="edit_incorrect_ans_x" name="edit_incorrect_ans_x" ></input></td>
						</tr>
						<tr>
							<td><label id="edit_incorrect_ans_yLabel" for="edit_incorrect_ans_y">Incorrect Answer Y</label></td>
						</tr>
						<tr>
							<td><input type="text" id="edit_incorrect_ans_y" name="edit_incorrect_ans_y" ></input></td>
						</tr>
						<tr>
							<td><label id="edit_incorrect_ans_zLabel" for="edit_incorrect_ans_z">Incorrect Answer Z</label></td>
						</tr>
						<tr>
							<td><input type="text" id="edit_incorrect_ans_z" name="edit_incorrect_ans_z" ></input></td>
						</tr>
						<tr>
							<td><input id="edit_question_button" type="submit" name="update" value="update"></input></td>					
						</tr>
					</table>
				</form>
			</div>	
		</div>
		<div id="questionViewingArea">
			<a name="view_questions">View Question</a> 
			<form id="view_question_form" action="" method="post">
				<input type="hidden" id="editID" value="" name=""></input>
				<table>
					<tr>
						<td>Subcategory: </td>
						<td> <select id="questionCategory" name="questionCategory">
							<?php /* auto-populated with system choices. */ ?>
							</select> 
						</td>
					</tr>
					<tr>
						<td><input id="view_questions_button" type="submit" value="view questions" name="view_questions" /></td>
					</tr>
				</table>
			</form>
			<div id="questions_from_subcategory">
				<!--	<table>
							<tr>
								<td>Edit:</td><td>value.questionID</td>				
							</tr>
							<tr>
								<td>Question Wording A:</td><td>value.question_a</td>				
							</tr>
							<tr>
								<td>Question Wording B:</td><td>value.question_b</td>				
							</tr>
							<tr>
								<td>Correct Answer:</td><td>value.correct_answer</td>				
							</tr>
							<tr>
								<td>Answer X:</td><td>value.ans_x</td>				
							</tr>
							<tr>
								<td>Answer Y:</td><td>value.ans_y</td>				
							</tr>
							<tr>
								<td>Answer Z:</td><td>value.ans_z</td>				
							</tr>
						</table>
				-->
					
			</div>
		
		</div>
	</div>
</body>
</html>
