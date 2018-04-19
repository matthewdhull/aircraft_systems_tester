<?php



class Question {
	

	//set in constructor
	public $type; 
	public $subject;
	public $subcategory; 
	public $spo;
	public $spo_id;
	public $eo;
	public $variant;
	public $question; 
	public $question_wordings = array();
	public $correct_answer; 
	public $alt_correct_answer;
	public $last_correct_answer;
	public $wrong_answers = array(); 	
	public $database = 'xjtest';


	
	//not set in constructor
	public $answer_choices = array(); //dictionary
	public $answer_key;
	public $questionID;
	
		
	function __get($name) {
		return $this->$name;
	}
	
	function __set($name, $value) {
		$this->$name = $value;
	} 

	private static function getConnection(){

        include 'XJTestDBConnect.php';

		$con = mysql_connect( $host, $usn, $password);		

		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);
		return $con;
	
	}	
	
	//returns a the letter of the correct answer ("A", "D", etc.)
	function get_answer_key(){
		foreach($this->answer_choices as $key => $value){
			if($value == $this->correct_answer){
				$this->answer_key = strtoupper($key);
			}
		}
	}
	
	private function set_answer_choices() {
		if ($this->type == "tf") {
			$this->answer_choices = array("a"=>"TRUE", "b"=>"FALSE");
		}
		
		else {
			if(isset($this->wrong_answers)){
				$choices = array();
				$choices = $this->wrong_answers;
				array_push($choices, $this->correct_answer);
				shuffle($choices);
				$this->answer_choices = array("a"=>$choices[0], "b"=>$choices[1], "c"=>$choices[2], "d"=>$choices[3]);
			}
		}
		
		$this->get_answer_key();
		
	}
		
	private function set_question_wordings($arr){
		$newArr = array();
			$newArr = array("a"=>$arr[0], "b"=>$arr[1]);
		
		$this->question_wordings = $newArr;
		
	}
		
	private function evaluateQuestionType($string){
		if($string == "tf"){
			return "True/False";
		} elseif($string == "mc"){
			return "Multiple Choice";
		} elseif($string == "ac"){
			return "All Correct";
		} elseif($string == "nc"){
			return "None Correct";
		} elseif($string == "c2"){
			return "Multiple Correct";
		} else {
			return $string." is an un-recognized Question Type";
		}
	}

	private function getVariantId($variantStr) {

		$con = self::getConnection();		
				
		$variant_id;	

		$get_variant_id_query = "SELECT `variant_id` FROM `variant` WHERE `variant_name` = '".$variantStr."'";
		
		$variant_id_result = mysql_query($get_variant_id_query);
		$row = mysql_fetch_row($variant_id_result);
		$variant_id = $row[0];		
		
		if (!$variant_id_result) {
	    	echo "Could not successfully run query ($get_variant_id_query) from DB: " . mysql_error();
		}
		mysql_close($con);	
		
		return $variant_id;	
		
	}		
		
	//displays all attributes for question.  
	public function inspect_question(){
		echo "<br />";
		echo "TYPE: ".$this->type."<br />";
		echo "SUBJECT: ".$this->subject."<br />";
		echo "SPO: ".$this->subcategory."<br />";
		//echo "SPO: ".$this->spo_id."<br />";
		echo "EO: ".$this->eo."<br />";
		echo "QUESTION_A: ".$this->question_wordings['a']."<br />";
		echo "QUESTION_B: ".$this->question_wordings['b']."<br />";
		echo "CORRECT ANSWER: ".$this->correct_answer."<br />";
		echo "ALT CORRECT ANSWER: ".$this->alt_correct_answer."<br />";
		echo "LAST CORRECT ANSWER: ".$this->last_correct_answer."<br />";
		echo "WRONG ANSWERS: ";
		foreach($this->wrong_answers as $element) {
			echo $element.", ";
		}
		echo "<br />";
		echo $this->$answer_key."<br />";
	}
	
	public function json_question(){
		$attr = array();
		$attr['type'] = $this->type;
		$attr['category'] = $this->category;
		//$attr['subcategory'] = $this->subcategory;
		$attr['spo'] = $this->spo;
		$attr['eo'] = $this->eo;
		$attr['variant'] = $this->variant;
		$attr['question_a'] = $this->question_wordings['a'];
		$attr['question_b'] = $this->question_wordings['b'];
		$attr['correct_ans'] = $this->correct_answer;
		$attr['alt_correct_ans'] = $this->alt_correct_answer;
		$attr['last_correct_ans'] = $this->last_correct_answer;
		$attr['ans_x'] = $this->wrong_answers[0];
		$attr['ans_y'] = $this->wrong_answers[1];
		$attr['ans_z'] = $this->wrong_answers[2];
		
		$attr  = json_encode($attr);
		return $attr;
	}
	
	public static function questionFromID($id){

		$question = new Question(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
		$question->questionID = $id;

		$con = self::getConnection();
				
		$fetchQuestionQuery = "SELECT questions.type, questions.category, questions.spo_id, SPO.spo_name AS `spo`, EO.element_name AS `eo`, questions.correct_answer, questions.alt_correct_answer, questions.last_correct_answer, questions.ans_x, questions.ans_y, questions.ans_z, questions.question_a, questions.question_b FROM `questions` JOIN `SPO` USING (`spo_id`) JOIN `EO` USING (`eo_id`) WHERE `questionID` = ".$id."";	
		
		
				
		$fetchQuestionResult = mysql_query($fetchQuestionQuery);
		if(!$fetchQuestionResult){
			die("could not run fetch question query for qID = ".$id." ($fetchQuestionQuery) ".mysql_error());
		}
		
		$wordingsArr = array();
		while ($row = mysql_fetch_array($fetchQuestionResult)){
			$question->type = $row['type'];
			$question->subject = $row['category'];
			$question->spo_id = $row['spo_id'];
			$question->subcategory = $row['spo'];
			$question->eo = $row['eo'];
			$question->correct_answer = $row['correct_answer'];
			$question->alt_correct_answer = $row['alt_correct_answer'];
			$question->last_correct_answer = $row['last_correct_answer'];
			$question->wrong_answers = array($row['ans_x'], $row['ans_y'], $row['ans_z']);
			$wordingsArr = array($row['question_a'], $row['question_b']);
		}
				
		$question->set_answer_choices();
		$question->set_question_wordings($wordingsArr);
		
		return $question;		
	}
	
	public function __construct($typeStr, $subjectStr, $subcatStr, $spoStr, $eoStr, $variantStr, $questionWordingsArr, $c_ansStr, $alt_c_ansStr, $last_c_ansStr, $wrong_ansArr) {
		$this->type = $typeStr;
		$this->subject = $subjectStr;
		$this->subcategory = $subcatStr;
		$this->spo = $spoStr;
		$this->eo = $eoStr;
		$this->variant = $this->getVariantId($variantStr);
		$this->correct_answer = $c_ansStr;
		$this->alt_correct_answer = $alt_c_ansStr;	
		$this->last_correct_answer = $last_c_ansStr;	
		$this->wrong_answers = $wrong_ansArr;
		
		$this->set_question_wordings($questionWordingsArr);
		$this->set_answer_choices();
						
	}
	
	public function generate_test_question(){
		$testQuestion = array();
		$testQuestion['questionID'] = $this->questionID;	
		$testQuestion['type'] = $this->type;
		$testQuestion['subcategory'] = $this->spo;
		$testQuestion['spo_id'] = $this->spo_id;


		
		if($this->question_wordings['b'] == "") {
			$testQuestion['questionText'] = $this->question_wordings['a'];
		}
		else{
			$arr = array($this->question_wordings['a'], $this->question_wordings['b']);
			shuffle($arr);
			$testQuestion['questionText'] = $arr[0];
		}
		

		if ($this->type == "tf"){
			//set answer choices.
			$testQuestion['a'] = "TRUE";
			$testQuestion['b'] = "FALSE";
			
			//check actual correct answer.
			if($this->correct_answer == "TRUE"){
				$testQuestion['key'] = "a";
			}
			else{
				$testQuestion['key'] = "b";
			}
		}
		
		elseif ($this->type == "mc"){
			
			//regex to match amount of digits in each answer.  If number exceeds 7, do not use aota/nota.
			$searchAns = array();
			$searchAns = $this->wrong_answers;
			array_push($searchAns, $this->correct_answer);
			$digitCt = 0;
			foreach($searchAns as $choice){
				$amt = preg_match_all("/[0-9]/", $choice, $matches);
				$digitCt += $amt;
			}
			
			/*
			AOTA = all of the above.
			NOTA = none of the above.
			
			TODO:  Look @ answers and see if answer contains more than 1, 2 digits.  If so: DO not generate AOTA/NOTA question.
			*/			
			$aotaNota = rand(0,2);
			
			//this will return true (25-35% of the time)
			if($aotaNota==2 && ($digitCt<=7)){
				
				$answerType = array("All of the above.", "None of the above.");
				shuffle($answerType);
				$testQuestion['d'] = $answerType[0];

				$ac = array("a", "b", "c");
				shuffle($ac);
				$testQuestion['key'] = $ac[0];
				$testQuestion[$testQuestion['key']] = $this->correct_answer;
				
				$wrongAnsArr = array();
				$wrongAnsArr = $this->wrong_answers;
				shuffle($wrongAnsArr);
				$testQuestion[$ac[1]] = $wrongAnsArr[0];
				$testQuestion[$ac[2]] = $wrongAnsArr[1];
			}
			else {
				$ac = array("a", "b", "c", "d");
				shuffle($ac);
				$testQuestion['key'] = $ac[0];
				$testQuestion[$testQuestion['key']] = $this->correct_answer;
				$testQuestion[$ac[1]] = $this->wrong_answers[0];
				$testQuestion[$ac[2]] = $this->wrong_answers[1];
				$testQuestion[$ac[3]] = $this->wrong_answers[2];
			}
						
		}
		
		elseif ($this->type == "c2"){
			//if c2, shuffle answers, find 2 correct answers, extract their key location, then generate answer key as (D. both X and X)
			$ac = array("a", "b", "c");
			shuffle($ac);
			$testQuestion[$ac[2]] = $this->wrong_answers[0];
			array_pop($ac);
			sort($ac);
			$testQuestion[$ac[0]] = $this->correct_answer;
			$testQuestion[$ac[1]] = $this->alt_correct_answer;
			$testQuestion['key'] = "d";	
			$testQuestion['d'] = strtoupper($ac[0])." and ".strtoupper($ac[1])." are correct.";
		
		}
		elseif ($this->type == "ac"){
			//if ac, shuffle answers, generate answer key as (D. All of the above)
			$ac = array("a", "b", "c");
			shuffle($ac);
			$testQuestion[$ac[0]] = $this->correct_answer;
			$testQuestion[$ac[1]] = $this->alt_correct_answer;
			$testQuestion[$ac[2]] = $this->last_correct_answer;
			$testQuestion['key'] = "d";
			$testQuestion['d'] = "All of the above.";
			
		}
		elseif ($this->type == "nc"){
			//if nc, shuffle answers, generate answer key as (D. None of the above) 
			$ac  = array("a", "b", "c");
			shuffle($ac);
			$testQuestion[$ac[0]] = $this->wrong_answers[0];
			$testQuestion[$ac[1]] = $this->wrong_answers[1];
			$testQuestion[$ac[2]] = $this->wrong_answers[2];
			$testQuestion['key'] = "d";
			$testQuestion['d'] = "None of the above.";
			
			
		}
		
		//$testQuestion = json_encode($testQuestion);
		return $testQuestion;

/*		
		['questionID']
		['type']
		['subcategor']
		['questionText']
		['a']
		['b']
		['c']
		['d']
		['key']
		echo "Question ID: ".$this->questionID."<br />";
		echo "Question text: ".$testQuestion['questionText']."<br /><br />";
		echo "A: ".$testQuestion['a']."<br />";
		echo "B: ".$testQuestion['b']."<br />";
		echo "C: ".$testQuestion['c']."<br />";
		echo "D: ".$testQuestion['d']."<br /><br />";
		echo "Correct Answer: ".strtoupper($testQuestion['key']).": ".$testQuestion[$testQuestion['key']]."<br /><br /><br />";
*/
		
	}
	
	public function ask_question() {
		echo $this->question_wordings['a']."<br />";
		echo $this->question_wordings['b']."<br />";
		echo "A. ".$this->answer_choices["a"]."<br />";
		echo "B. ".$this->answer_choices["b"]."<br />";
		
		if ($this->type == "mc") {
			echo "C. ".$this->answer_choices["c"]."<br />";
			echo "D. ".$this->answer_choices["d"]."<br />";
		}
		echo "<br />";
		echo "Correct Answer: ".$this->answer_key."<br /><br />";
	}
	
	public function insert_new_question($qType) {

		
		$con = self::getConnection();
				
		//escape strings prior to insertion
		$question_a = mysql_real_escape_string($this->question_wordings['a']);
		$question_b = mysql_real_escape_string($this->question_wordings['b']);
		$correct_ans = mysql_real_escape_string($this->correct_answer);
		$alt_correct_ans = mysql_real_escape_string($this->alt_correct_answer);
		$last_correct_ans = mysql_real_escape_string($this->last_correct_answer);
		$ans_x = mysql_real_escape_string($this->wrong_answers[0]);
		$ans_y = mysql_real_escape_string($this->wrong_answers[1]);
		$ans_z = mysql_real_escape_string($this->wrong_answers[2]);
		
		$new_question_query = "";
		
		if($qType=="mc"){
		//multiple choice question
			$new_question_query = "INSERT INTO `questions` VALUES (";
			$new_question_query .= "NULL,";
			$new_question_query .= "'".$this->subject."', ";
			$new_question_query .= "'".$this->subcategory."',";
			$new_question_query .= "NULL,";
            $new_question_query .= "NULL,";			
			$new_question_query .= "".$this->variant.",";
			$new_question_query .= "'".$this->type."',";
			$new_question_query .= "'{$correct_ans}',";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,";
			$new_question_query .= "'{$ans_x}',";
			$new_question_query .= "'{$ans_y}',";
			$new_question_query .= "'{$ans_z}',";
			$new_question_query .= "'{$question_a}',";
			$new_question_query .= "'{$question_b}',";
            $new_question_query .= "'".$this->spo."',";
            $new_question_query .= "'".$this->eo."')";            			
		}
		
		
		elseif($qType=="c2"){
			$new_question_query = "INSERT INTO `questions` VALUES (NULL,";
			$new_question_query .= "'".$this->subject."', ";
			$new_question_query .= "'".$this->subcategory."', ";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,";			
			$new_question_query .= "".$this->variant.",";
			$new_question_query .= "'".$this->type."',";
			$new_question_query .= "'{$correct_ans}',";
			$new_question_query .= "'{$alt_correct_ans}',";
			$new_question_query .= "NULL,";
			$new_question_query .= "'{$ans_x}',";
			$new_question_query .= "NULL,";
			$new_question_query.= "NULL,";
			$new_question_query .= "'{$question_a}',";
			$new_question_query .= "'{$question_b}',";
            $new_question_query .= "'".$this->spo."',";
            $new_question_query .= "'".$this->eo."')";            			

		}
		
		elseif($qType=="tf"){
		// true false question
			$new_question_query = "INSERT INTO `questions` VALUES (NULL, ";
			$new_question_query .= "'".$this->subject."', ";
			$new_question_query .= "'".$this->subcategory."', ";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,";
			$new_question_query .= "".$this->variant.",";
			$new_question_query .= "'".$this->type."', ";
			$new_question_query .= "'{$correct_ans}',";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,"; 
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,"; 
			$new_question_query .= "NULL,"; 
			$new_question_query .= "'{$question_a}',";
			$new_question_query .= "'{$question_b}',";
            $new_question_query .= "'".$this->spo."',";
            $new_question_query .= "'".$this->eo."')";            			

		}
		
		elseif($qType=="nc"){
			$new_question_query = "INSERT INTO `questions` VALUES (NULL, ";
			$new_quesiton_query .= "'".$this->subject."', ";
			$new_quesiton_query .= "'".$this->subcategory."', ";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,";
			$new_question_query .= "".$this->variant.",";
			$new_question_query .= "'".$this->type."',";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,";
			$new_question_query .= "'{$ans_x}',";
			$new_question_query .= "'{$ans_y}',";
			$new_question_query .= "'{$ans_z}',";
			$new_question_query .= "'{$question_a}',";
			$new_question_query .= "'{$question_b}',";
            $new_question_query .= "'".$this->spo."',";
            $new_question_query .= "'".$this->eo."')";            			
		}
		elseif($qType=="ac"){
			$new_question_query = "INSERT INTO `questions` VALUES (NULL, ";
			$new_question_query .= "'".$this->subject."', ";
			$new_question_query .= "'".$this->subcategory."', ";
			$new_question_query .= "NULL,";
			$new_question_query .= "NULL,";
			$new_question_query .= "".$this->variant.",";
			$new_question_query .= "'".$this->type."', ";
			$new_question_query .= "'{$correct_ans}',";
			$new_question_query .= "'{$alt_correct_ans}',";
			$new_question_query .= "'{$last_correct_ans}',";
			$new_question_query .= "NULL, ";
			$new_question_query .= "NULL, ";
			$new_question_query .= "NULL, ";
			$new_question_query .= "'{$question_a}',";
            $new_question_query .= "'{$question_b}',";			
            $new_question_query .= "'".$this->spo."',";
            $new_question_query .= "'".$this->eo."')";            			
		
		}
		
		
		//$con = mysql_connect($host,$usn, $password);

/*
		if (!$con){
		  die('Could not connect: ' . mysql_error());
		 }
		
		mysql_select_db($database, $con);	
*/

		
		$newQuestionResult = mysql_query($new_question_query);
		
		if (!$newQuestionResult) {
	    	echo "Could not successfully run query ($new_question_query) from DB: " . mysql_error();
		}

		
/* 		mysql_close($con); */
		
	}
	
	public function update_question($questionID){


		$con = self::getConnection();		
				
				
		$question_a = mysql_real_escape_string($this->question_wordings['a']);
		$question_b = mysql_real_escape_string($this->question_wordings['b']);
		$correct_ans = mysql_real_escape_string($this->correct_answer);
		$alt_correct_ans = mysql_real_escape_string($this->alt_correct_answer);
		$last_correct_ans = mysql_real_escape_string($this->last_correct_answer);
		$ans_x = mysql_real_escape_string($this->wrong_answers[0]);
		$ans_y = mysql_real_escape_string($this->wrong_answers[1]);
		$ans_z = mysql_real_escape_string($this->wrong_answers[2]);
				

		
		$updateQuestionQuery = "UPDATE `questions` SET `type` = ";
		$updateQuestionQuery .= "'".$this->type."',";
		$updateQuestionQuery .= "`subcategory` = ' ',";
		$updateQuestionQuery .= "NULL,";
		$updateQuestionQuery .= "NULL,";
		$updateQuestionQuery .= "`variant_id` = '".$this->variant."',";
		$updateQuestionQuery .= "`correct_answer` = '{$correct_ans}',";
		$updateQuestionQuery .= "`alt_correct_answer` = '{$alt_correct_ans}',";
		$updateQuestionQuery .= "`last_correct_answer` = '{$last_correct_ans}',";
		$updateQuestionQuery .= "`ans_x` = '{$ans_x}',";
		$updateQuestionQuery .= "`ans_y` = '{$ans_y}',";
		$updateQuestionQuery .= "`ans_z` = '{$ans_z}',";
		$updateQuestionQuery .= "`question_a` = '{$question_a}',";
		$updateQuestionQuery .= "`question_b` = '{$question_b}'";
        $new_question_query .= "'".$this->spo."',";
        $new_question_query .= "'".$this->eo."')";            					
		$updateQuestionQuery .= "WHERE `questionID` = ".$questionID."";
		
		$updateQuestionResult = mysql_query($updateQuestionQuery);
		
		if(!$updateQuestionResult) {
			die ("Could update question with: ($questionsQuery) from DB: " . mysql_error());
		}
		
	}
	
	//class method for viewing all questions from a specific category. returns a jSON object.
	static function view_questions($spo, $variant){
	
		/* echo "view questions called with '".$subcategory."'"; */
		$questions = array();
	
		$con = self::getConnection();		

        $questionsQuery = "SELECT q.questionID";
        $questionsQuery .= ", t.Name task_name";
        $questionsQuery .= ", s.Name subtask_name";
        $questionsQuery .= ", e.Name element_name";
        $questionsQuery .= ", p.Number phase_number";
        $questionsQuery .= ", t.Number task_number";
        $questionsQuery .= ", s.Number subtask_number";
        $questionsQuery .= ", e.Number element_number";
        $questionsQuery .= ", q.type";
        $questionsQuery .= ", q.correct_answer";
        $questionsQuery .= ", q.alt_correct_answer";
        $questionsQuery .= ", q.last_correct_answer";
        $questionsQuery .= ", q.ans_x";
        $questionsQuery .= ", q.ans_y";
        $questionsQuery .= ", q.ans_z";
        $questionsQuery .= ", q.question_a";
        $questionsQuery .= ", q.question_b ";
        $questionsQuery .= "FROM questions q ";
        $questionsQuery .= "JOIN Subtask s ON q.subtask_id = s.Id ";
        $questionsQuery .= "JOIN Element e ON q.element_id = e.Id ";
        $questionsQuery .= "JOIN Task t ON s.TaskId = t.Id ";
        $questionsQuery .= "JOIN Phase p ON t.PhaseId = p.Id ";
        $questionsQuery .= "WHERE q.subtask_id = ".$spo."";


		
		$questionsResult = mysql_query($questionsQuery);

		if (!$questionsResult) {
	    	echo "Could not successfully run query ($questionsQuery) from DB: " . mysql_error();
		}
		
		
		
		while($row = mysql_fetch_array($questionsResult)) {
			$questionAttr = array();
			$questionAttr['questionID'] = $row['questionID'];
			$questionAttr['type'] = $row['type'];
			
			//creates conactenated TPO/SPO reference "11.11.16" for electrical, etc.
			//$questionAttr['jta'] = $row['tpo_number'].".".$row['tpo_number'].".".$row['spo_number'].".".$row['eo_no'];
            $questionAttr['jta'] = $row['phase_number'].".".$row['task_number'].".".$row['subtask_number'].".".$row['element_number'];			
			$questionAttr['spo_eo_description'] = $row['spo_name']." - ".$row['element_name'];
            $questionAttr['spo_eo_description'] = $row['task_name']." - ".$row['subtask_name']." - ".$row['element_name'];			
			$questionAttr['question_a'] = $row['question_a'];
			$questionAttr['question_b'] = $row['question_b'];
			$questionAttr['correct_answer'] = $row['correct_answer'];
			$questionAttr['alt_correct_answer'] = $row['alt_correct_answer'];
			$questionAttr['last_correct_answer'] = $row['last_correct_answer'];
			$questionAttr['ans_x'] = $row['ans_x'];
			$questionAttr['ans_y'] = $row['ans_y'];
			$questionAttr['ans_z'] = $row['ans_z'];
			
			array_push($questions, $questionAttr);
		}
		
		mysql_close($con);
		
		$questions = json_encode($questions);
		
		return $questions;
	
		
	}
	
	static function edit_question($questionID){
	
		$questions = array();
		
		$con = self::getConnection();		
				
		$questionQuery = "SELECT * FROM `questions` WHERE `questionID` = ".$questionID."";
		
		$questionResult = mysql_query($questionQuery);

		if (!$questionResult) {
	    	echo "Could not successfully run query ($questionQuery) from DB: " . mysql_error();
		}
		
		
		$questionAttr = array();

		while($row = mysql_fetch_array($questionResult)) {
			$questionAttr['questionID'] = $row['questionID'];
			$questionAttr['type'] = $row['type'];
			$questionAttr['subcategory'] = $row['subcategory'];
			$questionAttr['spo'] = $row['spo_id'];		
			$questionAttr['eo'] = $row['eo_id'];	
			$questionAttr['question_a'] = $row['question_a'];
			$questionAttr['question_b'] = $row['question_b'];
			$questionAttr['correct_answer'] = $row['correct_answer'];
			$questionAttr['alt_correct_answer'] = $row['alt_correct_answer'];
			$questionAttr['last_correct_answer'] = $row['last_correct_answer'];
			$questionAttr['ans_x'] = $row['ans_x'];
			$questionAttr['ans_y'] = $row['ans_y'];
			$questionAttr['ans_z'] = $row['ans_z'];
			
			
		}
		
		mysql_close($con);

		array_push($questions, $questionAttr);
		$questions = json_encode($questions);
		
		return $questions;


		
	}
	
	public static function delete_question($qID){
		
		$message = array();
		
		$con = self::getConnection();				
		
		$deleteQuery = "DELETE FROM questions where questionID = ".$qID."";
		$deleteResult = mysql_query($deleteQuery);
		if(!$deleteResult){
			die("could not execute delete query ($deleteQuery) ".mysql_error());
		}
				
		mysql_close($con);
		
		$message['message'] = "success";
		
		$message = json_encode($message);
		return $message;
		
	}

}


?>


















