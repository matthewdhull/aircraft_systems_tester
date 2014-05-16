<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<style type="text/css">
		@import "CSS/plus_sign.css";
		
	</style>
		<link rel="stylesheet" href="css/font-awesome/css/font-awesome.min.css">		
			
		<?php 
			include "Classes/contentClass.php";
			ContentSnippets::showFavicon();
		?>
	
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">		
<!-- 		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script> -->
	<script src="jquery.js"></script>			
	<script type="text/javascript">
			$(document).ready(function(){
				var animationInterval = 150;
				var plus_box_width = "100px";
				var build_quiz_div_x_origin = "-360px";
				var nh_test_div_x_origin = "-240px";
				var upg_test_div_x_origin = "-120px";
				var daily_quiz_div_x_origin = "0px";
				
				var nh_test_div_expanded_x = "-120px";
				var upg_test_div_expanded_x = "120px";
				var daily_quiz_div_expanded_x = "360px";
				
				var systems = [];
				
				//allows individual selection of systems to build a quiz
				$("div .subject input[type='checkbox']").change(function(){
					if($(this).is(':checked')) {
						systems.push($(this).val());
					}
					else {
						systems.pop($(this).val());
					}
					
					console.log(systems);
				});
				
				function bindCreateTestEvents(){
					$("#nh_test, #upg_test, #nh_test_title").click(function(){
					var divID = $(this).attr("id");
					var testType;
					
					//generate test
					$.post("PHPScripts/passwordGenerator.php", null,function(data){
						var p = data.password;
						var o = data.override;
						var	insID = 1;
						if ((divID === "nh_test") || (divID === "nh_test_title")){
							testType = "SY9";
						}
						else if((divID === "upg_test")||(divID === "upg_test_title")){
							testType = "UPG";
 						}
						
						console.log(o+" "+p);
					
						$.post("PHPScripts/createNewTestOfType.php", {
							type: testType,
							instructorID: insID,
							testPassword: p,
							overridePassword: o
						}, function(data){
								
							//console.log(data.error);
							//console.log(data.message);
							//console.log(data.testPassword);
							//console.log(data.overridePassword);
							//console.log(data.course_type);
							//console.log(data.length);
							
							if ((divID === "nh_test") || (divID === "nh_test_title")){
								$("#upg_test, #daily_quiz, #daily_quiz_builder").fadeOut("fast",function(){
									$("#upg_test").css("left", upg_test_div_x_origin);
									$("#daily_quiz").css("left", daily_quiz_div_x_origin);
									$("#upg_test, #daily_quiz").css("display", "block");
									$("#nh_test").animate({width:"250px"},animationInterval, function(){
										$("#nh_test .password_info").show();
										$("#nh_test .test_access_code").html(data.testPassword);
										$("#nh_test .override_password").html(data.overridePassword);
										$("#nh_test, #nh_test_title").unbind('click');
									});
									$("#build_test").css("left", "-510px");
								});
							}
							else {
								testType = "UPG";						
								$("#nh_test, #daily_quiz, #daily_quiz_builder").fadeOut("fast",function(){
									$("#upg_test").animate({left: "0px"}, animationInterval);						
									$("#nh_test").css("left", "-390px").css("display", "block");
									$("#daily_quiz").css("left", daily_quiz_div_x_origin).css("display", "block");	
									$("#upg_test").animate({width:"250px"},animationInterval, function(){
										$("#upg_test .password_info").show();
										$("#upg_test .test_access_code").html(data.testPassword);
										$("#upg_test .override_password").html(data.overridePassword);
										$("#upg_test, #upg_test_title").unbind('click');
									});
									$("#build_test").css("left", "-510px");									
								});
							}
											
							
							
						
						},"json");
						
					},"json");										
					
				

				
					return false;
				});
			}
				
				function bindCreateDailyQuizEvent(){
					$("#daily_quiz").click(function(){
						var c = systems.length;
						if (c==0){
							console.log("unable to build - "+c+" systems selected");
						}else {
							console.log(c+" systems selectd");

							$.post("PHPScripts/passwordGenerator.php", null, function(data){
								var p = data.password;
								var o = data.override;
								var insID = 1;
								$.post("PHPScripts/createNewDailyQuiz.php", {
									sys: systems,
									isntructorID: insID,
									testPassword: p,
									overridePassword: o
								}, function(data){
									
								},"json");
								
							},"json");
						}
					});					
				}													
					
					
					
					
				$("#build_test").click(function(){
					$("#nh_test").animate({left: nh_test_div_expanded_x}, animationInterval);
					$("#upg_test").animate({left: upg_test_div_expanded_x}, animationInterval);		
					//reset the daily quiz builder by unchecking all selections and clearing the systems array var			
					$("div .subject input[type='checkbox']").removeAttr('checked');
					systems = [];
					console.log("systems "+systems);
					$("#daily_quiz").animate({left: daily_quiz_div_expanded_x}, animationInterval, function(){
						$("#daily_quiz_builder").fadeOut(500);
					});
					$("#nh_test, #upg_test, #daily_quiz").animate({width:plus_box_width}, animationInterval);	
					$("#build_test").css("left", build_quiz_div_x_origin);
					$("* .password_info").hide();
					$("* .test_access_code, * .override_password").html("");
					
					bindCreateTestEvents();
					

				});
				
				$("#daily_quiz").click(function(){
					$("#nh_test, #upg_quiz").fadeOut("fast",function(){
						$("#daily_quiz").animate({left: "120px"}, animationInterval, function(){
							$("#daily_quiz_builder").fadeIn(500);
						});						
						$("#nh_test").css("left", nh_test_div_x_origin).css("display", "block");
						$("#upg_test").css("left", upg_test_div_x_origin).css("display", "block");	

					});
					
					bindCreateDailyQuizEvent();
				});

			});
		</script>
	
	
</head>
<body>

<?php
	ContentSnippets::doHeader();
?>


<div id='make_test_controls'>
		<div id="daily_quiz" class="plus_box yellow" >
			<div class="plus_sign">
				<div id="daily_quiz_title">Daily <br /> Quiz</div>
				<div class="test_access_code"></div>
			</div>
		</div>		
		<div id="upg_test" value="UPG" class="plus_box red" >
			<div id="upg_test_title">UPG</div>
			<div class='password_info'>				
				<div class="test_access_code"></div>
				<div class="password_title dark_red">Password</div>
				<div class="override_password"></div>
				<div class="override_password_title dark_red">Override Password</div>
			</div>		
		</div>			
		<div id="nh_test" value="SY9" class="plus_box blue" >
			<div id="nh_test_title">NH</div>
			<div class="password_info">
				<div class="test_access_code"></div>
				<div class="password_title dark_blue">Password</div>				
				<div class="override_password"></div>
				<div class="override_password_title dark_blue">Override Password</div>				
			</div>				
		</div>
		<div id="build_test" class="plus_box gray">
			<div class="plus_sign">
				<div class="vertical_bar"></div>
				<div class="horizontal_bar"></div>
			</div>
		</div>
		<div id="daily_quiz_builder">
			<div id="day1" class='systems_day_container'>
				<div class='subject_header'><input type=checkbox value='day_1'>Day 1</input></div>			
				<div class='subject'><input type=checkbox>Limitations</input></div>
			</div>
			<div id="day2" class='systems_day_container'>
				<div class='subject_header'><input type=checkbox value='day_2'>Day 2</input></div>
				<div class='subject'><input type=checkbox value='acft_gen'>Airplane Description</input> </div>
				<div class='subject'><input type=checkbox value='acft_gen'>Equipment &amp; Furnishings</input></div>
				<div class='subject'><input type=checkbox value='crew_awareness'>Crew Awareness</input></div>											
			</div>
			<div id="day3" class='systems_day_container'>
				<div class='subject_header'><input type=checkbox value='day_3'>Day 3</input></div>			
				<div class='subject'><input type=checkbox value='flight_ins'>Flight Instruments</input></div>
				<div class='subject'><input type=checkbox value='nav_comm'>Navigation &amp; Communications</input></div>
				<div class='subject'><input type=checkbox value='autopilot'>Autopilot</input></div>
				<div class='subject'><input type=checkbox value='acars'></input>ACARS</div>															
			</div>
			<div id="day4" class='systems_day_container'>
				<div class='subject_header'><input type=checkbox value='day_4'>Day 4</input></div>						
				<div class='subject'><input type=checkbox value='elec'>Electrical</input></div>
				<div class='subject'><input type=checkbox value='lighting'>Lighting</input></div>							
			</div>
			<div id="day5" class='systems_day_container'>
				<div class='subject_header'><input type=checkbox value='day_5'>Day 5</input></div>						
				<div class='subject'><input type=checkbox value='apu'>APU</input></div>
				<div class='subject'><input type=checkbox value='fuel'>Fuel</input></div>
				<div class='subject'><input type=checkbox value='powerplant'>Powerplant</input></div>
				<div class='subject'><input type=checkbox value='fire_prot'>Fire Protection</input></div>															
			</div>
			<div id="day6" class='systems_day_container'>
				<div class='subject_header'><input type=checkbox value='day_6'>Day 6</input></div>						
				<div class='subject'><input type=checkbox value='pneum'>Pneumatics</input></div>			
				<div class='subject'><input type=checkbox value='air_condition'>Air Conditioning</input></div>			
				<div class='subject'><input type=checkbox value='pressurization'>Pressurization</input></div>			
				<div class='subject'><input type=checkbox value='ice_rain_prot'>Ice &amp; Rain Protection</input></div>
			</div>
			<div id="day7" class='systems_day_container'>
				<div class='subject_header'><input type=checkbox value='day_7'>Day 7</input></div>						
				<div class='subject'><input type=checkbox value='oxy'>Oxygen</input></div>			
				<div class='subject'><input type=checkbox value='hydraulics'>Hydraulics</input></div>			
				<div class='subject'><input type=checkbox value='ldg_gear_brk'>Landing Gear &amp; Brakes</input></div>		
				<div class='subject'><input type=checkbox value='flt_control'>Flight Controls</input></div>																																			
			</div>			
		</div>
		
</div>

<div id="reports" class="plus_box red">
<div id='icon_holder'>
		<i class='fa fa-search'></i>
</div>
</div>


</body>		
</html>