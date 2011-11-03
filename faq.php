<!DOCTYPE HTML>
<html>
	<head>
		<title>FAQ</title>
		
		
		<?php 
			include "Classes/contentClass.php";
			ContentSnippets::showFavicon();
		?>
		
		<style type="text/css">
			@import url("CSS/faq.css");
		</style>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
		<script type="text/javascript">
			$(document).ready(function(){
			
				//allows expand/collapse of answer
				$(".question").click(function(){
					if($(this).children('div .arrow').hasClass('arrow-right') == true){
						$(this).children('div .arrow').removeClass('arrow-right');
						$(this).children('div .arrow').addClass('arrow-down');
						$(this).next('div').css("display", "block");
					}else{	
						$(this).children('div .arrow').removeClass('arrow-down');
						$(this).children('div .arrow').addClass('arrow-right');
						$(this).next('div').css("display", "none");
					}
				});
	
			});
		</script>
	</head>
	<body>
		<?php
			ContentSnippets::doHeader();
		?>
	
	<div id="faQuestions">
			
			<div class='questionGroup'>
				<div class='question'>
					<span class='bold'>How can I export test scores? -added 5/31/2011</span>
					<div class='arrow arrow-right'></div>	
				</div>
				<div class='answer'>
					<p>Currently, SJTester can export a cumulative set of test results in .csv format and is available only to administrators.  The .csv file can be opened in Microsoft Excel or other spreadsheet/database viewing software, such as Apple's Numbers.  The file will contain a list of all students test records, including: employee number, class date, test date, instructor, result (sat or unsat), score, qualification code, syllabus, and whether or not the test was administered as a result of retraining.</p>
					<p>To export, navigate to the Instructor Area and click the export button in the Admin Tasks area. A download will be prompted when the file is ready.</p>
				</div>
			</div>
			
			<div class='questionGroup'>
				<div class='question'>
					<span class='bold'>Why do generated tests contain 2 passwords? -added 5/24/2011</span>
					<div class='arrow arrow-right'></div>
				</div>
				<div class='answer'>
					<p>Generating tests with a password that should only be used once presents a unique problem.  The password issued to the student should only be permitted for a single use. Additionally, the password that the instructor uses cannot be be a duplicate of a password designated for a previous test.</p>
					<p>The solution SJTester uses employs two main functions:</p>
					<ul>
						<li>Passwords are randomly generated using a script that randomly generates an 8-character string and checks against already used passwords. When an instructor selects a test model, a unique password is generated for the test. The instructor shall distribute this password to the students for login to the test. </li>
						<li>A second password, designated as the 'override' is generated in the event that the browser crashes to afford a second login.</li>
					</ul>
					<p>Use:</p>
					<ul>
						<li>When you generate a test, record/write down the password and the override password.</li>
					<li>Give the students the test password only. If the student attempts to login a second time, the override password will be required along with the original password you distributed. This security measure also prevents the student from attempting to login to the test application in an un-authorized manner.</li>
					<li>Remember that test passwords will still expire 1 hour after test generation.  An override password will not permit a login after the original password expires.</li>
					</ul>
				</div> <!-- end of answer -->
			</div> <!-- end questionGroup -->
		</div>
	</body>
</html>

<!-- cut & paste the following snippet to format a new item for the faq.

			<div class='questionGroup>
				<div class='question'>
					<span class='bold'>Question Title</span>
					<div class='arrow arrow-right'></div>	
				</div>
				<div class='answer'>
					<p>This is the answer</p>
				</div>
			</div>

-->
