<?php
session_start();
//session_cache_limiter('nocache');
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Exam</title>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">	
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<!-- 		<script src='jquery.js'> </script> -->
		<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css" /> <!--CSS for date picker-->				
		<script src="http://code.jquery.com/ui/1.10.0/jquery-ui.js"></script>		
		<script src="shufflePlugin.js"></script>				
		<style type="text/css">
			@import url("CSS/examCMS.css");
		</style>
		
		<?php 
			include 'Classes/contentClass.php';
			ContentSnippets::showFavicon();
		?>

		<script type="text/javascript">
			$(document).ready(function(){	

			//check instructorID to allow shell to take test without recording results
			var instructorID = "<?php echo $_SESSION['employeeNo'];?>";			
			
			
			<?php /*these variables are set when student clicks 'begin exam'.   they are sent to the server upon grading the test. */?>
				var employeeNo;
				var pwd;
				var fName;
				var lName;	
				var syl;
				var qCode;
				var retr;
				var classMo;
				var classDa;
				var classYr;
				
				var questions = [];
				var currentIndex = 0;
	
	
				var reviewQuestions = [];
				var reviewInSession = false;
				var questionIDinReview;
				
				//this snippet is inserted into DOM after the exam is complete. It displays results and test score.
				var examResultsHTML = "<div id='examResults'><p id='score'></p><p id='result'></p><p id='incorrectAnswers'></p><p id='reviewMessage'></p></div>";
	
<?php /*
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			
//																																				  //
//														CONTENT SETUP    																	      //			
//																																				  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
*/?>
				
				$("#gradeButton, #beginExam").attr("disabled", "disabled");
				$("#questionsUnansweredTab, #questionsUnanswered, #questionsMarkedTab").css("visibility", "hidden");
				
				$('input[id*="date"]').datepicker();
				
				function clearQuestionFields(placeholderMsg){
					$("#questionText").html(placeholderMsg);
					$("input[name='selectedAnswer']").attr("checked", false);
					$("#a, #b, #c, #d, label[for=a], label[for=b], label[for=c], label[for=d], input:radio").hide();
				}
				
				function showQuestionForIndex(index, boolIsQuestionID){
					var q = {}; <?php /*placeholder for question being retrieved. */?>

					
					
					<?php /*grab question by questionID attribute.*/?>
					if (boolIsQuestionID === true){
						for(var i = 0; i<(questions.length); i++){
							var qWithID = questions[i];
							if(qWithID.questionID == index){
								q = questions[i];
								currentIndex = i;
							}
						}
					}
					else if(boolIsQuestionID === false || boolIsQuestionID === null) {
						q = questions[index];

						//console.log("selected answer "+q.selectedAnswer);			
									
					}
					
					$("#questionText").html((currentIndex+1)+". "+ q.questionText); <?php /*shows question number. */?>
					$("#a").html(q.a);
					$("#b").html(q.b);
					
					
					<?php /*hide C.D answers if the answer type == tf. */?>
					if(q.type == "tf"){
						$("label[for=c], #c, input[value=c]").hide();
						$("label[for=d], #d, input[value=d]").hide();
					}
					else {
						$("label[for=c], #c, input[value=c]").show();
						$("label[for=d], #d, input[value=d]").show();
						
					}
					
					$("#c").html(q.c);
					$("#d").html(q.d);
					if(q.selectedAnswer === ""){
						<?php /*clear all answers if no answer has been given. */?>
						$("input[name='selectedAnswer']").attr("checked", false);
					}
					else {
						$("input[value="+q.selectedAnswer+"]").attr("checked", "checked");
					}
					if(q.marked === true){
						$("#markQuestion").attr("checked", "checked");
						
					}
					else {
						$("#markQuestion").removeAttr("checked");
					
					}
					
				}
				
				<?php /*sets the answer for the displayed question. */?>
				function setAnswerForIndex(answer, index){
					var q = questions[index];
					q.selectedAnswer = answer;
					//console.log("set answer: "+q.selectedAnswer+" for index: "+index);

				}
				
				<?php /*mark or unmark a question for review.*/?>
				function markQuestionForIndex(boolChecked, index){
					var q = questions[index];
					q.marked = boolChecked;
					//alert("marked?: "+q.marked+" for index: "+index);
				}
				
				
				$("#previousButton, #nextButton").click(function(){
					var diff = 0;
					if($(this).attr('id') == "nextButton"){
						diff = 1;
					}
					else if ($(this).attr('id') == "previousButton"){
						diff = -1;
					}
					
					if (currentIndex == maxIndex  && ($(this).attr('id')=="nextButton")){
						currentIndex = 0;
					}
					
					else if(currentIndex === 0 && ($(this).attr('id')=="previousButton")){
						currentIndex = maxIndex;
					}
					
					else {
						currentIndex += diff;
					}
					
					showQuestionForIndex(currentIndex, false);
					
				});
				
				
				<?php /*gets selected Answer Key (A, B, C, etc) */?>
				$("input[name='selectedAnswer']").change(function(){
					var answer = $(this).val();
					setAnswerForIndex(answer, currentIndex);
					showUnanweredQuestions();
					
					<?php /*when review is in session, force student to select correct answer (train to proficiency) */?>
					if(reviewInSession === true){
						var correctAnswerKey = $("#reviewCorrectAnswer").html();
						var formattedAnswer = correctAnswerKey.toLowerCase();
	
						if (answer == formattedAnswer){
							var divToRemove = $('#reviewQuestions div#'+questionIDinReview+'');
							clearQuestionFields("Click each box presented in the review area below to correct missed questions.");
							$(divToRemove).remove();
							
							<?php /*executes once all incorrect questions have been reviewed & corrected.  */?>
							if ( $("#reviewQuestions").children().size() ===  0 ) {
								$("#questionDiv, #reviewNavigationTable").css("visibility", "hidden");
								$("#reviewMessage").html("Review complete. Allow the instructor to record your score. You may then close the browser.");
							}							
						}
						
						else if(answer != formattedAnswer){
							alert("select the correct answer before continuing");
							
						}
					}
				});
				
				
				<?php /*detect marking/unmarking of a question.*/?>
				$("#markQuestion").change(function(){
					if($("#markQuestion").is(':checked')){
						markQuestionForIndex(true, currentIndex);
					}
					else if(!$("#markQuestion").is(':checked')){
						markQuestionForIndex(false, currentIndex);
					}
					
					showMarkedQuestions();
					
				});
<?php /*
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			
//																																				  //
//														LOGIN/BEGIN EXAM																	      //			
//																																				  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
*/ ?>				
				$("#beginExam").click(function(){
					$("#beginExam").attr("disabled", "disabled");
				
					<?php /*1.validate credentials */?>
					
					employeeNo = $("#employeeNo").val();
					pwd = $("#password").val();
					ovrPwd = $("#overridePassword").val();
					fName = $("#firstName").val();
					lName = $("#lastName").val();
					syl = $("#syllabus").val();
					qCode = $("#qualCode").val();
					if($("#retrain").is(':checked')){
						retr = true;
					}
					else {
						retr = false;
					}
					classMo = $("#classDateMonth").val();
					classDa = $("#classDateDay").val();
 					classYr = $("#classDateYear").val();
 					
 					$("#overridePasswordDiv").css("visibility", "hidden");
					//console.log(employeeNo+" "+fName+" "+lName+" "+syl+" "+qCode+" "+retr+" "+classMo+" "+classDa+" "+classYr);
				
					$.post("PHPScripts/getExam.php",{
						studentEmpNo: employeeNo,
						password: pwd,
						overridePassword: ovrPwd
					}, function(data){
						
						<?php /*only show test questions if password is valid. (correct characters and not expired). */?>
						if(data.error === undefined){
							$.each(data, function(key,value){
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
								
								questions.push(ques);
								
							});
							
							questions = $.shuffle(questions);
							maxIndex = questions.length - 1;
							showQuestionForIndex(0, false);
							showUnanweredQuestions();
							$("#gradeButton").removeAttr("disabled");
							$("#loginDiv").hide();
							$("#questionDiv, #questionsUnansweredTab, #questionsUnanswered, #questionsMarkedTab, #questionsMarked, #gradeExamDiv").css("visibility", "visible");
						}
						
						else {
							if(data.error === "Override password required for re-login") {
								$("#overridePasswordDiv").css("visibility", "visible");
								$("#logonMessage").html(data.error);
								$("#password").val(pwd);
								$("#beginExam").removeAttr("disabled");
								
							}
							else {
								$("#logonMessage").html(data.error);
							}
						}
							
					}, "json");
					
										
					
					
					return false;
				});
					
				function appendDivWithOptions(indexedArr, idLetter, elementToAppendTo){
					var css = 5;
					var top = 5;
					var htmlToInsert = "";
					$.each(indexedArr, function(index,value){
						if (index >= 0 && index <= 9){
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
						}
						else if(index>9 && index <=19){
							if(index == 10){
								css = 5;
							}
							top = 26;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
						}
						else if(index>19 && index <=29){
							if(index == 20){
								css = 5;
							}
							top = 47;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
						}
						else if(index>29 && index <=39){
							if(index == 30){
								css = 5;
							}
							
							top = 68;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
						}
						else if(index>39 && index <=49){
							if(index == 40){
								css = 5;
							}
						
							top = 89;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
						}
						
						else if(index>49 && index <= 59){
							if(index == 50){
								css = 5;
							}
							
							top = 110;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
						}
						
						else if(index>59 && index <=69 ){
							if(index == 60 ){
								css = 5;
							}
							
							top = 131;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
							
						}
						else if(index>69 && index <= 79 ){
							if(index == 70){
								css = 5;
							}
							
							top = 152;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
							
						}
						
						else if(index> 79&& index <=89 ){
							if(index == 80){
								css = 5;
							}
							
							top = 173;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
							
						}
						
						else if(index>89 && index <=99 ){
							if(index == 90){
								css = 5;
							}
							
							top = 194;
							htmlToInsert += "<div id='"+idLetter+value+"' style='left:"+css+"px; top:"+top+"px'>"+(value+1)+"</div>";
							
						}
						
						css += 31;						
						
					
					});
					
					$(elementToAppendTo).append(htmlToInsert);
				}
				
				function showUnanweredQuestions(){
					$("#questionsUnanswered").children().remove();
					var uAnQuestions = 0;
					var indexes = [];
					$.each(questions, function(index, value){
						if(value.selectedAnswer === ""){
							uAnQuestions++;
							indexes.push(index);
						}
						
					});
					
					var idLetter = "u";
					var appendee = $("#questionsUnanswered");
					appendDivWithOptions(indexes, idLetter, appendee);
					bindUnansweredQuestionClick();

				}
					
				function showMarkedQuestions(){
					$("#questionsMarked").children().remove(); <?php /*remove all divs and refresh marked questions. */?>
					var mkQuestions = 0;
					var indexes = [];
					$.each(questions, function(index, value){
						if(value.marked === true){
							mkQuestions++;
							indexes.push(index);
						}
						
					});
					
					var idLetter = "m";
					var appendee = $("#questionsMarked");
					appendDivWithOptions(indexes, idLetter, appendee);
					bindmarkedQuestionClick();
				}	
					
				function setupReviewQuestions(kvalArray){
					var htmlToInsert = "";
					var top = 5;
					var css = 5;
				
					$.each(kvalArray, function(index, value){
						if (index >= 0 && index <= 9){
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
						}
						else if(index>9 && index <=19){
							if(index == 10){
								css = 5;
							}
							top = 26;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
						}
	
						else if(index>19 && index <=29){
							if(index == 20){
								css = 5;
							}
							top = 47;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
						}
						else if(index>29 && index <=39){
							if(index == 30){
								css = 5;
							}
							
							top = 68;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
						}
						else if(index>39 && index <=49){
							if(index == 40){
								css = 5;
							}
						
							top = 89;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
						}
						
						else if(index>49 && index <= 59){
							if(index == 50){
								css = 5;
							}
							
							top = 110;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
						}
						
						else if(index>59 && index <=69 ){
							if(index == 60 ){
								css = 5;
							}
							
							top = 131;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
							
						}
						else if(index>69 && index <= 79 ){
							if(index == 70){
								css = 5;
							}
							
							top = 152;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
							
						}
						
						else if(index> 79&& index <=89 ){
							if(index == 80){
								css = 5;
							}
							
							top = 173;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
							
						}
						
						else if(index>89 && index <=99 ){
							if(index == 90){
								css = 5;
							}
							
							top = 194;
							htmlToInsert += "<div id='r"+value.id+"' value = '"+value.answer+"' style='left:"+css+"px; top:"+top+"px'>Q</div>";
							
						}
						
						css += 31;						
						
					
					});
					$("#reviewQuestions").append(htmlToInsert);
					bindReviewQuestionsClick();
				}
				
				function bindmarkedQuestionClick(){
					$("#questionsMarked div").click(function(){
						var index = $(this).attr('id');
						var nIndx = index.substr(1);
						var num = parseInt(nIndx, 10);
						currentIndex = num;
						showQuestionForIndex(currentIndex, false);
					});
				}
				
				function bindUnansweredQuestionClick(){
					$("#questionsUnanswered div").click(function(){
						var index = $(this).attr('id');
						var nIndx = index.substr(1);
						var num = parseInt(nIndx, 10);
						currentIndex = num;
						showQuestionForIndex(currentIndex, false);
					});
				}
				
				function bindReviewQuestionsClick(){
					$("#reviewQuestions div").click(function(){
						var index = $(this).attr('id');
						questionIDinReview = index;
						var correctAnswerKey = $(this).attr('value');
						var nIndx = index.substr(1);
						var num = parseInt(nIndx, 10);
						$("#a, #b, #c, #d, label[for=a], label[for=b], label[for=c], label[for=d], input:radio").show();
						showQuestionForIndex(num, true);
						$("#reviewCorrectAnswer").html(correctAnswerKey.toUpperCase());
						
					});
				}
				
				//bind arrow key events for quick navigation of questions
				$(document).keydown(function(e) {
				    switch(e.which) {
				        case 37: // left
						$("#previousButton").click();
				        break;
				
				        case 38: // up
						console.log('up');				        
				        break;
				
				        case 39: // right
						$("#nextButton").click();						
				        break;
				
				        case 40: // down
				        break;
				
				        default: return; // exit this handler for other keys
				    }
				    e.preventDefault(); // prevent the default action (scroll / move caret)
				});				
				
<?php /*
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////			
//																																				  //
//															GRADE EXAM																			  //			
//																																				  //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
*/ ?>	
				$("#gradeButton").click(function(){
					if($(this).val() == 1){
						var doNotGrd;
						if(instructorID != "") {
							doNotGrd = "true";
						}
						else {
							doNotGrd = "false";
						}
						
						$("#gradeTestMessage").html("Grading Test...").fadeIn('fast');
						//$(this).attr("disabled", "disabled");
						$.post("PHPScripts/gradeExam.php", {
							answeredQuestionsArr: questions,
							password: pwd,
							empNo: employeeNo,
							firstName: fName,
							lastName: lName,
							syllabus: syl,
							qualCode: qCode,
							retrain: retr,
							classMonth: classMo,
							classDay: classDa,
							classYear: classYr,
							doNotGrade: doNotGrd

							}, function(data){
								$("#gradeExamDiv").replaceWith(examResultsHTML);
								$("#incorrectAnswers").html("Number of incorrect answers: "+data.incorrectAnswers);
								$("#score").html("Score: "+data.percentage+"%");
								var result;
								if(data.outcome == "satisfactory"){
									result = "SATISFACTORY";
								}
								else if(data.outcome == "unsatisfactory"){
									result = "UNSATISFACTORY";
								}
								//$("#result").html("Result: "+result);
								missedQuestions = data.incorrectQuestions;
								
								$("#gradeButon, #examNavigationTable").css("visibility", "hidden");
								
								
								<?php /*allow student to finish test if score is perfect. Else: enable review. */?>
								if(data.incorrectAnswers === 0){
									//$("#reviewMessage").html("There are no questions to review. Allow Instructor to record your score. You may then close the browser.");
									clearQuestionFields("");
									$("#gradeTestMessage").html("");
									
								}
								else{
									clearQuestionFields("Click each box presented in the review area below to correct missed questions.");
									$("#gradeTestMessage").html("");
									$("#reviewMessage").html("Reference the 'Review' area below to correct missed questions");	
									$("#reviewQuestionsTab, #reviewQuestions, #reviewNavigationTable").css("visibility", "visible");
									$("#gradeButton, #questionsMarked, #questionsMarkedTab, #questionsUnansweredTab, #questionsUnanswered").css("visibility", "hidden");
									
									reviewInSession = true; <?php /* enable review mode. */?>
									$.each(missedQuestions, function(key, value){
										 var ka = {
										 	"id": key,
										 	"answer": value
										 };
										 reviewQuestions.push(ka);
										 
									});
									
									setupReviewQuestions(reviewQuestions);																
								}
						}, "json");						
						return;
					}
					var answeredQuestions = 0;
					$.each(questions, function(index, value){
						if(value.selectedAnswer !== ""){
							answeredQuestions++;
							
						}
					});
					if(answeredQuestions == (maxIndex+1)){
						$("#gradeTestMessage").html("All questions have been answered, click the 'Grade' button if you're ready to submit your test.").fadeIn('fast');
						$("#gradeButton").val(1);
					}
					
					else{
						$("#gradeTestMessage").html("Un-answered questions remain. Answer all questions and then click 'GRADE' again").fadeIn('fast');
						$("#gradeButton").val(0);
					}
					
					return false;
				});
				
				$("#questionsUnansweredTab").click(function(){
					$("#questionsMarked").css("visibility", "hidden");
					$("#questionsUnanswered").css("visibility", "visible");
				});
				
				$("#questionsMarkedTab").click(function(){
					$("#questionsMarked").css("visibility", "visible");
					$("#questionsUnanswered").css("visibility", "hidden");
				});

				$("#qualCode").change(function(){
					var l5 = "<option value='l5'>L5</option>";
					var l4 = "<option value='l4'>L4</option>";
					var l3 = "<option value='l3'>L3</option>";
					$("#syllabus option").remove();
					if($(this).val() == "nh"){
						$("#syllabus").append(l5);
					}
					if($(this).val() == "upg"){
						$("#syllabus").append(l4);
					}
					if($(this).val() == "rqual"){
						$("#syllabus").append(l5 + l4 + l3);
					}
					if($(this).val() == "trans"){
						$("#syllabus").append(l4);
					}
					
				});
				
				$("#firstName, #lastName, #employeeNo").change(function(){
					var fn = $("#firstName").val();
					var ln = $("#lastName").val();
					var en = $("#employeeNo").val();
					//ensure that fields are NOT empty, employee id is 5 NUMBERS only.  
					if((fn != "") && (ln != "") && (en.length == 5) && (/^[0-9]+$/.test(en))){	
						$("#beginExam").removeAttr("disabled");
						$("#logonMessage").html("");
					}
					else {
						$("#beginExam").attr("disabled", "disabled");
						$("#logonMessage").html("Supply first/last names and valid employee no.");
					}
					
				});				
				
				$("#qualCode").trigger("change");
				
				if(instructorID != "") {
					$("#firstName").val("Instructor").attr("disabled", "disabled");
					$("label[for=firstName]").html("Name");
					$("#lastName, label[for=lastName], #classDateDay, #classDateMonth, #classDateYear, label[for=classDateMonth],#syllabus, label[for=syllabus], #qualCode, label[for=qualCode], #retrain, label[for=retrain]").attr("hidden", "hidden");
					$("#employeeNo").val(<?php echo $_SESSION['employeeNo'] ?>).attr("disabled", "disabled"); 
					$("#beginExam").removeAttr("disabled");
					
				}

				
			});
			

			
		</script>
	</head>
	<body>
		<?php
			//displays header
			ContentSnippets::doHeader();
		?>
		<div id="loginDiv">
			<form id="loginForm" method="post" action ="">
				<div id="overridePasswordDiv" class="triangleBox">
					<table>
						<tr>
							<td><label for="overridePassword">Override Password</label></td>
						</tr>
						<tr>
							<td><input id="overridePassword" type="password"></td>
						</tr>
					</table>
				</div>
				<table id="loginTable">
					<tr>
						<td><label for="firstName">First Name</label></td>
						<td><label for="lastName">Last Name</label></td>
					</tr>
					<tr>
						<td><input type="text" size="25" id="firstName"></input></td>
						<td><input type="text" size="25" id="lastName"></input></td>
					</tr>
					<tr>
						<td><label for="employeeNo">Employee Number</label></td>
						<td><label for="classDateMonth">Class Date</label></td>
					</tr>
					<tr>
						<td><input id="employeeNo" name="employeeNo" type="text" size="25" maxlength="5"></input></td>
<!-- 						<td><input id="class_date" type="text" /></td> Future date picker element-->
						<td><select id="classDateMonth">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
								<option value="11">11</option>																																		<option value="12">12</option>																																	</select>
							<select id="classDateDay">
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
								<option value="11">11</option>																														<option value="12">12</option>
								<option value="13">13</option>																														<option value="14">14</option>
								<option value="15">15</option>
								<option value="15">15</option>
								<option value="16">16</option>
								<option value="17">17</option>
								<option value="18">18</option>
								<option value="19">19</option>
								<option value="20">20</option>
								<option value="21">21</option>
								<option value="22">22</option>
								<option value="23">23</option>
								<option value="24">24</option>
								<option value="25">25</option>
								<option value="26">26</option>
								<option value="27">27</option>
								<option value="28">28</option>
								<option value="29">29</option>
								<option value="30">30</option>
								<option value="31">31</option>
							</select>
							<select id="classDateYear">
								<option value="2013">2013</option>
								<option value="2014">2014</option>
								<option value="2015">2015</option>
								<option value="2016">2016</option>
								<option value="2017">2017</option>
								<option value="2018">2018</option>
								<option value="2019">2019</option>
								<option value="2020">2020</option>
								<option value="2021">2021</option>
								<option value="2022">2022</option>
								<option value="2023">2023</option>
								<option value="2024">2024</option>
								<option value="2025">2025</option>
							</select></td>
					</tr>
					<tr>
						<td><label for="syllabus">Syllabus</label></td>
						<td><label for="qualCode">Qualification Code</label></td>
					</tr>
					<tr>
						<td><select id="qualCode">
							<option value="nh">New Hire</option>
							<option value="upg">Upgrade</option>
							<option value="rqual">Re-Qual</option>
							<option value="trans">Transition</option>
							</select></td>
						<td><select id="syllabus">
							<option value="L5">L5</option>
							<option value="L4">L4</option>
							<option value="L3">L3</option>
						</select></td>
					</tr>
					<tr>
						<td><label for="retrain">Retrain?</label></td>
					</tr>
					<tr>
						<td><input id="retrain" type="checkbox"></input></td>
					</tr>
					<tr>
						<td><label for="password">Password</label></td>
					</tr>
					<tr>
						<td><input id="password" name="password" type="password" size="25"></input></td>
					</tr>
					<tr>
						<td><label for="beginExam">Begin Exam</label></td>
					</tr>
					<tr>
						<td><button id="beginExam" name="beginExam">Submit</button></td>
						<td id="logonMessage"></td>
					</tr>
				</table>
			</form>
		</div>
		<div id="questionDiv" style="visibility: hidden">
			<table id="questionTextTable">
				<tr>
					<td id="questionText"></td>
				</tr>
			</table>
			<div id="questionChoicesDiv">
				<table id="questionChoicesTable">
					<tr>
						<td><input type="radio" name="selectedAnswer" value="a"></input></td>
						<td><label for="a">A.</label></td>
						<td id="a"></td>
					</tr>
					<tr>
						<td><input type="radio" name="selectedAnswer" value="b"></input></td>
						<td><label for="b">B.</label></td>
						<td id="b"></td>
					</tr>
					<tr>
						<td><input type="radio" name="selectedAnswer" value="c"></input></td>
						<td><label for="c">C.</label></td>
						<td id="c"></td>
					</tr>
					<tr>
						<td><input type="radio" name="selectedAnswer" value="d"></input></td>
						<td><label for="d">D.</label></td>
						<td id="d"></td>
					</tr>
				</table>
			</div>
				<table id="examNavigationTable">
					<tr>
						<td><label for="markQuestion">Mark:</label></td>
						<td><input id="markQuestion" type="checkbox"></input></td>
					</tr>
					<tr>
						
						<td><button id="previousButton" style="width:75px">Previous</button></td>
						<td><button id="nextButton" style="width:75px">Next</button></td>
					</tr>
				</table>
			<table id="reviewNavigationTable" style="visibility: hidden">
				<tr>
					<td>Correct Answer: </td>
					<td id="reviewCorrectAnswer"></td>
				</tr>
			</table>
		</div>
		
		<?php /*These divs are populated with boxes showing marked and unanswered questions see (showMarkedQuestions() & showUnansweredQuestions())*/?>
		<div id="tabs">
			<div id="questionsUnansweredTab">Un-Answered</div>
			<div id="questionsMarkedTab">Marked</div>
			<div id="reviewQuestionsTab">Review</div>
		</div>
		<div id="questionsUnanswered"></div>
		<div id="questionsMarked"></div>
		<div id="reviewQuestions"></div>
		<div id="gradeExamDiv" style="visibility: hidden">
			<button id="gradeButton" value="0">Grade</button>
			<p id="gradeTestMessage" style="display:none"></p>
		</div>
<?php /*
		<div id="examResults">
			<p id="score"></p>
			<p id="result"></p>
			<p id="incorrectAnswers"></p>
			<p id="reviewMessage"></p>
		</div>
*/?>
	</body>
</html>
