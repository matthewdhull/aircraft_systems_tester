# Testing

**Author**: Matthew
## Test Cases
Test | Purpose | Steps to Perform | Expected Result | Actual Result | Pass/Fail |
-------------| -------------| -------------| -------------| -------------| -------------
1. Test that all Phases load when the Task Input Interface is loaded| Verify that Phases are viewable |Navigate to the Task Input Interface Page, Ensure that Phases load.  | Phases are visible if they have been created, otherwise, no Phases are displayed |TBD |TBD
2. Test that the 'Add Phase' button is displayed below the last Phase of displayed Phases| Verify that the button appears below the last Phase to cue the user to add a new Phase| Navigate to the Task Input Interface Page, enusre button is in the displayed and in the correct position |Button will be displayed below the last Phase or by itself if no Phases have been added yet |TBD |TBD
3. Test display of Phase Entry Form| Verify that clicking the 'Add Phase' button causes a form to be displayed and permits text entry for the Phase.|Click the Add Phase Button |A form permitting entry of the Phase title is loaded and below any other Phases, if they exist. |TBD |TBD
4. Test Saving a Phase| Verify that clicking the 'Save' button causes the Phase to be written to the database.|After entering text for  Phase title, click the 'Save' button. | All Phases will be reloaded and should include the Phase that was saved.  The Phases should be displayed in ascending order according to the input user number. |TBD |TBD
5. Test Viewing Tasks|Verify that expanding the Phase view shows Tasks for a Phase | Click the expansion UI element next to the Phase.|All Tasks for the Phase are displayed. |TBD|TBD
6. Test Viewing Sub-Tasks| Verify that expanding the Task View shows Sub-Tasks for a Task|  Click the expansion UI element next to the Task. |All Sub-Tasks for a Task are displayed.|TBD|TBD
7. Test display of Task Entry Form| Verify that clicking the 'Add Task' button causes a form to be displayed and permits text entry for the Task.|Click the Add Task Button.|A form permitting entry of the Task title, description, and number is loaded below any other Tasks for that Phase. |TBD|TBD
8. Test display of Sub-Task Entry Form|Verify that clicking the 'Add Sub-Task' button causes a form to be displayed and permits text entry for the Sub-Task.|Dlick the Add Sub-Task button.|A form permitting entry of the Sub-Task title, description, and number is loaded below any other Sub-Tasks for that Task.|TBD|TBD
9. Test Saving a Task|Verify that clicking the 'Save' button causes the Task to be written to the database. |Click the Save button next to the Task.| All Tasks for that Phase will be re-loaded and include the Task that was saved. The Tasks should be displayed in ascending order according to the input user number.|TBD|TBD
10. Test Saving a Sub-Task|Verify that clicking the 'Save' button causes the Sub-Task to be written to the database. |Click the Save button next to the Sub-Task.|All Sub-Tasks for that Task will be re-loaded and include the Sub-Task that was saved. The Sub-Tasks should be displayed in ascending order according to the input user number.|TBD|TBD
11. Test Association of Sub-Task with Question|Ensure that a Question may be associated with a Sub-Task in the Question modeling interface.|Select a Sub-Task from the drop-down menu and click Save.|When the interface is reloaded, the associated Sub-Tasks appears in the Sub-Task field for the Question.|TBD|TBD


