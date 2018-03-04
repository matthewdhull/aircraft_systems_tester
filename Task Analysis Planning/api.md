
#API


## Phases
#### GET ../getPhases.php
params: none
returns: JSON string of all Phases

#### POST ../createPhase.php
params:
name = (string) the name of the Phases
number = (int) a number supplied for ordering Phases
returns:  JSON string of all Phases, including new Phase

#### POST ../updatePhase.php
params:
id = (int) the id of the Phase to update
name = (string) the name of the Phases
number = (int) a number supplied for ordering Phases
returns:  JSON string of all Phases, including updated Phase

#### POST ../deletePhase.php
params:
id = (int) the id of the Phase to delete
returns:  JSON string of all existing Phases after delete.


## Tasks

#### GET ../getTasks.php?phaseId=phaseId
params:
phaseId = (int) the id of the parent Phase
returns: JSON string of all Tasks

#### POST ../createTask.php
params:
phaseId = (int) the id of the parent Phase
name = (string) the name of the Task
number = (int) a number supplied for ordering Tasks
returns:  JSON string of all Tasks, including new Task

#### POST ../updateTask.php
params:
id = (int) the id of the Task to update
name = (string) the name of the Tasks
number = (int) a number supplied for ordering Tasks
returns:  JSON string of all Tasks, including updated Task

#### POST ../deleteTask.php
params:
id = (int) the id of the Task to delete
returns:  JSON string of all existing Tasks after delete.

## Sub-Tasks

#### GET ../getSubTasks.php?taskId=taskId
params:
taskId = (int) the id of the parent Task
returns: JSON string of all Sub-Tasks

#### POST ../createSubtask.php
params:
taskId = (int) the id of the parent Task
name = (string) the name of the Sub-Task
number = (int) a number supplied for ordering Sub-Tasks
returns:  JSON string of all Sub-Tasks, including new Sub-Task

#### POST ../updateSubTask.php
params:
id = (int) the id of the Sub-Task to update
name = (string) the name of the Sub-Task
number = (int) a number supplied for ordering Sub-Tasks
returns:  JSON string of all Sub-Tasks, including updated Sub-Task

#### POST ../deleteSubTask.php
params:
id = (int) the id of the Sub-Tasks to delete
returns:  JSON string of all existing Sub-Tasks after delete.

