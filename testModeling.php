<!doctype html>
<html lang="us">
<head>
	<meta charset="utf-8">
	<title>Test Modeling</title>
	<link href="js/jquery-ui.css" rel="stylesheet">
	<style>
		@import url('CSS/testModeling.css');
	</style>
	
	<?php
		include 'Classes/contentClass.php';
		ContentSnippets::showFavicon();
	?>
	
</head>
<body>
		<?php
			ContentSnippets::doHeader();
			ContentSnippets::doNavigationBar();
		?>
	
	<ul id="testModelOptions">	
		<li>
			<select id='fleet'>
				<option value=1>ERJ</option>
				<option value=2>CRJ</option>
			</select>
		</li>		
		<li>
			<select id="courseType">
				<option value="SYS">SYS</option>
				<option value="UPG">UPG</option>
			</select>
		</li>		
			<li>
				<select id="testLength">
					<option value="100">100</option>
					<option value="50">50</option>
					<option value="25">25</option>
					<option value="10">10</option>
				</select>
			</li>
			<li>
				Name&nbsp;<input type='text' id='newTestModelName' />
			</li>
			<li>
				<input id="submitButton" type="submit" value="submit" name="submit">
			</li>
			<li>
				Total Added &nbsp;<input id="totalQuestions" type="text" readonly />
			</li>
		</ul>
		<div id="progressBar"></div>
		<div id="accordion" style="margin-top: 25px;">
		</div>


<script src="js/external/jquery/jquery.js"></script>
<script src="js/jquery-ui.js"></script>
<script>
	


$(document).ready(function(){
	
	var isAdmin = false;	
	
	//holds spo_ids as key & spo count for increment/decrement events/maxVal checking	
	var spoCount = [];
	
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
						$("#accordion, #testModelOptions").css("visibility", "visible");
					}
					else if(isAdmin == false){
						$("#accordion, #testModelOptions").css("visibility", "hidden");
					}
					$("#instructorID").val(data.employeeNo);
				}
				else{
					clearScreenForLogout();
				}
			}, "json");
	}
						
	function updateQuantities(){
		var sum = 0;
		$("#accordion :input[class='spo_count_spec']").each(function(){
			sum += Number($(this).val());
		});
		
		$("#totalQuestions").val(sum);					
	}
		
	function bindIncrementDecrementEvents(){
		
		$('#accordion .action-button a').click(function () {
		    var $button = $(this);
		    var oldValue = $button.parent().parent().find("input").val();
		    //console.log("oldValue: "+oldValue);
		    var minVal = $button.parent().parent().next($('div')).find($('input:checkbox:checked')).length;
		    
		    //lookup parent h3 id (spo_id) to determine count for an spo. this will 
		    //be used to prevent the question count from being set above the current 
		    //number of Q's in the database for a given spo.
		    
			var parentId = $(this).parent().parent().attr('id');
			var maxVal = parseFloat(spoCount[parentId]);			
				
		    if ($button.text() == "+") {

		        //dont allow incrementing above maxVal
		        if (oldValue < maxVal){
			        var newVal = parseFloat(oldValue) + 1;			        
		        } else {
					newVal = maxVal;			        
		        }
		        
		    } else {
		        // Don't allow decrementing below zero
		        if (oldValue > minVal) {
		            var newVal = parseFloat(oldValue) - 1;
		        } else {
		            newVal = minVal;
		        }
		    }
		
		    $button.parent().parent().find("input").val(newVal);
		    updateQuantities();

});	
		
	}		

	function bindCheckboxEvents(){
		$(":checkbox").change(function(){
			if($(this).prop('checked') == true){
				var pntId = $(this).parent().parent().parent().prev().attr('id');
				$("h3[id='"+pntId+"'] .action-button a.ui-icon-plusthick").click();
			}
		});
	}
	
	function bindGetElementEvent(){
		$("#accordion h3").click(function(){
			//only had EOs if they haven't already been populated
			if($(this).hasClass('eoPopulated')==false){
				var spoId = $(this).attr("id");
				var theOpt = "getEnteredEOs";
				var vnt = $("#fleet").val();
				var eos = "<ul>";
				$.post("PHPScripts/admin/getReports.php", {
					variant: vnt,
					spo_id: spoId,
					option: theOpt
				}, function(data){
					$.each(data, function(key,value){
						eos += "<li><input value="+value.eo_id+" type='checkbox' />"+value.element_name+"</li>";
					});
					eos += "</ul>";
					$("#accordion h3[id='"+spoId+"']").next($('div')).append(eos);
					$("#accordion h3[id='"+spoId+"']").addClass('eoPopulated');
					$("#accordion").accordion( "option", "heightStyle", "content" );					
					$("#accordion").accordion("refresh");
					bindCheckboxEvents();
				}, "json");
			}
		});
	}					
	
	function getQuestionQuantityForSPO(variant_type){
			$("#accordion").remove();

			var spo = "<div id='accordion' style='margin-top: 25px'>";

			$.post("PHPScripts/getQuestionCount.php", {
				variant: variant_type
			}, function(data){
				$.each(data, function(key, value){	
					spo += "<h3 id='"+value.spo_id+"'>"+value.spo+"";
					spo += "(<span style='color: rgb(54,136,251)'>"+value.count+"</span>)";
					spo += "<span class='action-button ui-state-default ui-corner-all'><a class='ui-icon ui-icon-plusthick btpad'>+</a></span>";
					spo += "<span class='action-button ui-state-default ui-corner-all'><a class='ui-icon ui-icon-minusthick btpad'>-</a></span>";
					spo += "<input class='spo_count_spec' value=0 readonly></h3>";
					spo += "<div class='eo_container'></div>";
					spoCount[value.spo_id] = value.count;
				});	
				
				spo += "</div>";
			
				
				$("#accordion").append(spo);
				
				$(spo).insertAfter("#testModelOptions");
				
				$("#accordion").accordion({
				    heightStyle: 'content',
				    animate: 250
				});
				
				bindIncrementDecrementEvents();	
				
				//lazy load elements when an SPO is clicked on
				bindGetElementEvent();
				
			},"json");
		}
	
	$("#submitButton").click(function(){
		$("#progressBar").css("visibility", "visible");
		var spoAndCount = [];
		var mandatoryEOs = [];
		var len = $("#testLength").val();
		var typ = $("#courseType").val();
		var fleet_type = $("#fleet").val();
		var modelNm = $("#newTestModelName").val();
		
		//get SPOs and question Count
		$("#accordion :input[class='spo_count_spec']").each(function(){
			var input = $(this);
			spo_spec = {"id":input.parent().attr('id'), "count":input.val()};
			spoAndCount.push(spo_spec);
		});
		
		//get mandatory EOs and parent SPOs
		$("#accordion :input:checkbox:checked").each(function(){
			var parentSpoId = $(this).parent().parent().parent().prev().attr('id');
			var eoId = $(this).val();
			var eoSpoPair = {"parentSpo":parentSpoId, "eo":eoId};
			mandatoryEOs.push(eoSpoPair);
		});
		
		$.post("PHPScripts/newTestModel.php", {
			variant: fleet_type,
			length: len,
			course_type: typ,
			model: spoAndCount,
			requiredEOs: mandatoryEOs,
			modelName: modelNm
		}, function(data){
			$("#progressBar").css("visibility", "hidden");			
		});
		return false;
	});	

	$('#accordion .action-button').hover(function () {
	    $(this).addClass('ui-state-hover');
	},function () {
	    $(this).removeClass('ui-state-hover');
	});

	$("#fleet").change(function(){
		getQuestionQuantityForSPO($("#fleet").val());
		$("#totalQuestions").val(0);
	});
	
	$("#fleet").trigger("change");
	
	checkLoginStatus();	
});

	</script>
</body>
</html>
