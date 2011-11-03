<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

	<head>
		
		<title></title>
		
			
						
<?php /*
						var a = $("#air_condition").val();
						var b = $("#acft_gen").val();
						var c = $("#apu").val();
						var d = $("#autopilot").val();
						var e = $("#crew_awareness").val();
						var f = $("#elec").val();
						var g = $("#emerg_equip").val();
						var h = $("#fire_prot").val();
						var i = $("#flt_control").val();
						var j = $("#fuel").val();
						var k = $("#hydraulics").val();
						var l = $("#ice_rain_prot").val();
						var m = $("#ldg_gear_brk").val();
						var n = $("#lighting").val();
						var o = $("#limitations").val();
						var p = $("#oxy").val();
						var q = $("#pneum").val();
						var r = $("#powerplant").val();
						var s = $("#pressurization").val();
						var t = $("#profiles").val();
						var u = $("#radar").val();
						var v = $("#stall_prot").val();
						var w = $("#mandatory").val();
*/?>

			<meta http-equiv="content-type" content="text/html; charset=UTF-8">
			
			<style type='text/css'>
				@import url("CSS/testCRUD.css");
			</style>
			<?php
				include 'Classes/contentClass.php';
				ContentSnippets::showFavicon();
			?>
			
			<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
			
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
					
					function getNumberOfQuestions(){
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
					}
				
				<?php /*load current value in questionNeeded on page load. */?>
					function displayCurrentLength(){
						var len = $("#testLength").val();
						$("#questionsNeeded").val(len);
					}
					
				
				<?php /*check input qty against set testLength */?>
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
					
					<?php /*set size of all system topic input fields */?>
					$("#newTestModelTable input:text").attr("size", "2");
					

					<?php /*add all fields and display total in #totalQuestions. *uses calculation.js plugin */?>
					$("#newTestModelTable input:text").focus(function(){
					
						var a = $("#air_condition").val();
						var b = $("#acft_gen").val();
						var c = $("#apu").val();
						var d = $("#autopilot").val();
						var e = $("#crew_awareness").val();
						var f = $("#elec").val();
						var g = $("#emerg_equip").val();
						var h = $("#fire_prot").val();
						var i = $("#flt_control").val();
						var j = $("#fuel").val();
						var k = $("#hydraulics").val();
						var l = $("#ice_rain_prot").val();
						var m = $("#ldg_gear_brk").val();
						var n = $("#lighting").val();
						var o = $("#limitations").val();
						var p = $("#oxy").val();
						var q = $("#pneum").val();
						var r = $("#powerplant").val();
						var s = $("#pressurization").val();
						var t = $("#profiles").val();
						var u = $("#radar").val();
						var v = $("#stall_prot").val();
						var w = $("#mandatory").val();
						var systemSubcategories = [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w];
					
						var sum = 0;
						$.each(systemSubcategories, function(index, value){
							if(value != ""){

								value = parseInt(value);
								sum += value;
							}
							
						});
						$("#totalQuestions").val(sum);
						updateQuantities();
					});		
					
					
					<?php /*clear form when test Length value is changed */?>
					$("#testLength").change(function(){
						$("#newTestModelTable input:text, #totalQuestions").val("");
						$("#totalQuestions, #questionsNeeded").css("color","black");
						$("#questionsNeeded").val($("#testLength").val());
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
								testID: tID
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
					
					
					
					
					<?php /*submit new test model to database. */?>
					$("#submitButton").click(function(){
						var len = $("#testLength").val();
						var typ = $("#courseType").val();
						var a = $("#air_condition").val();
						var b = $("#acft_gen").val();
						var c = $("#apu").val();
						var d = $("#autopilot").val();
						var e = $("#crew_awareness").val();
						var f = $("#elec").val();
						var g = $("#emerg_equip").val();
						var h = $("#fire_prot").val();
						var i = $("#flt_control").val();
						var j = $("#fuel").val();
						var k = $("#hydraulics").val();
						var l = $("#ice_rain_prot").val();
						var m = $("#ldg_gear_brk").val();
						var n = $("#lighting").val();
						var o = $("#limitations").val();
						var p = $("#oxy").val();
						var q = $("#pneum").val();
						var r = $("#powerplant").val();
						var s = $("#pressurization").val();
						var t = $("#profiles").val();
						var u = $("#radar").val();
						var v = $("#stall_prot").val();
						var w = $("#mandatory").val();

						$.post("PHPScripts/newTestModel.php",{
							length: len,
							course_type: typ,
							air_condition: a,
							acft_gen: b,
							apu: c,
							autopilot: d,
							crew_awareness: e,
							elec: f,
							emerg_equip: g,
							fire_prot: h,
							flt_control: i,
							fuel: j,
							hydraulics: k,
							ice_rain_prot: l,
							ldg_gear_brk: m,
							lighting: n,
							limitations: o,
							oxy: p,
							pneum: q,
							powerplant: r,
							pressurization: s,
							profiles: t,
							radar: u, 
							stall_prot: v,
							mandatory: w
						}, 
						function(data){
							////console.log(data);
						}, "json");
						return false;
					});
					
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
								$("#modelResults").append("<table id="+value.testID+" class='modelTable'><tr class='testModel'><tr><td><button id="+value.testID+" value='use'>use</button></td><td><button value='delete' id="+value.testID+">delete</button></td></tr><td>Model ID: "+value.testID+"</td></tr><tr><td>Air Conditioning: "+value.air_condition+"</td><td>Aircraft General: "+value.acft_gen+"</td></tr><tr><td>APU: "+value.apu+"</td><td>Autopilot: "+value.autopilot+"</td></tr><tr><td>Crew Awareness: "+value.crew_awareness+"</td><td>Electrical: "+value.elec+"</td></tr><tr><td>Emergency Equipment: "+value.emerg_equip+"</td><td>Fire Protection: "+value.fire_prot+"</td></tr><tr><td>Flight Controls: "+value.flt_control+"</td><td>Fuel: "+value.fuel+"</td></tr><tr><td>Hydraulics: "+value.hydraulics+"</td><td>Ice/Rain Protection: "+value.ice_rain_prot+"</td></tr><tr><td>Landing/Gear Brakes: "+value.ldg_gear_brk+"</td><td>Lighting: "+value.lighting+"</td></tr><tr><td>Limitations: "+value.limitations+"</td><td>Oxygen: "+value.oxy+"</td></tr><tr><td>Pneumatics: "+value.pneum+"</td><td>Powerplant: "+value.powerplant+"</td></tr><tr><td>Pressurization: "+value.pressurization+"</td><td>Profiles: "+value.profiles+"</td></tr><tr><td>Radar: "+value.radar+"</td><td>Stall Protection: "+value.stall_prot+"</td></tr><tr><td>Mandatory: "+value.mandatory+"</td></tr></table>");
							});
							
							if(isAdmin == false){
								$("#modelResults button:contains('delete')").css("visibility", "hidden");
							}
							bindDeletableEvents();
							bindUseEvents();
						}, "json");
						
						
					});
					
					
					
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
					getNumberOfQuestions();
					
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
							<td><select id="viewModeledTestByType">
									<option value="SY9">SY9</option>
									<option value="UPG">UPG</option>
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
								<td>Course Type: </td>
								<td>
									<select id="courseType">
										<option value="SY9">SY9</option>
										<option value="UPG">UPG</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>Test Length:</td>
								<td>
									<select id="testLength">
										<option value="100">100</option>
										<option value="50">50</option>
									</select>
								</td>
							</tr>
							<tr>
								<td>System</td><td>No. of questions</td>
							<tr>
								<td><label for="air_condition">Air Conditioning</label></td>
								<td><input id="air_condition" name="air_condition"></td>
								<td><label for="acft_gen">Aircraft General</label></td>
								<td><input id="acft_gen" name="acft_gen"></td>
							</tr>
							<tr>
								<td><label for="apu">APU</label></td>
								<td><input id="apu" name="apu"></td>
								<td><label for="autopilot">Autopilot</label></td>
								<td><input id="autopilot" name="autopilot"></td>
							</tr>
							<tr>
								<td><label for="crew_awareness">Crew Awareness</label></td>
								<td><input id="crew_awareness" name="crew_awareness"></td>
								<td><label for="elec">Electrical</label></td>
								<td><input id="elec" name="elec"></td>
							</tr>
							<tr>
								<td><label for="emerg_equip">Emergency Equipment</label></td>
								<td><input id="emerg_equip" name="emerg_equip"></td>
								<td><label for="fire_prot">Fire Protection</label></td>
								<td><input id="fire_prot" name="fire_prot"></td>
							</tr>
							<tr>
								<td><label for="flt_control">Flight Controls</label></td>
								<td><input id="flt_control" name="flt_control"></td>
								<td><label for="fuel">Fuel</label></td>
								<td><input id="fuel" name="fuel"></td>
							</tr>
							<tr>
								<td><label for="hydraulics">Hydraulics</label></td>
								<td><input id="hydraulics" name="hydraulics"></td>
								<td><label for="ice_rain_prot">Ice/Rain Protection</label></td>
								<td><input id="ice_rain_prot" name="ice_rain_prot"></td>
							</tr>
							<tr>
								<td><label for="ldg_gear_brk">Landing Gear/Brakes</label></td>
								<td><input id="ldg_gear_brk" name="ldg_gear_brk"></td>
								<td><label for="lighting">Lighting</label></td>
								<td><input id="lighting" name="lighting"></td>
							</tr>
							<tr>
								<td><label for="limitations">Limitations</label></td>
								<td><input id="limitations" name="limitations"></td>
								<td><label for="oxy">Oxygen</label></td>
								<td><input id="oxy" name="oxy"></td>
							</tr>
							<tr>
								<td><label for="pneum">Pneumatics</label></td>
								<td><input id="pneum" name="pneum"></td>
								<td><label for="powerplant">Powerplant</label></td>
								<td><input id="powerplant" name="powerplant"></td>
							</tr>
							<tr>
								<td><label for="pressurization">Pressurization</label></td>
								<td><input id="pressurization" name="pressurization"></td>
								<td><label for="profiles">Profiles</label></td>
								<td><input id="profiles" name="profiles"></td>
							</tr>
							<tr>
								<td><label for="radar">Radar</label></td>
								<td><input id="radar" name="radar"></td>
								<td><label for="stall_prot">Stall Protection</label></td>
								<td><input id="stall_prot" name="stall_prot"></td>
							</tr>
							<tr>
								<td><label for="mandatory">Mandatory</label></td>
								<td><input id="mandatory" name="mandatory"></td>
							</tr>
						</table>
						<table id="totalQuestionsTable">
							<tr>
								<td><label for="totalQuestions" >Total Questions</label></td>
								<td><input id="totalQuestions" name="totalQuestions" size="2" readonly ></td>
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
