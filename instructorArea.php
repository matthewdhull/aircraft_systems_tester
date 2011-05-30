<!DOCTYPE HTML>

<!-- a little git edit! -->
<html>
	<head>
		<title>Instructor Area</title>
		
			<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
			<script src="calculation.js" type="text/javascript"></script>
			
			<?php 
				include "Classes/contentClass.php";
				ContentSnippets::showFavicon();
			?>
			

			
			<style type="text/css">
				@import url("CSS/instructorArea.css");
			</style>
			<script type="text/javascript">
				$(document).ready(function(){
					var isAdmin = false;
					var empNo = $("#employeeNo");
					var pwd = $("#loginPassword");
					var instructorDivHTML = "<div id='editInstructorDiv'><table><tr><td>Submit</td><td>Delete</td><td>Employee No</td><td>First Name</td><td>Last Name</td><td>Password</td><td>Admin?</td></tr><tr><td><button id='updateInstructorInfo'>Submit</button></td><td><button id='deleteInstructorInfo'>Delete</button></td><td><input id='editInstructorID' type='text'></input></td><td><input id='editFirstName'  type='text'></input></td><td><input id='editLastName' type='text'></input></td><td><input id='editPassWord'  type=text'></input></td><td><input id='editAdmin'  type='checkbox'></input></td></tr></table></div>";
					
					function clearInfo(){
						$("#infoDiv *").remove();
						$("#studentEmpNo").val("");
						$("#newWindowCheckbox").removeAttr("checked");
					}
					
					function clearLoginFields(){
						empNo.val("");
						pwd.val("");
					}
					
					function clearScreenForLogout(){
						clearLoginFields();
						clearInfo();
						$("#instructorTasks, #adminTasks, #infoDiv, #logoutDiv").css("visibility", "hidden");
					}
					
					function clearManageInsructorFields(){
						$("#editInstructorDiv input").val("");
						$("#editInstructorDiv input[type=checkbox]").removeAttr("checked");
					}
					
					function colorRows(){
						$("#infoDiv table tr:odd, #infoDiv li:odd").css("background-color", "#d8dbdb");
						$("#infoDiv table td[value='Unsatisfactory']").css("color", "red");
						
					}
										
					function checkLoginStatus(){
					
						$.post("PHPScripts/admin/instructorLogin.php", null,
							 function(data){
								$("#loginMessage, #loggedInMessage").html(data.message);
								isAdmin = data.admin;
								if(data.loggedIn === true){
									$("#loginDiv").hide();
									$("#instructorTasks").css("visibility", "visible");
									if(isAdmin === true){
										$("#adminTasks").css("visibility", "visible");
									}
									populateTestDates();										
								}
								else{
									clearScreenForLogout();
								}
							}, "json");
						
						
					}
					
					//populates a <select> element with test dates.
					function populateTestDates(){
						if(isAdmin === true){						
							$.post("PHPScripts/admin/getReports.php",{
								option: "getTestDates"
							}, function (data){
								$.each(data, function(key,value){
									$("#testDateMDY").append("<option value='"+value+"'>"+value+"</option>");
								});
								
							}, "json");
						}
						else {
							$.post("PHPScripts/admin/getReports.php",{
								option: "getInstructorTestDates"
							}, function (data){
								$.each(data, function(key,value){
									$("#testDateMDY option").remove();
									$("#testDateMDY").append("<option value='"+value+"'>"+value+"</option>");
								});
								
							}, "json");
						
						}
					}			
					
					function getScoresForDate(tDate){
						var htmlToAdd = "";
						var newPage = window.open();
						$.post("PHPScripts/admin/getReports.php", {
							option: "getScoresForClass",
							testDate: tDate
						}, function(data){
							//console.log(data);
							clearInfo();
							
							htmlToAdd += "<table><tr><td><b>Test Date:</b> "+data.testInfo.testDate+"</td></tr><tr><td><b>Class Average:</b> "+data.testInfo.classAverage+"%</td></tr><tr><td><b>Instructor:</b> "+data.testInfo.instructorID+"</td></tr><tr><td><b>Name</b></td><td><b>Employee No.</b></td><td><b>Result</b></td><td><b>Score</b></td></tr>";
							$.each(data.scores, function(key,value){
								htmlToAdd += "<tr><td>"+value.name+"</td><td>"+value.employeeNo+"</td><td>"+value.result.charAt(0).toUpperCase() + value.result.slice(1)+"</td><td>"+value.score+"</td></tr>";
							});
							htmlToAdd += "</table>";
							$("#infoDiv").append(htmlToAdd);
							$('html, body').animate({
							    scrollTop: $("#infoDiv").offset().top
							}, 1000);		
								//open new window for printing if desired.

							var content = "<html><head><title>Test Report</title><style type='text/css'> li {list-style:none;}</style></head><body>"+htmlToAdd+"</body></html>";
							newPage.document.open();
							newPage.document.write(content);
							newPage.document.close();

														
						}, "json");
					
					
					}	
					
					function getSingleStudentReport(dateString, studentEmpID){
						var htmlToAdd = "";
						var newPage = window.open();
						//console.log("Date: "+dateString+" student: "+studentEmpID);
						$.post("PHPScripts/admin/getReports.php", {
							option: "getStudentReport",
							admin: isAdmin,
							studentEmpNo: studentEmpID,
							testDate: dateString 
							}, function(data){
								clearInfo();
								htmlToAdd += "<h2>Test Report For: "+studentEmpID.toUpperCase()+"</h2><h3>Test Date: "+dateString+"</h3><h4>The following is a listing of average scores for each category ranked from lowest to highest. Use this summary to facilitate any retraining. </h4><ul>";
								if(data.msg === false){
									//console.log("error: "+data.msg);
									htmlToAdd += "<li>No record found for this student (incorrect date, employee no, or instructor credentials)</li>";
								}
								else {
								
									$.each(data.weakSystems,function(key,value){
										htmlToAdd += "<li>"+key.toUpperCase()+": "+value+"%</li>";
									});
									
									htmlToAdd += "<li>&nbsp;</li><li><h4>Missed Questions</h4></li>";
									
									$.each(data.missedQuestions,function(key,value){
										htmlToAdd += "<li>System: "+value.subcategory.toUpperCase()+"</li><li><b>"+value.questionText+"</b></li><li>A. "+value.a+"</li><li>B. "+value.b+"</li><li>C. "+value.c+"</li><li>D. "+value.d+"</li><li>Correct Answer: "+value.answerKey.toUpperCase()+"</li><li>&nbsp</li>";
									});
								}
								htmlToAdd += "</ul>";
								$("#infoDiv").append(htmlToAdd);
								colorRows();
								$('html, body').animate({
								    scrollTop: $("#infoDiv").offset().top
								}, 1000);								
								
								var content = "<html><head><title>Test Report</title><style type='text/css'> li {list-style:none;}</style></head><body>"+htmlToAdd+"</body></html>";					
								newPage.document.open();
								newPage.document.write(content);
								newPage.document.close();
							}, "json");
					
						
						
					}
					
					
					$("#reportTypeSelect").change(function(){
						var employeeNoTableRow = $("#studentEmployeeRow");				 
						if($(this).val()=="byClass"){
							employeeNoTableRow.css("visibility", "hidden");
						}
						else {
							employeeNoTableRow.css("visibility", "visible");
						}
					});
					
					
					
					$("#sortBy").change(function(){ //any change to this will cause the #sortSpecifics to be autopopulated with appropriate choices for the selected criteria.
						var criteria = $(this).val();
						var htmlToAdd = "";
						var specs = $("#sortSpecifics");
						$("#sortSpecifics *").remove();			
						if(criteria == "month"){
							specs.removeAttr("disabled");
							htmlToAdd += "<option value='01'>January</option><option value='02'>February</option><option value='03'>March</option><option value='04'>April</option><option value='05'>May</option><option value='06'>June</option><option value='07'>July</option><option value='08'>August</option><option value='09'>September</option><option value='10'>October</option><option value='11'>November</option><option value='12'>December</option>";
						}
						else if(criteria == "quarter"){
							specs.removeAttr("disabled");
							htmlToAdd += "<option value='q1'>Q1</option><option value='q2'>Q2</option><option value='q3'>Q3</option><option value='q4'>Q4</option>";
						}
						else if(criteria == "year"){ //this will populate the option list from 2011 - to the current year.
							specs.attr("disabled", "disabled");
						}
						
						specs.append(htmlToAdd);
					});
				
					$("#loginButton").click(function(){
						$.post("PHPScripts/admin/instructorLogin.php",{
							employeeNo: empNo.val(),
							loginPassword: pwd.val()
							}, function(data){
								//console.log("employeeNo: "+data.employeeNo+" name: "+data.name+" loggedIn?: "+data.loggedIn+" admin?: "+data.admin+" message: "+data.message);				
								$("#loginMessage, #loggedInMessage").html(data.message);
								isAdmin = data.admin;
									if(data.loggedIn === true){
											$("#instructorTasks, #infoDiv").css("visibility", "visible");
											
										if(isAdmin === true){
											$("#adminTasks").css("visibility", "visible");
										}
										
										checkLoginStatus();
									}
								clearLoginFields();
								$("#loginDiv").fadeOut('fast');
								$("#logoutDiv").css('visibility', 'visible');
							}, "json");
					});
					
					$("#logout").click(function(){
						$.post("PHPScripts/admin/instructorLogout.php");
							$("#loginMessage").html("You have been logged out. For security purposes, close this browser.");
							isAdmin = false;
							clearScreenForLogout();
							$("#logoutDiv").css("visibility", "hidden");
							$("#loginDiv").fadeIn('fast');
						});
						
						
					$("#createNewTest, #modelNewTest").click(function(){
						window.location = "testCRUD.php";
					});	
					
					$("#qCRUD").click(function(){
						window.location = "questionCRUD.php";
					});
					
					
					$("#faqButton").click(function(){
						window.location = "faq.php";
					});
					
					
					//this pulls the questionID and testID of a question to eject. Ejecting a question will result in the question being marked as answered correctly for all students who took the test.  Results will then be re-calculated.  
					function bindEjectQuestionEvents(){
						$("#infoDiv button").click(function(){
							if($(this).html()=="Eject Question"){
								var id = $(this).attr('id');
								//id will be something like: "q34_t61" The q preceedes the questionID, the t preceeds the testID.
								var qInfo = id.split("_");

								var qID = qInfo[0].substr(1);
								qID = parseInt(qID,10);
								
								var tID = qInfo[1].substr(1);
								tID = parseInt(tID,10);
								
								//console.log(qID+" "+tID); 
								
								$.post("PHPScripts/admin/getReports.php",{
									option: "ejectQuestion",
									questionID: qID,
									testID: tID
								},function(data){
									//console.log(data);
								},"json");

							}
						});
					}
					

					function bindViewQuestionEvents(){
						$("#infoDiv :button").click(function(){
							var isQuestion = ($(this).html());
							if(isQuestion == "Questions"){
								var id = $(this).attr('id');
								var formattedIDNum = id.substr(1);
								var num = parseInt(formattedIDNum);
								$.post("PHPScripts/admin/getReports.php",{
									option: "getQuestionsForTestID",
									testID: num
									},function(data){
										clearInfo();
										
										
										if(isAdmin === true){
											
											//each object contains a listing of the question asked AS IT WAS GENERATED for the test being reviewed.  
											$.each(data.testQuestions, function(key,value){
												$("#infoDiv").append("<ul><li>System: "+value.subcategory+"</li><li><b>"+value.questionText+"</b></li><li>A. "+value.a+"</li><li>B. "+value.b+"</li><li>C. "+value.c+"</li><li>D. "+value.d+"</li><li>Answer: "+value.answerKey.toUpperCase()+"</li><li><button id='q"+value.questionID+"_t"+value.genTestID+"'>Eject Question</button></li></ul>");
												
											});
											
										
											//the json object contains a flag returning whether or not 24 hrs have elapsed since issuance of the exam.  If inside the 24 hr window, the instructor may elect to eject a question from the test.  This action will cause any incorrect answers for the question to be marked correct.  Scores will be re-calculated.  
											if(data.timeout == "YES"){
												$("#infoDiv button").attr("disabled", "disabled");
											}
											else if(data.timeout == "NO"){
												$("#infoDiv button").removeAttr("disabled");
											}
										
											bindEjectQuestionEvents();
										} // end of if(isAdmin == TRUE)
										
										
										else {
											//each object contains a listing of the question asked AS IT WAS GENERATED for the test being reviewed.  
											$.each(data.testQuestions, function(key,value){
												$("#infoDiv").append("<ul><li>System: "+value.subcategory+"</li><li><b>"+value.questionText+"</b></li><li>A. "+value.a+"</li><li>B. "+value.b+"</li><li>C. "+value.c+"</li><li>D. "+value.d+"</li><li>Answer: "+value.answerKey.toUpperCase()+"</li></ul>");
												
											});
										
										}
										
										colorRows();
										
									}, "json");
								}
						});
					}


					function bindDisclosureTriangleEvent(){
						$(".triangle").click(function(){
							if($(this).hasClass('arrow-right') == true){
								$(this).removeClass('arrow-right');
								$(this).addClass('arrow-down');
							}else{	
								$(this).removeClass('arrow-down');
								$(this).addClass('arrow-right');
							}
						});
					}
					
					$("#viewTestsButton").click(function(){
						$.post("PHPScripts/admin/getReports.php",{
							option: "getCreatedTests"
							},function(data){
								clearInfo();
								$("#infoDiv").append("<table id='infoTable'><tr><td>Review Questions</td><td>Date</td><td>Course Type</td><td>Password</td><td>Class Average</td></tr></table>");
								var htmlToAdd = "";
								$.each(data, function(key,value){
									$("#infoTable").append("<tr><td><button id='t"+value.genTestID+"'>Questions</button></td><td>"+value.genDate+"</td><td>"+value.course_type+"</td><td><i>"+value.testPassword+"</i></td><td>"+value.avg+"</td></tr><tr><td>Per Category Averages for Class: <div class='triangle arrow-right'></div></td></tr><tr><td><div class='purple'><ul>");
									$.each(value.perSubcatAnalysis, function(key,value){
										$("#infoTable ul:last").append("<li>"+key.toUpperCase()+" Average Score: "+value+"%</li>");
			
									});
									$("#infoTable").append("</ul></div></td></tr>");
								});							
								
								bindViewQuestionEvents();
								bindDisclosureTriangleEvent();
								//colorRows();
								$('html, body').animate({
								    scrollTop: $("#infoTable").offset().top
								}, 1000);
							}, "json");
							
								
					});
					
					
					
					$("#takeTestButton").click(function(){
						window.location = "examCMS.php";
					});			


					$("#testReport").click(function(){
						var openNewWindow;
						var requestType = $("#reportTypeSelect").val();
						
					 	var studentEmpID = $("#studentEmpNo").val();
						var dateString = $("#testDateMDY").val();
						
						if(requestType == "byStudentEmployeeID"){
							getSingleStudentReport(dateString, studentEmpID);
						}
						else if(requestType == "byClass"){
							getScoresForDate(dateString);
						}
						
						
					});
					
					$("#viewAllScores").click(function(){
						var sortBy = $("#sortBy").val();
						var sortSpec = $("#sortSpecifics").val();
						var desiredYear = $("#desiredYear").val();
						//console.log(sortBy, sortSpec, desiredYear);
						clearInfo();
						$.post("PHPScripts/admin/getReports.php", {
							orgType: sortBy,
							orgSpec: sortSpec,
							year: desiredYear,
							option: "getAllScores"
						}, function(data){
							//console.log(data);
							var htmlToAdd = "<table><tr><td>Employee No.</td><td>Name</td><td>Class Date</td><td>Test Date</td><td>Instructor ID</td><td>Syllabus</td><td>Qual Code</td><td>Retrain?</td><td>Result</td><td>Score</td></tr>";
							$.each(data, function(key,value){
								htmlToAdd += "<td>"+value.employeeNo+"</td><td>"+value.lastName+", "+value.firstName+"</td><td>"+value.classDate+"</td><td> "+value.testDate+"</td><td>"+value.instructorID+"</td><td>"+value.syllabus+"</td><td>"+value.qualCode+"</td><td>"+value.retrain+"</td><td value='"+value.result+"'>"+value.result+"</td><td> "+value.score+"</td></tr>";
							});
							htmlToAdd += "</table>";
							$("#infoDiv").append(htmlToAdd);
							colorRows(); 
							$('html, body').animate({
							    scrollTop: $("#infoDiv").offset().top
							}, 1000);								
							
							
						},"json");
						
					});
					
/*
					$("#scoreByClass").click(function(){
						var tDate = $("#testDates").val();
						getScoresForDate(tDate);
					});
*/
					
					function bindEditInstructorEvents(){
						$("#instructorList button[value='e']").click(function(){
							var id = $(this).attr('id');
							$.post("PHPScripts/admin/getReports.php",{
								option: "getInstructorInfo",
								instructorEmpNo: id
							}, function(data){
									clearManageInsructorFields();
									$("#editInstructorDiv").css("visibility", "visible");
									$("#updateInstructorInfo").val("update");
									$("#deleteInstructorInfo").removeAttr("disabled");
									$("#editInstructorID").val(data.employeeNo);
									$("#editFirstName").val(data.firstName);
									$("#editLastName").val(data.lastName);
									$("#editPassWord").val(data.password);
									if(data.admin == "NO"){
										$("#editAdmin").removeAttr("checked");
									}
									else if(data.admin == "YES"){
										$("#editAdmin").attr("checked", "true");	
									}
									

							},"json");
						});
					}
					
					function bindAddNewInstructorEvent(){
						$("#addNewInstructor").click(function(){
							clearManageInsructorFields();
							$("#editInstructorDiv").css("visibility", "visible");
							$("#updateInstructorInfo").val("add");
							$("#deleteInstructorInfo").attr("disabled", "disabled");
						});
					}
					
					$("#manageInstructors").click(function(){
						$.post("PHPScripts/admin/getReports.php",{
							option: "getInstructors"
						},function(data){
							var htmlToAdd = "<table id='instructorList'><tr><td>Edit</td><td>Employee No</td><td>Name</td><td>Password</td><td>Admin?</td></tr>";
							clearInfo();
							//console.log(data);
							$.each(data, function(key,value){
								htmlToAdd += "<tr><td><button id='"+value.employeeNo+"' value='e'>Edit</button</td><td>"+value.employeeNo+"</td><td>"+value.lastName+", "+value.firstName+"</td><td>"+value.password+"</td><td>"+value.admin+"</td></tr>";
							});
							htmlToAdd +="<tr><td><button id='addNewInstructor'>New Ins.</button></td></tr></table>";
							htmlToAdd += instructorDivHTML;
							$("#infoDiv").append(htmlToAdd);
							bindEditInstructorEvents();
							bindAddNewInstructorEvent();
							bindUpdateInstructorInfoEvents();
							bindDeleteInstructorInfoEvents();
							$('html, body').animate({
							    scrollTop: $("#infoDiv").offset().top
							}, 1000);								
							
						},"json");
					});
					
					function bindUpdateInstructorInfoEvents(){
						$("#updateInstructorInfo").click(function(){
							var editMode = $(this).val();
							//console.log("edit mode: "+editMode);
							var theOption = editMode+"Instructor";
							var insID = $("#editInstructorID").val();
							var fName = $("#editFirstName").val();
							var lName = $("#editLastName").val();
							var pwd = $("#editPassWord").val();
							var isAdmin;
								if($("#editAdmin").attr('checked') === true){	
								 	isAdmin = 1;
								}
								else {
									isAdmin = 0;
								}
							
							$.post("PHPScripts/admin/getReports.php", {
								option: theOption,
								instructorEmpNo: insID,
								firstName: fName,
								lastName: lName,
								password: pwd,
								admin: isAdmin
							},function(data){
								$("#editInstructorDiv").css("visibility", "hidden");
							},"json");												
							
						});
					}
					
					function bindDeleteInstructorInfoEvents(){
						
						$("#deleteInstructorInfo").click(function(){
							var idToDelete = $("#editInstructorID").val();
							$.post("PHPScripts/admin/getReports.php", {
								option: "deleteInstructor",
								instructorEmpNo: idToDelete
							},function(data){
								$("#editInstructorDiv").css("visibility", "hidden");
							},"json");
						});
					}
					
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			
//																																				  //
//														GENERATE PAPER TEST																	      //			
//																																				  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
			$("#generatePaperTest").click(function(){
				var newPage = window.open();
				var pwd = $("#paperTestPassword").val();
				var content = "<html><body>"			
					$.post("PHPScripts/getExam.php",{
						password: pwd
					}, function(data){
						
						//only show test questions if password is valid. (correct characters and not expired).
						if(data.error === undefined){
							var numbering = 1;
							$.each(data, function(key,value){
									content += " <b>"+numbering+". "+value.questionText+"</b><br /><br />";
									content += " A. "+value.a+" <br />";
									content += " B. "+value.b+" <br />";
									if(value.c != "" && value.d != ""){
										content += " C. "+value.c+" <br />";
										content += " D. "+value.d+" <br />";
									}
									content += "<br /><br />";
									numbering++;
/*
									var ques = {
									"questionID":value.questionID,
									"type":value.type,
									"questionText":value.questionText,
									"a":value.a,
									"b":value.b,
									"c":value.c,
									"d":value.d,
									"selectedAnswer":"",
									"marked":false
									
								};
*/
								
							});
							
						content += "</body></html>";
						newPage.document.open();
						newPage.document.write(content);
						newPage.document.close();
							
						}
						
						
						
					}, "json");
				});	
							
					
					// call on document ready
					checkLoginStatus();
					$("#sortBy").change().removeAttr("disabled");
					$("#testDates").removeAttr("disabled");

				});
				
				
				
			</script>
	</head>
<body>
	<?php
		ContentSnippets::doHeader();
	?>
	<div id="loginDiv" class="center">
		<table id="loginTable">
			<tr>
				<th>Instructor Area Login</th>
			</tr>
			<tr>
				<td><label for="employeeNo">Employee Number</label></td>
				<td><input id="employeeNo" type="text"></td>				
			</tr>
			<tr>
				<td><label for="loginPassword">Password</label></td>				
				<td><input id="loginPassword" type="password"></td>
			</tr>
			<tr>
				<td><button id="loginButton">Login</button></td>
			</tr>
		</table>
		<table>
			<tr>
				<td id="loginMessage"></td>
			</tr>
		</table>
	</div>
	<div id="instructorTasks" class="center" style="visibility: hidden">
		<h4>Instructor Tasks</h4>
		<table>
			<tr>
				<td><button id="createNewTest">Create</button></td>
				<td>Create a new test</td>
			</tr>
			<tr>
				<td><button id="viewTestsButton">View</button></td>
				<td>View tests you administered</td>
			</tr>
			<tr>
				<td><button id="takeTestButton">Goto</button></td>
				<td>Go to the testing page.</td>
			</tr>
			<tr>
				<td><button id="faqButton">FAQ</button></td>
				<td>Frequently asked questions.</td>
			</tr>
			
		</table>
		<table id="reportTable">
			<tr>
				<td><select id="reportTypeSelect">
					<option value="byStudentEmployeeID">Single Student Report</option>
					<option value="byClass">Class Report (FC-10)</option>
				</select></td>

				 <td><label for="testDateMDY">Test Date </label></td>
				 <td><select id="testDateMDY"></select></td>
			</tr>
			<tr id="studentEmployeeRow">
				<td></td>
				<td><label for="studentEmpNo">Student Employee No. </label></td>
				<td><input id="studentEmpNo" type="text"></td>
			</tr>
			<tr>
			</tr>
			<tr>
				<td><button id="testReport">Generate</button></td>					
			</tr>
		</table>
	</div>
	<div id="adminTasks" class="center" style="visibility:hidden">
	<h4>Admin Tasks</h4>
		<table>
			<tr>
				<td><button id="viewAllScores">View</button></td>
				<td>All Test Scores</td>
				<td>Sort Criteria</td>
				<td>Year</td>
				<td><input type="text" id="desiredYear" size="5" maxlength="4"></td>
				<td>
					<select id="sortBy">
						<option value="year">Year Only</option>
						<option value="quarter">Quarter</option>
						<option value="month">Month</option>
					</select>
				</td>
				<td>
					<select id="sortSpecifics">
					</select>
				</td>
			</tr>
<!--
			<tr>
				<td><button id="scoreByClass">Class Score</button></td>
				<td>View all scores for a specific class.</td>
				<td>Test Date</td>
				<td><select id="testDates"></select></td>
			</tr>
-->
			<tr>
				<td><button id="qCRUD">Questions</button></td>
				<td>Create, read, update, and delete questions</td>
			</tr>
			<tr>
				<td><button id="modelNewTest">Model</button></td>
				<td>Test Modeling</td>
			</tr>
			<tr>
				<td><button id="generatePaperTest">Paper Test</button></td>
				<td>Generate Paper Test</td>
				<td><label for="paperTestPassword">Test Password</label></td>
				<td><input id="paperTestPassword" type="password"></td>
			</tr>
			<tr>
				<td><button id="manageInstructors">Instructors</button></td>
				<td>Manage Instructors</td>
			</tr>
		</table>
	</div>
<!--
<div id="editInstructorDiv">
	<table>
		<tr>
			<td>Submit</td>
			<td>Delete</td>
			<td>Employee No</td>
			<td>First Name</td>
			<td>Last Name</td>
			<td>Password</td>
			<td>Admin?</td>
		</tr>
		<tr>
			<td><button id="updateInstructorInfo">Submit</button></td>
			<td><button id="deleteInstructorInfo">Delete</button></td>
			<td><input id="editInstructorID" type="text"></input></td>
			<td><input id="editFirstName"  type="text"></input></td>
			<td><input id="editLastName"  type="text"></input></td>
			<td><input id="editPassWord"  type="text"></input></td>
			<td><input id="editAdmin"  type="checkbox"></input></td>
		</tr>
	</table>
</div>
	
-->
<div id="infoDiv">
</div>
<div id="logoutDiv">
	<ul>
		<li id="loggedInMessage"></li>
		<li><a href="#" id="logout">-Logout</a></li>
	</ul>
</div>
<div id="infoDiv">
</div>
</body>
</html>
