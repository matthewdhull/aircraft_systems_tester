<!doctype html>
<html lang="us">
<head>
	<meta charset="utf-8">
	<title>Test Modeling</title>
	<link href="js/jquery-ui.css" rel="stylesheet">
	<style>
		@import url('CSS/taskModeling.css');
	</style>
	
	<?php
		include 'Classes/contentClass.php';
		ContentSnippets::showFavicon();
	?>
	
    <script src="js/external/jquery/jquery.js"></script>
    <script>
	


    $(document).ready(function(){
        
        var blooms_levels;        
        jQuery.fn.sortElements = (function(){
     
        var sort = [].sort;
     
        return function(comparator, getSortable) {
     
            getSortable = getSortable || function(){return this;};
     
            var placements = this.map(function(){
     
                var sortElement = getSortable.call(this),
                    parentNode = sortElement.parentNode,
     
                    // Since the element itself will change position, we have
                    // to have some way of storing its original position in
                    // the DOM. The easiest way is to have a 'flag' node:
                    nextSibling = parentNode.insertBefore(
                        document.createTextNode(''),
                        sortElement.nextSibling
                    );
     
                return function() {
     
                    if (parentNode === this) {
                        throw new Error(
                            "You can't sort elements if any one is a descendant of another."
                        );
                    }
     
                    // Insert before flag:
                    parentNode.insertBefore(this, nextSibling);
                    // Remove flag:
                    parentNode.removeChild(nextSibling);
     
                };
     
            });
     
            return sort.call(this, comparator).each(function(i){
                placements[i].call(getSortable.call(this));
            });
     
        };
     
    })();        
        
        var phaseOrder = 0;
        
        function addKeyVerbsForLevel(ord){       
            return $.ajax({
                url: "PHPScripts/getBloomsVerbs.php",
                method: "POST",
                data: { ordinality: ord},
                dataType: "json"
            });       
        }
        
        function bindBloomsLevelChangeEvent(ordinality){
            $(this).find("option[id=o"+ordinality+"]").attr("selected", "selected");

            $( ".blooms_level" ).on( "change", function(event, bloomId) {
                
                var ord = $(this).children(":selected").attr("id");                
                ord = ord.slice(1);
                
                var self = this;
                
                var v = addKeyVerbsForLevel(ord);
                var w = $.when(v);
                w.done(function(){
                    var kv;
                    $.each(v.responseJSON, function(key,value){
                        kv += "<option id="+value.id+">"+value.key_verb+"</option>";
                    });
                    $(self).siblings('.key_verbs').find('option').remove();
                    $(self).siblings('.key_verbs').append(kv);
                    
                    if(typeof bloomId != 'undefined'){
                        $(self).siblings('.key_verbs').find("option[id="+bloomId+"]").attr("selected", "selected");
                    }
                    
                });
                            

            });
        }        

        function getBloomsLevelRange(sl,el){
            return $.ajax({
                url: "PHPScripts/getBloomsLevelsForRange.php",
                method: "POST",
                data: {startLevel: sl, endLevel: el},
                dataType: "json"
            });
        }

        function addBloomsLevels(){
            
            $.post("PHPScripts/getBlooms.php", 
                function(data){
                    blooms_levels = "<select class='blooms_level'>";                    
                    $.each(data, function(key,value){
                        blooms_levels += "<option id=o"+value.ordinality+">"+value.ordinality+"-"+value.level+"</option>";
                    });
                    blooms_levels += "</select>";
                }
            ,"json");
        }
        
        function loadElements(subtask_id) {
            $.post("PHPScripts/getElements.php", {
                subtaskId: subtask_id
            }, function(data){
                $("div#"+subtask_id+".subtask").find(".element").remove();
                $.each(data, function(key,value){
                    var html = "<div id="+value.id+" class='element' data-number="+value.number+">";                    
                    html += "<input type='text' class='element_order_input' name='element_order' value="+value.number+"></input>";
                    html += "<input type='text' class='element_input' name='element' value='"+value.name+"'></input>";                    
                    html += "<textarea class='element_description_input' name='element_description' value='"+value.description+"'>"+value.description+"</textarea>";
                    html += "<button class='saveElementButton'>Save Element</button>";
                    html += "<button class='deleteElementButton'>Delete Element</button>";
                    html += "</div>";
                   $("div#"+subtask_id+".subtask").find(".addElementButton").before(html); 
                   bindSaveElementEvent();
                   bindDeleteElementEvent();                
                });
                $("#"+subtask_id+"").find(".element").sortElements(function(a, b){
                    return $(a).attr("data-number") > $(b).attr("data-number") ? 1 : -1;
                });                 
                                
            }, "json");
        }
        
        function loadSubtasks(task_id) {
            
            
            var parent_bloom_level = parseInt($("div#"+task_id+".task").find(".blooms_level").children(":selected").attr("id").slice(1));
            //console.log("task parent_bloom_level: " + parent_bloom_level);
            
            if (parent_bloom_level < 6) { // go to the next lower bloom's level unless we are already there.
                parent_bloom_level += 1;
            }
            
            var keyVerbs = addKeyVerbsForLevel(parent_bloom_level);
            var theVerbs = $.when(keyVerbs);
            var verbOptions;                
        
            
            var blooms_level_restricted = getBloomsLevelRange(parent_bloom_level,6);
            var restricted_blooms = $.when(blooms_level_restricted);
            var blooms_options = "<select class='blooms_level'>";
            var self = this;            
            
            theVerbs.done(function(){
                
                $.each(keyVerbs.responseJSON, function(index,value){
                    verbOptions += "<option id="+value.id+">"+value.key_verb+"</option>";
                }); 
                
                
                restricted_blooms.done(function(){
                    
                    $.each(blooms_level_restricted.responseJSON, function(index, value){
                        blooms_options += "<option id=o"+value.ordinality+">"+value.ordinality+"-"+value.level+"</option>";
                    });                    
                
                    blooms_options += "</select>";
                    
                                
                    $.post("PHPScripts/getSubtasks.php", {
                        taskId: task_id
                    }, function(data){
                        $("div#"+task_id+".task").find(".subtask").remove();
                        $.each(data, function(key,value){
                            var html = "<div id="+value.id+" class='subtask' data-number="+value.number+">";
                            html += "Bloom's Level " + blooms_options;
                            html += "<br />";                                                     
                            html += "<input type='text' class='subtask_order_input' name='sub_task_order' value="+value.number+"></input>";                
                            html += "<select class='key_verbs'></select>";                                                    
                            html += "<input type='text' class='subtask_input' name='subtask' value='"+value.name+"'></input>";
                            html += "<textarea class='subtask_description_input' name='subtask_description' value='"+value.description+"'>"+value.description+"</textarea>"                    
                            html += "<button class='saveSubtaskButton'>Save Sub-Task</button>";
                            html += "<button class='deleteSubtaskButton'>Delete Sub-Task</button>";
                            html += "<button class='addElementButton'>+ Element</button>";                                        
                            html += "</div>";
                           $("div#"+task_id+".task").find(".addSubTaskButton").before(html); 
                           bindAddElementEvent();
                           bindSaveSubtaskEvent();
                           bindDeleteSubtaskEvent();
                           loadElements(value.id);
                           bindBloomsLevelChangeEvent(value.ordinality);
                            $("div#"+task_id+".task").find("div#"+value.id+".subtask").find(".key_verbs").append(verbOptions); 
                            $("div#"+task_id+".task").find("div#"+value.id+".subtask").find(".key_verbs").find("option[id="+value.bloomId+"]").attr("selected", "selected");
                        });
                        $("#"+task_id+"").find(".subtask").sortElements(function(a, b){
                            return $(a).attr("data-number") > $(b).attr("data-number") ? 1 : -1;
                        });                 
                                        
                    }, "json");

                });
            });
        }
        
        function loadTasks(phase_id){
            
            var parent_bloom_level = parseInt($("div#"+phase_id+".phase").find(".blooms_level").children(":selected").attr("id").slice(1));
            //console.log("parent phase bloom level: " + parent_bloom_level);
            
            if (parent_bloom_level < 6) { // go to the next lower bloom's level unless we are already there.
                parent_bloom_level += 1;
            }
            
            var keyVerbs = addKeyVerbsForLevel(parent_bloom_level);
            var theVerbs = $.when(keyVerbs);
            var verbOptions;                
        
            
            var blooms_level_restricted = getBloomsLevelRange(parent_bloom_level,6);
            var restricted_blooms = $.when(blooms_level_restricted);
            var blooms_options = "<select class='blooms_level'>";
            var self = this;            
            
            theVerbs.done(function(){
                
                $.each(keyVerbs.responseJSON, function(index,value){
                    verbOptions += "<option id="+value.id+">"+value.key_verb+"</option>";
                }); 
                
                
                restricted_blooms.done(function(){
                    
                    $.each(blooms_level_restricted.responseJSON, function(index, value){
                        blooms_options += "<option id=o"+value.ordinality+">"+value.ordinality+"-"+value.level+"</option>";
                    });                    
                
                    blooms_options += "</select>";
        			
        			$.post("PHPScripts/getTasks.php", {
            			phaseId: phase_id
        			}, function(data){
            			$("#"+phase_id+"").find(".task").remove();
                        $.each(data, function(key,value){                                             

                            var html = "<div id="+value.id+" class='task' data-number="+value.number+">";
                            html += "Bloom's Level " + blooms_options;
                            html += "<br />";                         
                            html += "<input type='text' class='task_order_input' name='task_order' value="+value.number+"></input>";                
                            html += "<select class='key_verbs'></select>";                        
                            html += "<input type='text' class='task_input' name='task' value='"+value.name+"'></input>";
                            html += "<textarea class='task_description_input' name='task_description' value='"+value.description+"'>"+value.description+"</textarea>"
                            html += "<button class='saveTaskButton'>Save Task</button>";
                            html += "<button class='deleteTaskButton'>Delete Task</button>";                    
                            html += "<button class='addSubTaskButton'>+ Sub-Task</button>";
                            html += "</div>";        
                                    
                            $("#"+phase_id+"").find(".addTaskButton").before(html);                              
                            bindAddSubTaskEvent();
                            bindSaveTaskEvent();
                            bindDeleteTaskEvent();
                            loadSubtasks(value.id); 
                            bindBloomsLevelChangeEvent(value.ordinality);
                            $("div#"+phase_id+".phase").find("div#"+value.id+".task").find(".key_verbs").append(verbOptions); 
                            $("div#"+phase_id+".phase").find("div#"+value.id+".task").find(".key_verbs").find("option[id="+value.bloomId+"]").attr("selected", "selected");                                                       
                        }); 
             
                        $("#"+phase_id+"").find(".task").sortElements(function(a, b){
                            return $(a).attr("data-number") > $(b).attr("data-number") ? 1 : -1;
                        });                 
                    
                    }, "json");               
    			
                });
                
            });                               	
        }
        
        function loadPhases(){
         
			$.post("PHPScripts/getPhases.php", function(data){
    			$("div .phase").remove();
                $.each(data, function(key,value){
                    var html = "<div id="+value.id+" class='phase' data-number="+value.number+">";
                    html += "Bloom's Level " + blooms_levels;
                    html += "<br />";                                
                    html += "<input type='text' class='phase_order_input' name='phase_order' value="+value.number+"></input>";
                    html += "<select class='key_verbs'></select>";
                    html += "<input type='text' class='phase_input' name='phase' value='"+value.name+"'></input>";
                    html += "<button class='savePhaseButton'>Save Phase</button>";
                    html += "<button class='deletePhaseButton'>Delete Phase</button>";                    
                    html += "<button class='addTaskButton'>+ Task</button>";
                    html += "</div>";    
                    $(".addPhaseButton").before(html);     
                    
                    $("#"+value.id+"").find(".blooms_level").find("option[id=o"+value.ordinality+"]").attr("selected", "selected");
                    
                    bindAddTaskButtonEvent();
                    bindSavePhaseEvent();    
                    bindDeletePhaseEvent();
                    bindBloomsLevelChangeEvent(value.ordinality);
                    $("#"+value.id+"").find(".blooms_level").trigger("change", [value.bloomId]);
                    loadTasks(value.id);
                    phaseOrder = parseInt(value.number) + 1;
                });
                
                
                $("div .phase").sortElements(function(a, b){
                    return $(a).attr("data-number") > $(b).attr("data-number") ? 1 : -1;
                });
			}, "json");         
        
            return false;
        }
        
        function bindDeleteElementEvent(){
            $(".deleteElementButton").off().click(function(){

                var id = $(this).parent().attr("id");
                $(this).parent().remove();
                
    			$.post("PHPScripts/deleteElement.php", {
        			elementId: id
    			}, function(data){
        			console.log(data);
    			});                       
                                
     
            });             
        }        
        
        function bindDeleteSubtaskEvent(){
            $(".deleteSubtaskButton").off().click(function(){

                var id = $(this).parent().attr("id");
                $(this).parent().remove();
                
    			$.post("PHPScripts/deleteSubtask.php", {
        			subtaskId: id
    			}, function(data){
        			console.log(data);
    			});                       
                                
     
            });             
        }

        function bindSaveElementEvent(){
            $(".saveElementButton").off().click(function(){
                var subtask_id = $(this).parent().parent().attr('id');
                var element_number = $(this).siblings(".element_order_input").val();
                var element_name = $(this).siblings(".element_input").val();
                var element_description = $(this).siblings(".element_description_input").val();
                var anId = $(this).parent().attr("id");

                if(typeof anId === "undefined"){
                    $.post("PHPScripts/createElement.php", {
                        subtaskId: subtask_id,
                        number: element_number,
                        name: element_name,
                        description: element_description
                    }, function(data){
                        loadElements(subtask_id);
                    });
                }
                
                else {
    				$.post("PHPScripts/updateElement.php", {
        				elementId: anId,
        				number: element_number,
        				name: element_name,
        				description: element_description
    				}, function(data){
                        loadElements(subtask_id);
    				});                      
                }
  
            })
        }
        
        function bindSaveSubtaskEvent(){
            $(".saveSubtaskButton").off().click(function(){
                var task_id = $(this).parent().parent().attr('id');
                var subtask_number = $(this).siblings(".subtask_order_input").val();
                var bloom_level = $(this).siblings(".key_verbs").children(":selected").attr("id");
                console.log("subtask key verb id: " + bloom_level);                              
                var subtask_name = $(this).siblings(".subtask_input").val();
                var subtask_description = $(this).siblings(".subtask_description_input").val();
                var anId = $(this).parent().attr("id");

                if(typeof anId === "undefined"){
                    $.post("PHPScripts/createSubtask.php", {
                        taskId: task_id,
                        number: subtask_number,
                        name: subtask_name,
                        description: subtask_description,
                        key_verb_id: bloom_level
                    }, function(data){
                        loadSubtasks(task_id);
                    });
                }
                
                else {
    				$.post("PHPScripts/updateSubtask.php", {
        				subtaskId: anId,
        				number: subtask_number,
        				name: subtask_name,
        				description: subtask_description,
        				key_verb_id: bloom_level
    				}, function(data){
                        loadSubtasks(task_id);
    				});                      
                }

                
            })
        }
        
        function bindDeleteTaskEvent(){
            $(".deleteTaskButton").off().click(function(){
                var subtasks = $(this).parent().find(".subtask").length;
                
                if(subtasks>0){
                    // do not delete a phase with any children tasks
                    console.log('children: '+ subtasks);
                    return false;
                }
                
                else {
                    var id = $(this).parent().attr("id");
                    $(this).parent().remove();
                    console.log("id of task to delete: " + id);
        			$.post("PHPScripts/deleteTask.php", {
            			taskId: id
        			}, function(data){
            			console.log(data);
        			});                       
                                    
                }
            });            
        }
        
        function bindSaveTaskEvent(){
            $(".saveTaskButton").off().click(function(){
                var phase_id = $(this).parent().parent().attr('id');
                var task_number = $(this).siblings(".task_order_input").val();
                var bloom_level = $(this).siblings(".key_verbs").children(":selected").attr("id");
                console.log("task key verb id: " + bloom_level);              
                var task_name = $(this).siblings(".task_input").val();
                var task_description = $(this).siblings(".task_description_input").val();
                var anId = $(this).parent().attr("id");
                
                if(typeof anId === "undefined"){
                    //task has not been saved
                    $.post("PHPScripts/createTask.php", {
                        phaseId: phase_id,
                        number: task_number,
                        name: task_name,
                        description: task_description,
                        key_verb_id: bloom_level
                    }, function(data){
                        loadTasks(phase_id);
                    });
                }
                else {
    				$.post("PHPScripts/updateTask.php", {
        				taskId: anId,
        				number: task_number,
        				name: task_name,
        				description: task_description,
        				key_verb_id: bloom_level
    				}, function(data){
                        loadTasks(phase_id);
    				});                     
                }
                

            })
        }
        
        function bindDeletePhaseEvent(){
            $(".deletePhaseButton").off().click(function(){
                var tasks = $(this).parent().find(".task").length;
                if(tasks>0){
                    // do not delete a phase with any children tasks
                    return false;
                }
                
                else {
                    var id = $(this).parent().attr("id");
                    $(this).parent().remove();
                    console.log("id of phase to delete: " + id);
        			$.post("PHPScripts/deletePhase.php", {
            			phaseId: id
        			}, function(data){
            			console.log('');
        			});                       
                                    
                }
            });
        }
        
        function bindSavePhaseEvent(){
            $(".savePhaseButton").off().click(function(){
                var phase_number = $(this).siblings(".phase_order_input").val()
                var bloom_level = $(this).siblings(".key_verbs").children(":selected").attr("id");
                console.log("key verb id: " + bloom_level);
                var phase_name = $(this).siblings(".phase_input").val();
                var anId = $(this).parent().attr("id");

                if (typeof anId === "undefined") {
                    // phase has not yet been saved.
    				$.post("PHPScripts/createPhase.php", {
        				number: phase_number,
        				name: phase_name,
        				key_verb_id: bloom_level
    				}, function(data){
                        loadPhases();
    				});                    
                }
                
                else {
                    // update the phase
    				$.post("PHPScripts/updatePhase.php", {
        				phaseId: anId,
        				number: phase_number,
        				name: phase_name,
                        key_verb_id: bloom_level        				
    				}, function(data){
                        loadPhases();
    				}); 
                }

            })
        }

        function bindAddElementEvent(){
            $(".addElementButton").off().click(function(){
                var html = "<div class='element'>";
                html += "<input type='text' class='element_order_input' name='element_order' placeholder=''></input>";                
                html += "<input type='text' class='element_input' name='element' placeholder='An Element'></input>";
                html += "<textarea class='element_description_input' name='element_description'></textarea>"
                html += "<button class='saveElementButton'>Save Element</button>";
                html += "<button class='deleteElementButton'>Delete Element</button>";
                html += "</div>";
               $(this).before(html);
               bindSaveElementEvent();
               bindDeleteElementEvent();
            });
        }         

        function bindAddSubTaskEvent(){
            $(".addSubTaskButton").off().click(function(){
                
                var parent_bloom_level = parseInt($(this).parent().find(".blooms_level").children(":selected").attr("id").slice(1));

                if (parent_bloom_level < 6) { // go to the next lower bloom's level unless we are already there.
                    parent_bloom_level += 1;
                }
                
                var keyVerbs = addKeyVerbsForLevel(parent_bloom_level);
                var theVerbs = $.when(keyVerbs);
                var verbOptions;                
            
                
                var blooms_level_restricted = getBloomsLevelRange(parent_bloom_level,6);
                var restricted_blooms = $.when(blooms_level_restricted);
                var blooms_options = "<select class='blooms_level'>";
                var self = this;
                
                theVerbs.done(function(){
                    
                    $.each(keyVerbs.responseJSON, function(index,value){
                        verbOptions += "<option id="+value.id+">"+value.key_verb+"</option>";
                    });
                    
                    restricted_blooms.done(function(){
                        
                        $.each(blooms_level_restricted.responseJSON, function(index, value){
                            blooms_options += "<option id=o"+value.ordinality+">"+value.ordinality+"-"+value.level+"</option>";
                        });
                        
                        blooms_options += "</select>";                
                        
                        var html = "<div class='subtask'>";
                        html += "Bloom's Level " + blooms_options;
                        html += "<br />";                                             
                        html += "<input type='text' class='subtask_order_input' name='sub_task_order' placeholder=''></input>";                
                        html += "<select class='key_verbs'></select>";                        
                        html += "<input type='text' class='subtask_input' name='subtask' placeholder='A Sub-Task'></input>";
                        html += "<textarea class='subtask_description_input' name='subtask_description'></textarea>"
                        html += "<button class='saveSubtaskButton'>Save Sub-Task</button>";
                        html += "<button class='deleteSubtaskButton'>Delete Sub-Task</button>";
                        html += "</div>";
                       $(self).before(html);
                       bindAddElementEvent();
                       bindSaveSubtaskEvent();
                       bindDeleteSubtaskEvent();
                       bindBloomsLevelChangeEvent();
                       $(self).prev("div .subtask").find(".key_verbs").append(verbOptions);                       
                    });
                });
            });
        }    
                
        function bindAddTaskButtonEvent(){
            $(".addTaskButton").off().click(function(){
                var parent_bloom_level = parseInt($(this).parent().find(".blooms_level").children(":selected").attr("id").slice(1));
                
                
                if (parent_bloom_level < 6) { // go to the next lower bloom's level unless we are already there.
                    parent_bloom_level += 1;
                }
                
                var keyVerbs = addKeyVerbsForLevel(parent_bloom_level);
                var theVerbs = $.when(keyVerbs);
                var verbOptions;                
            
                
                var blooms_level_restricted = getBloomsLevelRange(parent_bloom_level,6);
                var restricted_blooms = $.when(blooms_level_restricted);
                var blooms_options = "<select class='blooms_level'>";
                var self = this;
                

                
                theVerbs.done(function(){
                    
                    $.each(keyVerbs.responseJSON, function(index,value){
                        verbOptions += "<option id="+value.id+">"+value.key_verb+"</option>";
                    });
                    
                    restricted_blooms.done(function(){
                        
                        $.each(blooms_level_restricted.responseJSON, function(index, value){
                            blooms_options += "<option id=o"+value.ordinality+">"+value.ordinality+"-"+value.level+"</option>";
                        });
                        
                        blooms_options += "</select>";
                        
                        var html = "<div class='task'>";
                        html += "Bloom's Level " + blooms_options;
                        html += "<br />";                     
                        html += "<input type='text' class='task_order_input' name='task_order' placeholder=''></input>";                
                        html += "<select class='key_verbs'></select>";
                        html += "<input type='text' class='task_input' name='task' placeholder='A Task'></input>";
                        html += "<textarea class='task_description_input' name='task_description'></textarea>"                
                        html += "<button class='saveTaskButton'>Save Task</button>";
                        html += "<button class='deleteTaskButton'>Delete Task</button>";
                        html += "<button class='addSubTaskButton'>+ Sub-Task</button>";
                        html += "</div>";           
                        $(self).before(html);
                        bindAddSubTaskEvent();
                        bindSaveTaskEvent();
                        bindDeleteTaskEvent();
                        bindBloomsLevelChangeEvent();
                        $(self).prev("div .task").find(".key_verbs").append(verbOptions);
                    });
                
                });

            });            
        }        

        $(".addPhaseButton").click(function(){
            var v = addKeyVerbsForLevel(1);
            var w = $.when(v);
            var z;
            var self = this;

            w.done(function(){
                $.each(v.responseJSON, function(index,value){
                    z += "<option id="+value.id+">"+value.key_verb+"</option>";                    
                });
                
                phaseOrder = parseInt($(self).prev("div .phase").find('.phase_order_input').val());
                
                if (isNaN(phaseOrder)) {
                    phaseOrder = 1;    
                }
                else {
                    phaseOrder +=1;
                }
                
                var html = "<div class='phase'>";
                html += "Bloom's Level " + blooms_levels;
                html += "<br />"; 
                html += "<input type='text' class='phase_order_input' name='phase_order' value="+phaseOrder+"></input>";
                html += "<select class='key_verbs'></select>";                           
                html += "<input type='text' class='phase_input' name='phase' placeholder='A Phase'></input>";
                html += "<button class='savePhaseButton'>Save Phase</button>";
                html += "<button class='deletePhaseButton'>Delete Phase</button>";
                html += "<button class='addTaskButton'>+ Task</button>";
                html += "</div>";                                                         
                $(self).before(html);
                bindAddTaskButtonEvent();
                bindSavePhaseEvent();
                bindDeletePhaseEvent();
                bindBloomsLevelChangeEvent();                       
                
                
                
                $(self).prev("div .phase").find(".key_verbs").append(z);
            });

        });
        
        
        addBloomsLevels();
        addKeyVerbsForLevel(1);
        loadPhases();
    })
    
    
	</script>
    
    
    </head>
    	
	
</head>
<body>
		<?php
			ContentSnippets::doHeader();
			ContentSnippets::doNavigationBar();
		?>
	

    <div id='tree'>      
        <button class='addPhaseButton' name='button' text='button' value='button'> + phase</button>                      
    </div>



</body>
</html>
