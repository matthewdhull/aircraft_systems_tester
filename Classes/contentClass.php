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
			
			<script src=".http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js" type="text/javascript"></script>
			<script type="text/javascript">
				$(document).ready(function(){
						$("#instructorAreaNav").click(function(){
							window.location = "instructorArea.php";
							return false;
						});			
						$("#testModelingNav").click(function(){
							window.location = "testCRUD.php";
							return false;
						});			
						$("#questionModelingNav").click(function(){
							window.location = "questionCRUD.php";
							return false;
						});			
						

				});
			</script>
			<div id="navigationBar">
				<ul>
					<li><button id="instructorAreaNav">Instructor Area</button></li>
					<li><button id="testModelingNav">Test Modeling</button></li>
					<li><button id="questionModelingNav">Question Modeling</button></li>			
				</ul>	
			</div>
		<?php
	}
}

?>