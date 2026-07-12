-- Synthetic MySQL 5-shaped schema fixture for Phase 1 characterization.
-- Column order, types, keys, and lack of foreign keys follow the authoritative
-- export. This file contains no source-export data.

SET NAMES latin1;

CREATE TABLE `createdTests` (
  `genTestID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `testModelID` int(10) unsigned NOT NULL,
  `genDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `course_type` char(10) NOT NULL,
  `length` int(10) unsigned NOT NULL,
  `instructorID` char(10) NOT NULL,
  `testPassword` char(25) NOT NULL,
  `overridePassword` varchar(25) NOT NULL,
  PRIMARY KEY (`genTestID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `EO` (
  `eo_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `spo_id` int(10) unsigned NOT NULL,
  `eo_no` int(10) unsigned NOT NULL,
  `element_name` char(250) NOT NULL,
  PRIMARY KEY (`eo_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `instructors` (
  `instructorID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employeeNo` char(10) NOT NULL,
  `firstName` char(50) NOT NULL,
  `lastName` char(50) NOT NULL,
  `password` char(255) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  PRIMARY KEY (`instructorID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `logins` (
  `loginID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `password` varchar(25) NOT NULL,
  `override` varchar(25) NOT NULL,
  `genTestID` int(10) NOT NULL,
  `attemptCount` int(10) NOT NULL,
  `studentEmpNo` char(7) NOT NULL,
  PRIMARY KEY (`loginID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `questions` (
  `questionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category` char(25) NOT NULL,
  `subcategory` char(25) NOT NULL,
  `spo_id` int(10) unsigned NOT NULL,
  `eo_id` int(10) unsigned NOT NULL,
  `variant_id` tinyint(3) unsigned NOT NULL,
  `type` char(10) NOT NULL,
  `correct_answer` char(255) DEFAULT NULL,
  `alt_correct_answer` char(255) DEFAULT NULL,
  `last_correct_answer` char(255) DEFAULT NULL,
  `ans_x` char(255) DEFAULT NULL,
  `ans_y` char(255) DEFAULT NULL,
  `ans_z` char(255) DEFAULT NULL,
  `question_a` text NOT NULL,
  `question_b` text,
  PRIMARY KEY (`questionID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `SPO` (
  `spo_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tpo_id` int(10) unsigned NOT NULL,
  `spo_number` int(10) unsigned NOT NULL,
  `spo_name` char(250) NOT NULL,
  PRIMARY KEY (`spo_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `stamp` (
  `genDate` date NOT NULL,
  `stampin` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `studentTestRecords` (
  `recordID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employeeNo` char(10) NOT NULL,
  `firstName` char(50) NOT NULL,
  `lastName` char(50) NOT NULL,
  `classDate` date NOT NULL,
  `testDate` date NOT NULL,
  `instructorID` char(10) NOT NULL,
  `syllabus` char(25) NOT NULL,
  `qualCode` char(25) NOT NULL,
  `genTestID` int(10) unsigned NOT NULL,
  `retrain` tinyint(1) NOT NULL,
  `result` char(25) NOT NULL,
  `score` int(10) unsigned NOT NULL,
  PRIMARY KEY (`recordID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `testModel` (
  `test_model_id` varchar(10) NOT NULL,
  `variant_id` tinyint(10) unsigned NOT NULL,
  `spo_id` tinyint(10) unsigned NOT NULL,
  `count` tinyint(10) unsigned DEFAULT NULL,
  `eo_id` int(10) unsigned DEFAULT NULL,
  `course_type` varchar(50) NOT NULL,
  `test_length` varchar(10) NOT NULL,
  `name` varchar(25) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `testResults` (
  `resultID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employeeNo` char(10) NOT NULL,
  `genTestID` int(10) unsigned NOT NULL,
  `questionID` int(10) unsigned NOT NULL,
  `correct` tinyint(1) NOT NULL,
  PRIMARY KEY (`resultID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `test_info` (
  `testID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `modelID` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`testID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `test_model` (
  `testID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `course_type` char(25) NOT NULL,
  `length` int(10) unsigned NOT NULL,
  `air_condition` int(10) unsigned NOT NULL,
  `acft_gen` int(10) unsigned NOT NULL,
  `apu` int(10) unsigned NOT NULL,
  `autopilot` int(10) unsigned NOT NULL,
  `crew_awareness` int(10) unsigned NOT NULL,
  `elec` int(10) unsigned NOT NULL,
  `emerg_equip` int(10) unsigned NOT NULL,
  `fire_prot` int(10) unsigned NOT NULL,
  `flt_control` int(10) unsigned NOT NULL,
  `fuel` int(10) unsigned NOT NULL,
  `hydraulics` int(10) unsigned NOT NULL,
  `ice_rain_prot` int(10) unsigned NOT NULL,
  `ldg_gear_brk` int(10) unsigned NOT NULL,
  `lighting` int(10) unsigned NOT NULL,
  `limitations` int(10) unsigned NOT NULL,
  `oxy` int(10) unsigned NOT NULL,
  `performance` int(10) unsigned NOT NULL,
  `pneum` int(10) unsigned NOT NULL,
  `powerplant` int(10) unsigned NOT NULL,
  `pressurization` int(10) unsigned NOT NULL,
  `profiles` int(10) unsigned NOT NULL,
  `radar` int(10) unsigned NOT NULL,
  `stall_prot` int(10) unsigned NOT NULL,
  `mandatory` int(10) unsigned NOT NULL,
  PRIMARY KEY (`testID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `TPO` (
  `tpo_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `tpo_number` int(10) unsigned NOT NULL,
  `tpo_name` char(250) NOT NULL,
  PRIMARY KEY (`tpo_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `usedQuestions` (
  `genTestID` int(10) unsigned NOT NULL,
  `questionID` int(10) unsigned NOT NULL,
  `type` char(10) NOT NULL,
  `spo_id` tinyint(10) unsigned NOT NULL,
  `subcategory` char(25) NOT NULL,
  `questionText` char(255) NOT NULL,
  `a` char(255) NOT NULL,
  `b` char(255) NOT NULL,
  `c` char(255) DEFAULT NULL,
  `d` char(255) DEFAULT NULL,
  `answerKey` char(10) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `variant` (
  `variant_id` tinyint(10) unsigned NOT NULL AUTO_INCREMENT,
  `variant_name` varchar(10) NOT NULL,
  PRIMARY KEY (`variant_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
