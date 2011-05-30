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
		<script src="jquery.js" type="text/javascript"></script>
		<script type="text/javascript">
			$(document).ready(function(){
			});
		</script>
	</head>
	<body>
		<?php
			ContentSnippets::doHeader();
		?>
	
		<div id="faQuestions">
			<p><h3>Test Password + Override Password -added 5/24/2011</h3></p>
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
		</div>
	</body>
</html>
