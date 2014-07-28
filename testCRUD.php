<!DOCTYPE html>
<html>

	<head>
		
		<title></title>
		
						
			<meta http-equiv="content-type" content="text/html; charset=UTF-8">
			
			<style type='text/css'>
				@import url("CSS/testCRUD.css");
			</style>
			<?php
				include 'Classes/contentClass.php';
				ContentSnippets::showFavicon();
			?>
			
			
<!-- 			<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script> -->
			<script src="jquery.js"></script>
			
			<script type="text/javascript">
				$(document).ready(function(){
			
					var isAdmin = false;
					
					
					function clearScreenForLogout(){
							$("div").css("visibility", "hidden");
						$("body").html("You are not logged in");
					}
									
					function checkLoginStatus(){
					
						$.post("PHPScripts/admin/instructorLogin.php",
							 function(data){
								isAdmin = data.admin;
								if(data.loggedIn == true){
									if(isAdmin == true){
										$("#testModelingDiv").css("visibility", "visible");
									}
									else if(isAdmin == false){
										$("#testModelingNav, #questionModelingNav").css("visibility", "hidden");
									}
									$("#instructorID").val(data.employeeNo);
								}
								else{
									clearScreenForLogout();
								}
							}, "json");
					}
					
					function getQuestionQuantityForSPO(variant_type){
						var spo = "";
						$.post("PHPScripts/getQuestionCount.php", {
							variant: variant_type
						}, function(data){
							$.each(data, function(key, value){	
								//console.log(key+" "+value);
								spo += "<tr class='qForSPO'><td><label for='"+value.spo_id+"'>"+value.spo+" (<span style='color: rgb(54,136,251)'>"+value.count+"</span>)</label></td><td><input class='spo_count_spec' id='"+value.spo_id+"' name='"+value.spo+"' value=0 readonly><div class='inc button'>+</div><div class='dec button'>-</div></td></tr>";
																
							});	
							
							spo += "</table>";
							$("#newTestModelTable").append(spo);
							bindIncrementDecrementEvents();
							
						},"json");
					}
					
					//deprecated
					/*function getNumberOfQuestions(){
						console.log("function deprecated. use getQuestionQuantityForSPO() instead");
						$.post("PHPScripts/getQuestionCount.php",null,function(data){
							var currentText = $("label[for=air_condition]").text();
							$("label[for=air_condition]").text(currentText+" ("+data.air_condition+")");
							currentText = $("label[for=acft_gen]").text();
							$("label[for=acft_gen]").text(currentText+" ("+data.acft_gen+")");
							currentText = $("label[for=apu]").text();
							$("label[for=apu]").text(currentText+" ("+data.apu+")");
							currentText = $("label[for=autopilot]").text();
							$("label[for=autopilot]").text(currentText+" ("+data.autopilot+")");
							currentText = $("label[for=crew_awareness]").text();
							$("label[for=crew_awareness]").text(currentText+" ("+data.crew_awareness+")");
							currentText = $("label[for=elec]").text();
							$("label[for=elec]").text(currentText+" ("+data.elec+")");
							currentText = $("label[for=emerg_equip]").text();
							$("label[for=emerg_equip]").text(currentText+" ("+data.emerg_equip+")");
							currentText = $("label[for=fire_prot]").text();
							$("label[for=fire_prot]").text(currentText+" ("+data.fire_prot+")");
							currentText = $("label[for=flt_control]").text();
							$("label[for=flt_control]").text(currentText+" ("+data.flt_control+")");
							currentText = $("label[for=fuel]").text();
							 $("label[for=fuel]").text(currentText+" ("+data.fuel+")");
							currentText = $("label[for=hydraulics]").text();
							$("label[for=hydraulics]").text(currentText+" ("+data.hydraulics+")");
							currentText = $("label[for=ice_rain_prot]").text();
							 $("label[for=ice_rain_prot]").text(currentText+" ("+data.ice_rain_prot+")");
							currentText = $("label[for=ldg_gear_brk]").text();
							$("label[for=ldg_gear_brk]").text(currentText+" ("+data.ldg_gear_brk+")");
							currentText = $("label[for=lighting]").text();
							 $("label[for=lighting]").text(currentText+" ("+data.lighting+")");
							currentText = $("label[for=limitations]").text();
							$("label[for=limitations]").text(currentText+" ("+data.limitations+")");
							
							
							currentText = $("label[for=oxy]").text();
							$("label[for=oxy]").text(currentText+" ("+data.oxy+")");


							currentText = $("label[for=performance]").text();							
							$("label[for=performance]").text(currentText+" ("+data.performance+")");


							currentText = $("label[for=pneum]").text();							
							$("label[for=pneum]").text(currentText+" ("+data.pneum+")");
							
							
							currentText = $("label[for=powerplant]").text();
							$("label[for=powerplant]").text(currentText+" ("+data.powerplant+")");
							currentText = $("label[for=pressurization]").text();
							$("label[for=pressurization]").text(currentText+" ("+data.pressurization+")");
							currentText = $("label[for=profiles]").text();
							$("label[for=profiles]").text(currentText+" ("+data.profiles+")");
							currentText = $("label[for=radar]").text();
							$("label[for=radar]").text(currentText+" ("+data.radar+")");
							currentText = $("label[for=stall_prot]").text();
							$("label[for=stall_prot]").text(currentText+" ("+data.stall_prot+")");
							currentText = $("label[for=mandatory]").text();
							$("label[for=mandatory]").text(currentText+" ("+data.mandatory+")");
							
							
						},"json");
					}*/
				
				<?php /*load current value in questionNeeded on page load. */?>
					function displayCurrentLength(){
						var len = $("#testLength").val();
						$("#questionsNeeded").val(len);
					}
					
				
				<?php /*check input qty against set testLength */?>
				
				function updateQuantities(){
					var sum = 0;
					$("#newTestModelTable :input[class='spo_count_spec']").each(function(){
						sum += Number($(this).val());
					});
					
					$("#totalQuestions").val(sum);					
				}
				
				
				
				//deprecated
				/*	
					function updateQuantities(){
						var neededQty = parseInt($("#testLength").val());
						var currentQty = parseInt($("#totalQuestions").val());
						//console.log("needed: "+neededQty+" current: "+currentQty);
						if(currentQty > neededQty){
							var amtOver = (neededQty - currentQty);
							$("#totalQuestions, #questionsNeeded").css("color","red");
							$("#questionsNeeded").val(amtOver);							
						}
						
						else {
							var toGo = (neededQty - currentQty);
							$("#totalQuestions, #questionsNeeded").css("color","black");
							$("#questionsNeeded").val(toGo);
						}

					}
				*/
					
					<?php /*set size of all system topic input fields */?>
					$("#newTestModelTable input:text").attr("size", "2");
										
					<?php /*clear form when test Length value is changed */?>
					$("#testLength").change(function(){
						$("#newTestModelTable, #totalQuestions").val("");
						$("#totalQuestions, #questionsNeeded").css("color","black");
						$("#questionsNeeded").val($("#testLength").val());
					});
					
					
					$("#fleet").change(function(){
						$("#newTestModelTable tr[class='qForSPO']").remove();
						getQuestionQuantityForSPO($("#fleet").val());						
					});
					
					<?php /*reset fields */?>
					$("#resetButton").click(function(){
						$("#newTestModelTable input:text, #totalQuestions").val("");
						$("#questionsNeeded").val($("#testLength").val());
						$("#totalQuestions, #questionsNeeded").css("color","black");
						return false;
					});
					
					
					function bindDeletableEvents(){
						$("#modelResults :button[value=delete]").click(function(){
							var tID = $(this).attr("id");
							var courseType = $("#viewModeledTestByType").val();
							$.post("PHPScripts/removeModel.php", {
								test_model_id: tID
							}, function(data){
									$("#modeledTests tr td:first").html("Total "+courseType+" Models: "+data.totalModels+"");
									<?php /*remove the deleted test model from the screen.*/?>
									$("#modelResults table#"+tID+"").remove();
								
							}, "json");
							
						});	
						
					}
					
					function passwordPair() {
						$.post("PHPScripts/passwordGenerator.php", null,function(data){
							$("#testPassword").val(data.password);
							$("#overridePassword").val(data.override);
						},"json");
					}
					
					function bindUseEvents(){
						$("#modelResults :button[value=use]").click(function(){
							var tID = $(this).attr("id");
							passwordPair();
							$("#idToUse").val(tID);
							return false;
						});
					}
					
					
					function bindIncrementDecrementEvents(){
						$(".button").on("click", function() {
						  var $button = $(this);
						  var oldValue = $button.parent().find("input").val();
						
						  if ($button.text() == "+") {
							  var newVal = parseFloat(oldValue) + 1;
							} else {
						   // Don't allow decrementing below zero
						    if (oldValue > 0) {
						      var newVal = parseFloat(oldValue) - 1;
						    } else {
						      newVal = 0;
						    }
						  }
						
						  $button.parent().find("input").val(newVal);
						  updateQuantities();
						});					
					}						
					
					<?php /*submit new test model to database. */?>
					
					$("#submitButton").click(function(){
						var spoAndCount = [];
						var len = $("#testLength").val();
						var typ = $("#courseType").val();
						var fleet_type = $("#fleet").val();
						var modelNm = $("#newTestModelName").val();
						
						$("#newTestModelTable :input[class='spo_count_spec']").each(function(){
							var input = $(this);
							spo_spec = {"id":input.attr('id'), "count":input.val()};
							spoAndCount.push(spo_spec);
						});
						
						$.post("PHPScripts/newTestModel.php", {
							variant: fleet_type,
							length: len,
							course_type: typ,
							model: spoAndCount,
							modelName: modelNm
						}, function(data){});
						return false;
					});

				
					$("#showTestModelsButton").click(function(){
						var crs_type = $("#viewModeledTestByType").val();
						var flt_type = $("#fleet_type").val();
						$.post("PHPScripts/showTestModels.php",{
							course_type: crs_type,
							variant: flt_type							
						}, function(data){
							
							$("#modelResults table").remove();
							
							var modelTableHTML = "";
							
							$.each(data, function(key, values){	
								
								modelTableHTML += "<table id="+values.test_model_id+" class='modelTable'><tr class='testModel'><td><button id="+values.test_model_id+" value='use'>use</button><button value='delete' id="+values.test_model_id+">delete</button></td></tr><td>Name: "+key+"</td></tr>";
								
								
								$.each( values, function(k, v) {
									if (k != 'test_model_id'){
										modelTableHTML += "<tr><td>"+k+": </td><td>"+v+"</td></tr>";
									}									
								});								
																
								modelTableHTML += "</table>";
								
							});
							
							$("#modelResults").append(modelTableHTML);
							
							
							if(isAdmin == false){
								$("#modelResults button:contains('delete')").css("visibility", "hidden");
							}
							bindDeletableEvents();
							bindUseEvents();
							
						}, "json");
						
						return false;
					});



					//deprecated

					/*
					$("#showTestModelsButton").click(function(){
						var testModel = $("#viewModeledTestByType").val();
						$.post("PHPScripts/showTestModels.php",{
							model: testModel							
						}, 
						function(data){
							////console.log(data);
							$("#modelResults table").remove();
							$("#modeledTests tr td:first").html("Total "+testModel+" Models: "+data.length+"");
							$.each(data, function(key, value){		
								$("#modelResults").append("<table id="+value.testID+" class='modelTable'><tr class='testModel'><tr><td><button id="+value.testID+" value='use'>use</button></td><td><button value='delete' id="+value.testID+">delete</button></td></tr><td>Model ID: "+value.testID+"</td></tr><tr><td>Air Conditioning: "+value.air_condition+"</td><td>Aircraft General: "+value.acft_gen+"</td></tr><tr><td>APU: "+value.apu+"</td><td>Autopilot: "+value.autopilot+"</td></tr><tr><td>Crew Awareness: "+value.crew_awareness+"</td><td>Electrical: "+value.elec+"</td></tr><tr><td>Emergency Equipment: "+value.emerg_equip+"</td><td>Fire Protection: "+value.fire_prot+"</td></tr><tr><td>Flight Controls: "+value.flt_control+"</td><td>Fuel: "+value.fuel+"</td></tr><tr><td>Hydraulics: "+value.hydraulics+"</td><td>Ice/Rain Protection: "+value.ice_rain_prot+"</td></tr><tr><td>Landing/Gear Brakes: "+value.ldg_gear_brk+"</td><td>Lighting: "+value.lighting+"</td></tr><tr><td>Limitations: "+value.limitations+"</td><td>Oxygen: "+value.oxy+"</td></tr><tr><td>Performance: "+value.performance+"</td><td>Pneumatics: "+value.pneum+"</td></tr><tr><td>Powerplant: "+value.powerplant+"</td><td>Pressurization: "+value.pressurization+"</td></tr><tr><td>Profiles: "+value.profiles+"</td><td>Radar: "+value.radar+"</td></tr><tr><td>Stall Protection: "+value.stall_prot+"</td><td>Mandatory: "+value.mandatory+"</td></tr></table>");
							});
							
							if(isAdmin == false){
								$("#modelResults button:contains('delete')").css("visibility", "hidden");
							}
							bindDeletableEvents();
							bindUseEvents();
						}, "json");
					});
					*/
					
					
					$("#createTestButton").click(function(){
						<?php /*show progress bar */?>
						$("#progressBar").css("visibility", "visible");
						
						var modelID = $("#idToUse").val();
						var	insID = $("#instructorID").val();
						var	testPwd = $("#testPassword").val();
						var ovrPwd = $("#overridePassword").val();
						$.post("PHPScripts/createNewTest.php", {
							id: modelID,
							instructorID: insID,
							testPassword: testPwd,
							overridePassword: ovrPwd
						}, function(data){
							$.each(data, function(key,value){
								if(data.error == ""){
									data.error = "none";
								}
								$("#createdTestResults").fadeIn(500);
								$("#createdTestResults p").html(data.message+". Expires 1 hr from: "+data.timestamp+". Enter password: "+data.testPassword+" to begin. For subsequent logins, use password with override: "+data.overridePassword+" Errors: "+data.error);
							});
							
							$("#progressBar").css("visibility", "hidden");
							$("#testPassword, #overridePassword").val("");
						},"json");
						return false;
					});
					
					
					<?php /*onload */?>
					checkLoginStatus();
					displayCurrentLength();	
					$("#fleet").trigger("change");					
				});
				
							
			</script>

	</head>
	<body>
		<?php
			ContentSnippets::doHeader();
			ContentSnippets::doNavigationBar();
		?>
	<div id="createAndBuildTestsDiv">
			<div id="selectModeledTestDiv">
					<table id="selectModeledTestTable">
						<tr>
							<th>Test Creation</th>
						</tr>
						<tr>
							<td>
								<select id='fleet_type'>
									<option value=1>ERJ</option>
									<option value=2>CRJ</option>
								</select>
							</td>
						</tr>
						<tr>
							<td><select id="viewModeledTestByType">
									<option value="SY9">SYS</option>
									<option value="UPG">UPG</option>
									<option value="INS">INS</option>
							</select></td>
						</tr>
						<tr>
							<td><button id="showTestModelsButton">View Models</button></td>
						</tr>
					</table>
					<table id="modeledTests">
						<tr id="totalModelsForType">
							<td></td>
						</tr>
					</table>
				</div>
				
				<div id="createTest">
						<label for="instructorID">Instructor ID</label>
						<input id="instructorID" name="instructorID" type="text" readonly>
						<label for="testPassword">Test Password</label>
						<input id="testPassword" name="testPassword" type="text" readonly>
						<label for="overridePassword">Override Password</label>
						<input id="overridePassword" type="text" readonly>
						<label for="idToUse">Model Assigned?</label>
						<input id="idToUse" value="NO" type="text" readonly>
						<button id="createTestButton" value="create">create</button>
						<div id="createdTestResults">
							<p></p>
						</div>
						<div id="progressBar"></div>						
					</div>
			
				<div id="testModelingDiv" style="visibility: hidden">
					<form id="newTestModelForm" method="post" action="">
						<table id="newTestModelTable">
							<tr><th>Test Modeling</th></tr>
							<tr>
								<td>Fleet</td>
								<td>
									<select id='fleet'>
										<option value=1>ERJ</option>
										<option value=2>CRJ</option>										
									</select>
								</td>
							</tr>
							<tr>
								<td>Course Type: </td>
								<td>
									<select id="courseType">
										<option value="SY9">SY9</option>
										<option value="UPG">UPG</option>
										<option value="INS">INS</option>										
									</select>
								</td>
							</tr>
							<tr>
								<td>Test Length:</td>
								<td>
									<select id="testLength">
										<option value="100">100</option>
										<option value="50">50</option>
										<option value="25">25</option>
										<option value="10">10</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Name</td><td><input type='text' id='newTestModelName' /></td>
							</tr>
							<tr>
								<td>SPO</td><td>No. of questions</td>
							</tr>
								<?php /*SPO name and count populated here */ ?>

						<table id="totalQuestionsTable">
							<tr>
								<td><label for="totalQuestions" >Total Questions</label></td>
								<td><input id="totalQuestions" name="totalQuestions" size="2" value = 0 readonly ></td>
								<td><label for="questionsNeeded" >To Go:</label></td>
								<td><input id="questionsNeeded" name="questionsNeeded" size="2" readonly></td>
							</tr>
							<tr>
								<td><button id="resetButton">Reset</button></td>
								<td><input id="submitButton" type="submit" value="submit" name="submit"></td>
							</tr>
					</table>
				</form>
			</div>
						
			</div>
							
			<div id="modelResults">
			</div>
					
		
						
		</body>
</html>
