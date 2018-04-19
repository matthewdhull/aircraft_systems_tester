<?php

class ContentSnippets {

	public function __get($name) {
		return $this->$name;
	}
	
	public function __set($name, $value) {
		$this->$name = $value;
	} 
	
	
	//takes one string arg so that the title may be customized.  
	public static function doHeader($addendum=null){
		echo "<style type='text/css'>@import url('CSS/header.css');</style><div id='header'><div id='headerTitle'>SJTester".$addendum."</div></div>";
	}
	
	public static function showFavicon() {
		echo "<link rel='icon' type='image/png' href='favicon.png'>";
	}
	
	public static function doNavigationBar(){
		?>
			<style type="text/css">
				@import url("CSS/common.css");
			</style>
			
<!-- 			<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script> -->
			<script src="jquery.js"></script>
			<script type="text/javascript">
				$(document).ready(function(){
						$("#instructorAreaNav").click(function(){
							window.location = "instructorArea.php";
							return false;
						});			
						$("#testModelingNav").click(function(){
							window.location = "testModeling.php";
							return false;
						});			
						$("#questionModelingNav").click(function(){
							window.location = "questionCRUD_taskModeling.php";
							return false;
						});
						$("#taskModelingNav").click(function(){
							window.location = "taskModeling.php";
							return false;
						});										
						

				});
			</script>
			<div id="navigationBar">
				<ul>
					<li><button id="instructorAreaNav">Instructor Area</button></li>
					<li><button id="testModelingNav">Test Modeling</button></li>
					<li><button id="questionModelingNav">Question Modeling</button></li>			
					<li><button id="taskModelingNav">Task Modeling</button></li>
				</ul>	
			</div>
		<?php
	}
}

?>