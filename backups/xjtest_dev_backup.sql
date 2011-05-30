-- phpMyAdmin SQL Dump
-- version 3.2.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 19, 2011 at 10:40 AM
-- Server version: 5.1.44
-- PHP Version: 5.3.2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `xjtest`
--

-- --------------------------------------------------------

--
-- Table structure for table `createdTests`
--

CREATE TABLE `createdTests` (
  `genTestID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `testModelID` int(10) unsigned NOT NULL,
  `genDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `course_type` char(10) NOT NULL,
  `length` int(10) unsigned NOT NULL,
  `instructorID` char(10) NOT NULL,
  `testPassword` char(25) NOT NULL,
  PRIMARY KEY (`genTestID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=90 ;

--
-- Dumping data for table `createdTests`
--

INSERT INTO `createdTests` VALUES(56, 48, '2011-02-17 03:27:40', 'SY9', 25, 'G7057', 'montyq');
INSERT INTO `createdTests` VALUES(57, 48, '2011-02-18 17:24:52', 'SY9', 25, 'G6359', 'firstone');
INSERT INTO `createdTests` VALUES(58, 49, '2011-02-19 23:21:51', 'SY9', 25, 'G7057', 'shorty');
INSERT INTO `createdTests` VALUES(59, 50, '2011-02-19 23:32:08', 'SY9', 25, 'G7057', '2ndtry');
INSERT INTO `createdTests` VALUES(60, 50, '2011-02-20 18:39:25', 'SY9', 25, 'G7057', 'avgtime');
INSERT INTO `createdTests` VALUES(61, 51, '2011-02-23 10:44:11', 'SY9', 25, 'G7057', 'crymeariver');
INSERT INTO `createdTests` VALUES(62, 52, '2011-02-24 21:07:41', 'UPG', 25, 'G7057', 'capitan');
INSERT INTO `createdTests` VALUES(63, 53, '2011-03-02 11:34:46', 'SY9', 25, 'G7057', 'idesofmarch');
INSERT INTO `createdTests` VALUES(64, 54, '2011-03-02 11:38:55', 'SY9', 25, 'G7057', 'idesofmarch');
INSERT INTO `createdTests` VALUES(65, 55, '2011-03-02 15:38:31', 'SY9', 25, 'G7057', 'lastday');
INSERT INTO `createdTests` VALUES(66, 56, '2011-03-02 15:42:06', 'SY9', 25, 'G7057', 'killernights');
INSERT INTO `createdTests` VALUES(67, 57, '2011-03-03 13:35:08', 'SY9', 25, 'G7057', 'sadness');
INSERT INTO `createdTests` VALUES(68, 58, '2011-03-07 16:31:35', 'SY9', 25, 'G7057', 'mar07');
INSERT INTO `createdTests` VALUES(69, 59, '2011-03-08 21:49:57', 'SY9', 25, 'G7057', 'mar08');
INSERT INTO `createdTests` VALUES(70, 59, '2011-03-09 10:30:52', 'SY9', 25, 'G7057', 'mar09');
INSERT INTO `createdTests` VALUES(71, 59, '2011-03-09 20:32:41', 'SY9', 25, 'G7057', 'mar0911');
INSERT INTO `createdTests` VALUES(72, 60, '2011-03-10 09:23:23', 'SY9', 25, 'G7057', 'mar10');
INSERT INTO `createdTests` VALUES(73, 65, '2011-03-15 11:32:47', 'SY9', 25, 'G7057', 'mar15');
INSERT INTO `createdTests` VALUES(74, 66, '2011-03-30 10:18:24', 'SY9', 25, 'G5065', 'tomtes');
INSERT INTO `createdTests` VALUES(75, 67, '2011-04-05 23:29:09', 'SY9', 25, 'G7057', 'air_conditioning');
INSERT INTO `createdTests` VALUES(76, 68, '2011-04-05 23:29:41', 'SY9', 25, 'G7057', 'aircraft_general');
INSERT INTO `createdTests` VALUES(77, 69, '2011-04-05 23:36:32', 'SY9', 25, 'G7057', 'apu');
INSERT INTO `createdTests` VALUES(78, 70, '2011-04-05 23:36:51', 'SY9', 25, 'G7057', 'autopilot');
INSERT INTO `createdTests` VALUES(79, 71, '2011-04-05 23:38:13', 'SY9', 25, 'G7057', 'crewawareness');
INSERT INTO `createdTests` VALUES(80, 71, '2011-04-05 23:39:51', 'SY9', 25, 'G7057', 'crews');
INSERT INTO `createdTests` VALUES(81, 71, '2011-04-05 23:45:31', 'SY9', 25, 'G7057', 'crew');
INSERT INTO `createdTests` VALUES(82, 71, '2011-04-05 23:51:33', 'SY9', 25, 'G7057', 'crew');
INSERT INTO `createdTests` VALUES(83, 72, '2011-04-05 23:55:23', 'SY9', 100, 'G7057', 'bigtest');
INSERT INTO `createdTests` VALUES(84, 72, '2011-04-14 11:26:37', 'SY9', 100, 'G7057', 'Sytest45');
INSERT INTO `createdTests` VALUES(85, 74, '2011-04-14 13:15:50', 'SY9', 25, 'G7057', 'littld');
INSERT INTO `createdTests` VALUES(86, 75, '2011-04-17 20:52:31', 'SY9', 25, 'G7057', 'paper');
INSERT INTO `createdTests` VALUES(87, 75, '2011-04-17 21:05:35', 'SY9', 25, 'G7057', 'paper');
INSERT INTO `createdTests` VALUES(88, 75, '2011-05-05 08:51:38', 'SY9', 25, 'G7057', 'pressurization');
INSERT INTO `createdTests` VALUES(89, 76, '2011-05-05 09:03:42', 'SY9', 25, 'G7057', 'press');

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `instructorID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employeeNo` char(10) NOT NULL,
  `firstName` char(50) NOT NULL,
  `lastName` char(50) NOT NULL,
  `password` char(255) NOT NULL,
  `admin` tinyint(1) NOT NULL,
  PRIMARY KEY (`instructorID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` VALUES(1, 'G7057', 'Matthew', 'Hull', 'mdhull', 1);
INSERT INTO `instructors` VALUES(8, 'G5065', 'Tom', 'Replogle', 'treplogle', 0);
INSERT INTO `instructors` VALUES(3, 'G5906', 'Glenn', 'Ward', 'gward', 1);
INSERT INTO `instructors` VALUES(9, 'E3632', 'Scot', 'McBride', 'smcbride', 1);

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `questionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category` char(25) NOT NULL,
  `subcategory` char(25) NOT NULL,
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
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=284 ;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` VALUES(1, 'systems', 'elec', 'tf', 'FALSE', NULL, NULL, '', '', '', 'The emergency light system is powered from Essential DC Bus 2.', 'The emergency light system will never activate when the emergency light switch is in the "OFF" position.');
INSERT INTO `questions` VALUES(2, 'systems', 'apu', 'mc', '-20 C', NULL, NULL, '70 C', '54 C', '40 C', 'The minimum battery temperature for an APU start is:', '');
INSERT INTO `questions` VALUES(3, 'systems', 'crew_awareness', 'mc', 'One or both enginges not running.', NULL, NULL, 'Flaps 0.', 'Parking brake set.', 'Pitch trim set to 0 degrees.', 'Which one of these will not give you a takeoff configuration warning?', 'Which parameter is not evaluated for a takeoff configuration check?');
INSERT INTO `questions` VALUES(4, 'systems', 'crew_awareness', 'mc', 'RMU 1 automatically displays Engine Page 1', NULL, NULL, 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'PFD1 and MFD1 go blank.', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'If symbol generator 1 fails:', 'Which event is specific to a symbol generator 1 failure?');
INSERT INTO `questions` VALUES(283, 'systems', 'air_condition', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, '', '');
INSERT INTO `questions` VALUES(6, 'systems', 'crew_awareness', 'mc', 'Engine #1 indications are replaced with amber dashes', NULL, NULL, 'The FADEC syncs N2 to N1.', 'DAU 1B automatically takes over.', 'Aft aircraft systems information is unavailable.', 'What happens if DAU 1A Fails?', '');
INSERT INTO `questions` VALUES(7, 'systems', 'crew_awareness', 'mc', 'ATT FAIL appears on the EADI on the PFD.', NULL, NULL, 'Airspeed will be covered with hash marks', 'The cross-side AHRS automatically takes over.', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'If AHRS 1 or 2 fails:', '');
INSERT INTO `questions` VALUES(8, 'systems', 'elec', 'mc', 'VOR (no DME) can be flown using the RMU navigation page', '', '', 'The FMS remains powered.', 'VOR-DME approaches can be flown using the standby instruments.', 'VOR approaches are impossible since the PFD is blank.', 'In essential power configuration (w/ loss of all generators):', '');
INSERT INTO `questions` VALUES(9, 'systems', 'apu', 'mc', 'FADEC', NULL, NULL, 'EICAS', 'Manual controls', 'Starter/Generator', 'The APU (Model T-62T-40C14) is controlled by a(n):', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:');
INSERT INTO `questions` VALUES(10, 'systems', 'elec', 'mc', 'Ground power is available to supply power to the electrical system.', NULL, NULL, 'The aircraft electrical system is powered.', 'The ground power unit is disconnected from the aircraft.', 'The ground air supply is supplying bleed air to the packs.', 'The GPU AVAIL inscription on the GPU button indicates:', '');
INSERT INTO `questions` VALUES(11, 'systems', 'elec', 'mc', 'The hot battery busses, essential busses, and the central DC bus.', NULL, NULL, 'DC bus 1 and DC bus 2', 'The entire electrical system.', 'All electrical busses except the shed busses.', 'While on essential power, what busses are powered?', 'Which components are energized in essential power configuration?');
INSERT INTO `questions` VALUES(12, 'systems', 'apu', 'mc', '300 Amps.', NULL, NULL, '200 Amps.', '400 Amps.', '500 Amps.', 'The maximum load on the APU generator above FL300 is:', '');
INSERT INTO `questions` VALUES(13, 'systems', 'elec', 'mc', 'RMU1, RMU2, EICAS and standby instruments.', NULL, NULL, 'FMS, PFD and MFDs.', 'SG2, DAU2B', 'FMS1, DAU1B, DAU2B', 'What items are available in essential power?', '');
INSERT INTO `questions` VALUES(14, 'systems', 'ldg_gear_brk', 'c2', 'Must be extended with the freefall actuator.', 'Cannot be retracted once extended.', NULL, 'Operates using hydraulic system #2 pressure, but may be slower due to the priority valve', NULL, NULL, 'With a total loss of hydraulic system #1, the landing gear:', '');
INSERT INTO `questions` VALUES(17, 'systems', 'apu', 'c2', 'Battery 2.', 'The GPU (with batteries in AUTO)', NULL, 'Battery 1.', NULL, NULL, 'The APU can be started using:', 'What power sources can be used to start the APU?');
INSERT INTO `questions` VALUES(23, 'systems', 'fire_prot', 'nc', NULL, NULL, NULL, 'The LAV SMOKE EICAS warning appears.', 'The flight attendant hears a warning horn.', 'The LAV BOTTLE INOP EICAS warning appears.', 'If the lavatory halon bottle discharges:', '');
INSERT INTO `questions` VALUES(24, 'systems', 'powerplant', 'ac', 'A 14 stage compressor.', '6 stages of CVG vanes.', 'A 2 stage high-pressure turbine.', NULL, NULL, NULL, 'The engine has:', '');
INSERT INTO `questions` VALUES(25, 'systems', 'air_condition', 'mc', 'Pack 2 is on, 1 is off.', '', '', 'Both packs are on.', 'Pack 1 is on, 2 is off.', 'Both packs are off.', 'At 2000 AGL in CLB thrust mode, icing conditions, both packs selected ON:', 'While flying in icing conditions at 2000 AGL in CLB thrust with packs selected ON:');
INSERT INTO `questions` VALUES(26, 'systems', 'air_condition', 'mc', 'The air leaving the pack is too hot.', NULL, NULL, 'The air entering the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'What is a pack overheat?', 'What does the EICAS PACK OVHT indicate?');
INSERT INTO `questions` VALUES(27, 'systems', 'air_condition', 'c2', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', NULL, 'The air entering the pack is too hot.', NULL, NULL, 'What is a pack overload?', 'What does the EICAS PACK OVLD indicate?');
INSERT INTO `questions` VALUES(28, 'systems', 'air_condition', 'mc', 'Both packs turn off.', NULL, NULL, 'Pack 1 turns off.', 'Pack 2 turns off.', 'Both packs stay on.', 'During a go-around at 200 AGL...', '');
INSERT INTO `questions` VALUES(29, 'systems', 'acft_gen', 'mc', 'Under cockpit access hatch.', '', '', 'Overwing emergency exit.', 'Baggage compartment door.', 'Forward nose hydraulic compartment.', 'Which door, when open, will cause an \\"ACCESS DOORS OPN\\" EICAS message?', '');
INSERT INTO `questions` VALUES(30, 'systems', 'acft_gen', 'mc', '98 feet in length.', NULL, NULL, '89 feet in length.', '110 feet in length.', '160 % of the length of an EMB-135.', 'The EMB-145 is approximately ...', 'An EMB-145 XR is approximately...');
INSERT INTO `questions` VALUES(32, 'systems', 'apu', 'mc', 'After 10 seconds on the ground.', NULL, NULL, 'Immediately in flight.', 'Immediately at all times.', 'AFter 10 seconds on the ground, immediately in flight.', 'In case of an APU fire, the APU shuts down:', '');
INSERT INTO `questions` VALUES(33, 'systems', 'apu', 'mc', '19.0V', NULL, NULL, '20.0V', '23.5V', '24.0V', 'An attempt to start the APU can be made if battery voltage is at least:', '');
INSERT INTO `questions` VALUES(34, 'systems', 'apu', 'mc', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', NULL, NULL, 'Turn the master knob to OFF.', 'Press the FUEL SHUTOFF button.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'The proper way to shut down the APU is to:', '');
INSERT INTO `questions` VALUES(35, 'systems', 'apu', 'mc', 'Overspeed.', '', '', 'Fire.', 'Overtemperature.', 'High oil temperature.', 'In flight, the APU will shut down automatically for which of the following?', 'The APU\\''s logic commands an automatic shutdown for which of the following conditions in flight?');
INSERT INTO `questions` VALUES(36, 'systems', 'autopilot', 'mc', '200\\'' AGL.', '', '', '500\\'' AGL.', '1000\\'' AGL.', '1500\\'' AGL.', 'At what altitude must the autopilot be disengaged on a CAT I ILS approach?', '');
INSERT INTO `questions` VALUES(37, 'systems', 'autopilot', 'mc', '500', NULL, NULL, '200', '800', '1000', 'What is the minimum engagement height for the autopilot (feet)?', '');
INSERT INTO `questions` VALUES(38, 'systems', 'autopilot', 'mc', 'SPD but with preset speeds.', '', '', 'VS but with preset vertical speeds.', 'PIT but with preset attitudes.', 'SPD with preset values below 10,000\\'' and VS with preset values above 10,000\\''.', 'During climb, FLC works just like:', '');
INSERT INTO `questions` VALUES(39, 'systems', 'autopilot', 'mc', 'TO mode is activated on the flight director.', NULL, NULL, 'The thrust rating changes to full thrust.', 'GA mode is activated on the flight director.', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'When pressing the TOGA buttons on the ground while taxiing:', 'What change should be observed on the FMA after clicking the TOGA buttons on the ground?');
INSERT INTO `questions` VALUES(40, 'systems', 'autopilot', 'mc', '90', NULL, NULL, '70', '100', '45', 'After having been cleared for the approach, the approach mode can be activated within ___ degrees for a front course approach.', 'The aircraft heading must be within ___ degrees of the final approach course (front course) prior to selecting the APR or NAV mode.');
INSERT INTO `questions` VALUES(41, 'systems', 'autopilot', 'mc', 'VS mode but with preset vertical speeds', NULL, NULL, 'SPD mode but with preset speeds.', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'During descent, FLC works just like:', '');
INSERT INTO `questions` VALUES(42, 'systems', 'autopilot', 'c2', 'PIT', 'FLC', NULL, 'ROL', NULL, NULL, 'Which of these are vertical flight guidance modes?', '');
INSERT INTO `questions` VALUES(43, 'systems', 'autopilot', 'c2', '14 degrees pitch up attitude (Flaps 9).', '13 degrees pitch up attitude (Flaps 18).', NULL, '14 degrees pitch up attitude (Flaps 18).', NULL, NULL, 'On the ground, pressing the TOGA buttons will position the command bars to:', '');
INSERT INTO `questions` VALUES(44, 'systems', 'autopilot', 'mc', '14 degrees.', NULL, NULL, '10 degrees.', '27 degrees.', '13 degrees above FL250.', 'When selected, low bank is equal to ____ : ?', '');
INSERT INTO `questions` VALUES(45, 'systems', 'autopilot', 'mc', '27 degrees.', NULL, NULL, '14 degrees.', '10 degrees.', '13 degrees.', 'Full bank is equal to ___: ?', 'When low bank is NOT selected, what is the maximum bank the autopilot will use for any lateral mode?');
INSERT INTO `questions` VALUES(46, 'systems', 'autopilot', 'mc', 'NAV', NULL, NULL, 'HDG', 'FMS', 'HDG, then FMS.', 'What button on the flight guidance control panel would you push to navigate using the FMS?', '');
INSERT INTO `questions` VALUES(47, 'systems', 'autopilot', 'mc', '2,000 feet per minute.', NULL, NULL, '3,000 feet per minute.', '3 degree glidepath.', '1,000 feet per minute.', 'What vertical speed does FLC give you in a descent above 12,000 feet?', '');
INSERT INTO `questions` VALUES(48, 'systems', 'autopilot', 'mc', '10 Degrees', NULL, NULL, '13 Degrees.', '14 degrees (once you are flaps 9).', 'The aircraft does not hold a specific pitch attitude during the first 20 seconds of this sub-mode.', 'What pitch attitude does the aircraft to to hold in the go-around sub-mode for the first twenty seconds (airspeed > 1.23VS)?', '');
INSERT INTO `questions` VALUES(50, 'systems', 'autopilot', 'mc', '270 KIAS until MACH 0.56', NULL, NULL, '2000 fpm', '270 KIAS until MACH 0.65', '290 KIAS until MACH 0.56', 'On non-XR aircraft above 12,000 in FLC, the aircraft climbs at...', 'On LR aircraft above 12,000 in FLC, the aircraft climbs at...');
INSERT INTO `questions` VALUES(51, 'systems', 'autopilot', 'ac', 'The quick disconnect button', 'Use of pitch trim', 'The "AP" button on the Flight Guidance Control Panel', NULL, NULL, NULL, 'Which of the following will disconnect the autopilot?', '');
INSERT INTO `questions` VALUES(52, 'systems', 'autopilot', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'The autopilot will not engage with the YD inoperative', '');
INSERT INTO `questions` VALUES(53, 'systems', 'autopilot', 'mc', 'Flight Mode Anunciator (FMA).', '', '', 'Flight Guidance Controller', 'Display Control Panel', 'Flight Director button on the Flight Guidance Control Panel', 'Crews must always verify that the autopilot is coupled to the PF by looking at the:', '');
INSERT INTO `questions` VALUES(54, 'systems', 'autopilot', 'mc', 'ROL/TO', NULL, NULL, 'HDG/TO', 'ROL/GA', 'ROL/VS', 'The FMA displays what messages after pressing the TOGA buttons on the ground?', '');
INSERT INTO `questions` VALUES(55, 'systems', 'autopilot', 'mc', 'FMS', NULL, NULL, 'NAV', 'LNAV', 'TTG', 'What button would push on the Display Control Panel to navigation from FMS?', '');
INSERT INTO `questions` VALUES(56, 'systems', 'crew_awareness', 'mc', 'As soon as the electrical system is powered.', NULL, NULL, 'By turning on the navigation lights.', 'By turning on the red beacon.', 'By a 5G impact or immersion in water.', 'The cockpit voice recorder starts recording:', '');
INSERT INTO `questions` VALUES(57, 'systems', 'crew_awareness', 'mc', 'Main and service doors.', NULL, NULL, 'Fuel and baggage doors.', 'Main cabin door only.', 'Over-wing emergency exit.', 'The following doors open in flight cause a master warning:', '');
INSERT INTO `questions` VALUES(58, 'systems', 'crew_awareness', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'The flight attendant can override the cockpit switch and turn the emergency lights on.', 'The flight attendant can override the cockpit switch and turn the emergency lights on, regardless of the emergency light switch position in the cockpit.');
INSERT INTO `questions` VALUES(59, 'systems', 'crew_awareness', 'tf', 'FALSE', NULL, NULL, NULL, NULL, NULL, 'The tuning backup control head (TBCH) remains powered in essential power.', 'The TBCH is the only means of tuning NAV2 in essential power.');
INSERT INTO `questions` VALUES(60, 'systems', 'crew_awareness', 'mc', 'Connect the captain only to COM 1 and NAV 1 and FO to COM 2 and NAV 2.', NULL, NULL, 'Automatically switches to VHF 1 to 121.50.', 'Illuminates the EMER button on the flight attendant interphone.', 'Commands the TBCH to operate in the emergency mode.', 'The emergency button on the digital audio panel:', '');
INSERT INTO `questions` VALUES(61, 'systems', 'crew_awareness', 'mc', 'By turning on the red beacon', NULL, NULL, 'By turning on the NAV lights.', 'As soon as the electrical system is powered.', 'By a 5G impact or immersion in water.', 'The flight data recorder is activated (starts recording):', '');
INSERT INTO `questions` VALUES(62, 'systems', 'crew_awareness', 'mc', 'Both aural channels have failed.', NULL, NULL, 'Only one aural channel is working.', 'The digital audio panel is inoperative.', 'DAU2B has failed.', 'The EICAS caution AURAL WARN FAIL indicates:', '');
INSERT INTO `questions` VALUES(63, 'systems', 'crew_awareness', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'Should the need arise, COM 3 is available for voice communication.', 'COM 3 cannot be used for voice communication when the EMER button is pushed in (selected) on the digital audio panel.');
INSERT INTO `questions` VALUES(64, 'systems', 'crew_awareness', 'mc', '2', NULL, NULL, '3', '1', '0', 'How many transponders are on the aircraft?', '');
INSERT INTO `questions` VALUES(65, 'systems', 'crew_awareness', 'mc', 'It doesn\\''t appear anywhere immediately.', '', '', 'MFD 1.', 'RMU 1.', 'TBCH.', 'If the EICAS screen fails, the EICAS information immediately appears on:', '');
INSERT INTO `questions` VALUES(66, 'systems', 'crew_awareness', 'mc', 'CA and FO indicated airspeeds differ by more than 5 knots.', NULL, NULL, 'Approaching maximum airspeed (redline).', 'SPEED HOLD flight director mode is on.', 'Airspeed input from PITOT 3 differs by more than 5 knots from CA or FO indications.', 'An amber IAS flag on the PFD indicates:', '');
INSERT INTO `questions` VALUES(76, 'systems', 'crew_awareness', 'mc', 'Is not charged.', NULL, NULL, 'Is charged by the esential busses', 'Is charged by the shed buses', 'Is charged only when the ELT switch is in the ARM position.', 'The ELT battery:', '');
INSERT INTO `questions` VALUES(77, 'systems', 'crew_awareness', 'tf', 'FALSE', '', '', '', '', '', 'The standby airspeed indicator receives information from the ADCs.', '');
INSERT INTO `questions` VALUES(78, 'systems', 'crew_awareness', 'mc', 'A difference of 6 degrees between the left and right AHRS headings.', '', '', 'The heading system has failed.', 'Check your heading, you\\''re drifting from the assigned heading.', 'The FMS is suggesting heading select navigation.', 'An amber HDG indication on the PFD indicates:', '');
INSERT INTO `questions` VALUES(79, 'systems', 'crew_awareness', 'c2', 'A red failure indications appears on the airspeed tape, altitude tape and red boxed VS on the VSI indicator.', 'The ADC button on the reversionary panel should be pressed per the QRH.', NULL, 'The standby airspeed indicator becomes unreliable.', NULL, NULL, 'If an air data computer fails:', '');
INSERT INTO `questions` VALUES(80, 'systems', 'crew_awareness', 'mc', 'Is powered normally.', NULL, NULL, 'Is automatically displayed on RMU 1', 'Can be presented by using MFD reversion.', 'Can be presented by using SG reversion.', 'In essential power, the EICAS:', '');
INSERT INTO `questions` VALUES(81, 'systems', 'crew_awareness', 'mc', 'DC Bus 2', NULL, NULL, 'Essential bus 2', 'DC bus 1', 'Essential bus 1', 'The power source for SG 2 is:', '');
INSERT INTO `questions` VALUES(82, 'systems', 'crew_awareness', 'mc', 'Pitot/Static tube 3', NULL, NULL, 'Pitot 1/Static ports 1 & 4.', 'Pitot 2/Static ports 2 & 3.', 'Pitot 1/Fadec pressurization static port.', 'Standby instruments receive information from which pitot static source?', '');
INSERT INTO `questions` VALUES(83, 'systems', 'crew_awareness', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'The EICAS reversionary buttons must be pressed to activate DAU channel B.', '');
INSERT INTO `questions` VALUES(84, 'systems', 'crew_awareness', 'tf', 'FALSE', NULL, NULL, NULL, NULL, NULL, 'During a decreasing performance windshear warning, the aircraft should immediately be re-configured to: Gear Up / Flaps 9.', '');
INSERT INTO `questions` VALUES(85, 'systems', 'crew_awareness', 'mc', 'Red X on MFD 2. MFD 1 and PFD 2 are blank.', NULL, NULL, 'Red X on PFD 2 and MFD 2.  PFD 1 is blank.', 'PFD 2 and MFD 2 are blank.', 'Red X on PFD 1, MFD 2 and EICAS.', 'What does it look like on the 5 cockpit screens when you lose DC Bus 2?', 'How do the 5 cockpit CRTs appear following the loss of DC Bus 2?');
INSERT INTO `questions` VALUES(86, 'systems', 'crew_awareness', 'mc', 'A disagreement between IC-600\\''s on EICAS messages displayed.', '', '', 'SG reversion has been selected.', 'IAS displayed on each PFD differs by more than 5 knots.', 'Altitude displayed on each PFD differs by more than 200 feet.', '"CAS MSG" on your PFD indicates:', '');
INSERT INTO `questions` VALUES(87, 'systems', 'crew_awareness', 'mc', 'ATT FAIL, HDG FAIL on PFD.', NULL, NULL, 'MAG 2, ATT 2.', 'SG 2', 'Amber HDG flag above HSI.', 'The following messages appear during an AHRS 2 failure, prior to reversion:', '');
INSERT INTO `questions` VALUES(88, 'systems', 'elec', 'c2', 'TCAS.', 'EGPWS/Wind Shear.', NULL, 'Weather Radar.', NULL, NULL, 'The items powered by the AC electrical system are:', '');
INSERT INTO `questions` VALUES(89, 'systems', 'elec', 'mc', '40 minutes.', NULL, NULL, '15 minutes.', '20 minutes.', '25 minutes.', 'In flight, the NICAD batteries supply the electrical power for ___ minutes while on essential power.', '');
INSERT INTO `questions` VALUES(90, 'systems', 'elec', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'The ground service bus is only powered with the GPU NOT selected and the batteries OFF.', 'The ground service bus is not powered when the GPU is selected.  ');
INSERT INTO `questions` VALUES(91, 'systems', 'elec', 'tf', 'TRUE', '', '', '', '', '', 'With 4 generators on-line, the electrical system operates as two separate systems.', 'The electrical system splits into 2 independent electrical networks when there are 4 or more generators on-line.');
INSERT INTO `questions` VALUES(92, 'systems', 'elec', 'c2', 'With 3 generators on-line, shed bus knob in AUTO, on the ground.', 'With the GPU selected, shed bus knob in AUTO or OVRD.', NULL, 'With the APU off, one engine shut down and the shed bus knob in AUTO.', NULL, NULL, 'The shed buses are powered:', '');
INSERT INTO `questions` VALUES(93, 'systems', 'elec', 'mc', 'Backup hot bus.', NULL, NULL, 'Essential bus 2.', 'DC bus 2.', 'Central DC bus.', 'Which electrical bus supplies power to the ISIS on the XR?', '');
INSERT INTO `questions` VALUES(94, 'systems', 'elec', 'tf', 'FALSE', NULL, NULL, NULL, NULL, NULL, 'With a loss of generator 1 and the APU off, the aircraft still has 2 independent electrical systems.', '');
INSERT INTO `questions` VALUES(95, 'systems', 'elec', 'mc', 'Normal gear extension.', NULL, NULL, 'Flaps.', 'Roll trim.', 'Pressurization.', 'The following is available if down to essential power.', '');
INSERT INTO `questions` VALUES(96, 'systems', 'elec', 'mc', 'All DC buses are powered except the shed buses.', NULL, NULL, 'All DC buses are powered.', 'All DC buses are powered if the shed bus knob is in OVRD.', 'Only the esential buses can be powered.', 'On the ground with the main batteries as the only source of power:', '');
INSERT INTO `questions` VALUES(97, 'systems', 'elec', 'mc', 'The GCUs, EDL and on XR aircraft, the ISIS.', '', '', 'The GCUs, EDL and FADECs.', 'The GCUs, EDL and RMU 1 if IC-600 1 fails.', 'The AHRS to prevent loss of alignment data.', 'The backup battery provides power for:', '');
INSERT INTO `questions` VALUES(98, 'systems', 'elec', 'mc', 'Five, 28 Volt DC generators.', NULL, NULL, 'Four, 28 Volt DC generators.', 'Four, 24 Volt DC generators.', 'Five, 24 Volt DC generators.', 'The electrical system is made up of...', '');
INSERT INTO `questions` VALUES(99, 'systems', 'elec', 'mc', 'Opens the BBC, isolating the backup battery hot bus.', NULL, NULL, 'Removes power from the backup flight instruments.', 'Is pushed during an electrical emergency to backup EDL logic.', 'Allows a test of the ISIS on LR aircraft.', 'The backup battery button on the electrical panel...', '');
INSERT INTO `questions` VALUES(100, 'systems', 'elec', 'mc', 'You are not in the essential power configuration but should be.', NULL, NULL, 'You are in essential power configuration but should not be.', 'Is normal during a loss of all generators.', 'You have one electrical system despite having 4 or more generators on-line.', 'The EICAS message ELEC ESS XFR FAIL means:', '');
INSERT INTO `questions` VALUES(101, 'systems', 'elec', 'mc', 'BC 1 and BC 2 are open.', NULL, NULL, 'BC 1 and BC 2 are closed.', 'BTC 1 & 2 are open.', 'The ALC is closed if the APU has been started.', 'With GPU power available and selected:', '');
INSERT INTO `questions` VALUES(102, 'systems', 'emerg_equip', 'mc', '3 Halon fire extinguishers, 3 PBEs, 1 H2O fire extinguisher, 2 portable O2 bottles.', '', '', '3 Halon fire extinguishers, 2 PBEs, 1 H2O fire extinguisher, 2 portable O2 bottles.', '2 Halon fire extinguishers, 2 PBEs, 1 H2O fire extinguisher, 1 portable O2 bottle.', '2 Halon fire extinguishers, 3 PBEs, 2 H2O fire extinguishers, no portable O2 bottle(s).', 'The 145 is required to have a total of:', '');
INSERT INTO `questions` VALUES(103, 'systems', 'emerg_equip', 'mc', '3 Halon fire extinguishers, 3 PBEs, 1 H20 fire extinguisher.', NULL, NULL, 'First Aid Kit, 2 PBEs, 2 H20 fire extinguishers.', '4 flashlights, 50 life vests, 2 oxygen deploy tools.', 'The Enhanced Emergency Master Kit (EEMK)', 'On the EMB 145, we have the following emergency equipment in the aircraft.', '');
INSERT INTO `questions` VALUES(104, 'systems', 'fire_prot', 'mc', 'The fuel shutoff valve closes.', NULL, NULL, 'The hydraulic shutoff valve is opened.', 'The respective engine fire bottle is discharged.', 'The engine will not shut down unless the thrust lever is in idle.', 'When a fire extinguishing handle is pulled:', '');
INSERT INTO `questions` VALUES(105, 'systems', 'fire_prot', 'mc', 'Thrust lever - IDLE.', NULL, NULL, 'Fire extinguishing handle - PULL, DO NOT ROTATE.', 'Fire extinguishing handle - PULL & ROTATE.', 'Start/Stop Selector - STOP.', 'What is the first immediate action item (memory item) for an engine fire in flight?', '');
INSERT INTO `questions` VALUES(116, 'systems', 'flt_control', 'mc', 'Will not operate.', NULL, NULL, 'Operate normally.', 'Will operate at half speed.', 'Are operative under manual reversion.', 'In essential power, the flaps:', '');
INSERT INTO `questions` VALUES(107, 'systems', 'fire_prot', 'tf', 'FALSE', NULL, NULL, NULL, NULL, NULL, 'APU fire detection and protection is available when the aircraft is de-powered.', '');
INSERT INTO `questions` VALUES(108, 'systems', 'fire_prot', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'Engine fire protection is available when the aircraft is de-powered.', '');
INSERT INTO `questions` VALUES(109, 'systems', 'fire_prot', 'mc', '3', NULL, NULL, '2', '1', '0', 'How many smoke goggles are in the cockpit?', '');
INSERT INTO `questions` VALUES(110, 'systems', 'fire_prot', 'ac', 'The engine bleed and lip anti-ice ice valves.', 'The hydraulic shutoff valve to the engine-driven fuel pump.', 'The fuel shutoff valve.', NULL, NULL, NULL, 'Pulling the fire extinguishing handle closes:', '');
INSERT INTO `questions` VALUES(111, 'systems', 'fire_prot', 'mc', 'Closes the associated hydraulic shutoff valve.', NULL, NULL, 'Shuts off all hydraulic pressure on the associated side.', 'Turns off the associated electric hydraulic pump  - if it is operating.', 'Has no effect on the hydraulic system.', 'How does pulling a fire handle affect the hydraulic system?', '');
INSERT INTO `questions` VALUES(112, 'systems', 'fire_prot', 'c2', 'Closes the APU fuel shutoff valve.', 'Discharges the APU fire bottle.', NULL, 'Shuts down the APU and discharges the fire extinguisher after a 10 second delay.', NULL, NULL, 'Pressing the APU fire extinguishing button:', '');
INSERT INTO `questions` VALUES(113, 'systems', 'fire_prot', 'mc', 'E1(2) Fire Det Fail.', NULL, NULL, 'APU Fire Loop Fail', 'Lav Smoke', 'E1(2) EXTBL A(B) INOP', 'Which of the following messages would indicate a good fire test?', '');
INSERT INTO `questions` VALUES(114, 'systems', 'fire_prot', 'ac', 'Low pressure in the fire loop will trigger a FIRE DET FAIL caution message.', 'High pressure in the fire loop will trigger a FIRE warning message.', 'APU fire detection and protection is available in essential power.', NULL, NULL, NULL, 'Select the true statement regarding fire protection:', '');
INSERT INTO `questions` VALUES(115, 'systems', 'fire_prot', 'c2', '1 Halon fire bottle for the APU', '1 Halon fire bottle for the lavatory.', NULL, '2 Halon fire bottles for the engines and 2 Halon fire bottles for the APU.', NULL, NULL, 'The aircraft has a total of..', '');
INSERT INTO `questions` VALUES(117, 'systems', 'flt_control', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'The rudder PCU is powered by both hydraulic systems below 135 knots.', '');
INSERT INTO `questions` VALUES(118, 'systems', 'flt_control', 'mc', 'The outboard spoilers deploy using hydraulic system 2 pressure.', NULL, NULL, 'The outboard spoilers deploy using hydraulic system 1 pressure.', 'The inboard spoilers deploy using hydraulic system 1 pressure.', 'The inboard and outboard spoilers deploy using both systems.', 'When using speedbrakes in flight:', '');
INSERT INTO `questions` VALUES(119, 'systems', 'flt_control', 'mc', 'Elevator', NULL, NULL, 'Ailerons.', 'Rudder.', 'Inboard spoilers while in flight.', 'The gust lock prevents the movement of the:', 'The electromechanical gust lock inserts locking pins into:');
INSERT INTO `questions` VALUES(120, 'systems', 'flt_control', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'When in manual reversion, the elevators, ailerons and rudder can all be actuated mechanically.', '');
INSERT INTO `questions` VALUES(121, 'systems', 'flt_control', 'mc', '200 KIAS.', NULL, NULL, '250 KIAS.', '160 KIAS.', '140 KIAS.', 'The maximum airspeed with flaps 22 is:', 'The maximum airspeed with flaps 18 is:');
INSERT INTO `questions` VALUES(122, 'systems', 'flt_control', 'mc', 'The flaps are extended to 22 degrees.', NULL, NULL, 'Hydraulic system 1 fails.', 'The thrust levers are in idle.', 'The gear is down.', 'The speedbrakes do not open if:', '');
INSERT INTO `questions` VALUES(123, 'systems', 'flt_control', 'mc', 'Positioning the horizontal stabilizer.', NULL, NULL, 'Positioning the spring and fixed tabs on the trailing edges of the elevator.', 'Positioning the fixed trim tab; the spring tab is a servo tab only.', 'Positioning the elevator with the main or backup trim switches.', 'Elevator trim is accomplished by:', '');
INSERT INTO `questions` VALUES(124, 'systems', 'flt_control', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'The ground spoilers open when the airplane is on the ground, wheel speed >25 kts and a low TLA.', '');
INSERT INTO `questions` VALUES(125, 'systems', 'flt_control', 'ac', 'A low TLA (thrust lever angle).', 'The flap lever has to be at 0 or 9 degrees.', 'The speedbrake lever has to be selected to OPEN.', NULL, NULL, NULL, 'The requirements for the speedbrakes to be open are:', '');
INSERT INTO `questions` VALUES(126, 'systems', 'flt_control', 'mc', 'DC bus 1 & 2.', NULL, NULL, 'Essential buses.', 'DC bus 1 & 2 under normal conditions; Essential buses in an electrical emergency.', 'Hydraulic system 1 & 2.', 'The flaps are powered by:', '');
INSERT INTO `questions` VALUES(127, 'systems', 'flt_control', 'mc', 'Both hydraulic systems.', NULL, NULL, 'Offside hydraulic pressure only.', 'Mechanical Means.', 'Onside hydraulic pressure only.', 'Ailerons are positioned utilizing:', '');
INSERT INTO `questions` VALUES(128, 'systems', 'flt_control', 'mc', 'Hydraulic system 2.', NULL, NULL, 'Hydraulic system 1.', 'Both hydraulic systems.', 'Essential DC bus.', 'During normal cruise flight, the rudder Power Control Unit receives hydraulic pressure from:', '');
INSERT INTO `questions` VALUES(129, 'systems', 'flt_control', 'c2', '9 Degrees.', '18 Degrees.', NULL, '22 Degrees.', NULL, NULL, 'ExpressJet allows takeoffs to be made with the following flap settings:', '');
INSERT INTO `questions` VALUES(130, 'systems', 'flt_control', 'c2', '22 Degrees.', '45 Degrees.', NULL, '18 Degrees.', NULL, NULL, 'ExpressJet allows landings to be made with the following flap settings:', '');
INSERT INTO `questions` VALUES(131, 'systems', 'flt_control', 'mc', 'Rudder hydraulic system 1 is still on above 135 KIAS.', NULL, NULL, 'The pilot has exceeded 135 lbs. of pressure on the rudder pedal.', 'The rudder is in manual reversion.', 'The deflection is 5 degrees +/- 1 degree.', 'The caution "Rudder Overboost" means:', '');
INSERT INTO `questions` VALUES(132, 'systems', 'flt_control', 'mc', 'Indicates a flap motor failure.', NULL, NULL, 'Indicates a failure of the flap velocity sensor.', 'Indicates a failure of the teleflex cable.', 'Indicates a mis-threading of the ball-screw actuator.', 'The EICAS message "FLAP LOW SPEED"...', '');
INSERT INTO `questions` VALUES(133, 'systems', 'fuel', 'mc', 'The left fuel tank.', NULL, NULL, 'Each fuel tank.', 'The FCOC.', 'The ACOC.', 'The fuel temperature on the MFD is measured at:', '');
INSERT INTO `questions` VALUES(134, 'systems', 'fuel', 'mc', '800.', NULL, NULL, '100.', '365.', '1000.', 'The maximum allowed fuel imbalance in the XR is ___ lbs.', 'The maximum allowed fuel imbalance in the LR is ___ lbs.');
INSERT INTO `questions` VALUES(135, 'systems', 'fuel', 'mc', 'The engines only use fuel from the wings.  When the wing tanks have less than 4630 lbs for 30 seconds, fuel from the ventral tank is transferred.', NULL, NULL, 'Fuel is used from the ventral tank first, then from the wings.', 'Fuel is used form the wings first. When the wing tanks are empty, fuel is supplied from the ventral tank.', 'Fuel is transferred from the wings to the ventral tank when the ventral tank is not full.', 'Which statement is true concerning XR fuel use?', '');
INSERT INTO `questions` VALUES(136, 'systems', 'fuel', 'mc', 'Turn the crossfeed knob to LOW 1 if tank 1has less fuel.', NULL, NULL, 'Transfer fuel from the high tank to the low tank using the ejector pump.', 'Turn the pump in the low tank off.', 'Turn the crossfeed knob to LOW 1 if tank 1 has more fuel.', 'To balance fuel:', 'Which procedure is correct for balancing fuel between the left & right wing tanks?');
INSERT INTO `questions` VALUES(137, 'systems', 'fuel', 'tf', 'FALSE', NULL, NULL, NULL, NULL, NULL, 'The ventral tank fuel transfer can take place while crossfeeding.', 'Crossfeeding will not inhibit transfer of fuel from the ventral tank to the wing tanks.');
INSERT INTO `questions` VALUES(138, 'systems', 'fuel', 'mc', 'The engine will continue to run on boost pressure provided by the other two boost pumps.', NULL, NULL, 'The engine will continue to run by suction feed through a check valve.', 'The engine will continue to run, but at reduced thrust.', 'The engine will eventually flame out due to lack of fuel.', 'If the fuel boost bump fails:', '');
INSERT INTO `questions` VALUES(139, 'systems', 'fuel', 'mc', 'De-energizing the boost pumps in tank 1.', NULL, NULL, 'De-energizing the boost pumps in tank 2.', 'Closing the fuel shutoff value in tank 1.', 'Closing the fuel shutoff value in tank 2.', 'Selecting crossfeed to Low 1 will result in:', '');
INSERT INTO `questions` VALUES(140, 'systems', 'fuel', 'mc', 'Only the A and B fuel boot pumps are available.', NULL, NULL, 'All fuel boost pumps are available.', 'No fuel boost pumps are available.', 'Only the C fuel boost pumps are available.', 'In essential power:', '');
INSERT INTO `questions` VALUES(141, 'systems', 'fuel', 'tf', 'FALSE', NULL, NULL, NULL, NULL, NULL, 'Fuel crossfeed is not available in essential power.', '');
INSERT INTO `questions` VALUES(142, 'systems', 'fuel', 'mc', 'Both wing tanks reach 4630 lbs + 30 seconds.', '', '', 'One wing tank reaches 4630 lbs + 30 seconds.', 'One wing tank reaches 1863 lbs.', 'The FMS shows fuel remaning on arrival of less thank 1800 lbs.', 'Assuming useable fuel in an XR\\''s ventral tank, fuel transfer will automatically occur in the auto mode when ...', '');
INSERT INTO `questions` VALUES(143, 'systems', 'hydraulics', 'mc', 'The flaps operate normally.', NULL, NULL, 'The flaps will not extend.', 'The landing gear retracts normally.', 'The landing extends normally.', 'With a complete failure of both hydraulic systems:', '');
INSERT INTO `questions` VALUES(144, 'systems', 'hydraulics', 'mc', '3000 psi.', NULL, NULL, '2900 psi.', '1600 psi.', '1200 psi.', 'During normal flight, the engine drive hydraulic pump supplies:', '');
INSERT INTO `questions` VALUES(145, 'systems', 'hydraulics', 'mc', 'Emergency brakes only, supplying 6 applications.', NULL, NULL, 'Outboard spoilers, inboard brakes, emergency brakes.', 'Inboard spoilers, outboard brakes, landing gear.', 'Emergency brakes only, unlimited applications.', 'The hydraulic accumulator #2 alone can supply the:', '');
INSERT INTO `questions` VALUES(146, 'systems', 'hydraulics', 'mc', '0 psi.', NULL, NULL, '2900 psi.', '3000 psi.', '1600 psi.', 'In normal cruise flight conditions, the electric hydraulic pumps are producing:', '');
INSERT INTO `questions` VALUES(147, 'systems', 'hydraulics', 'mc', 'Freefall (freefall).', NULL, NULL, 'Are held up by a mechanical uplock.', 'Are held up by system 1 accumulator pressure.', 'Extend normally using the gear handle.', 'If hydraulic system 1 loses all pressure during flight, the nose wheel doors:', '');
INSERT INTO `questions` VALUES(148, 'systems', 'hydraulics', 'c2', 'The pump is kept in standby until the engine driven pump pressure drops below a set value.', 'The pump is kept in standby until the asociated engine N2 drops below a set value.', NULL, 'The pump does not operate unless the ON position is selected.', NULL, NULL, 'What does the AUTO position of the electric hydraulic pump knob provide?', '');
INSERT INTO `questions` VALUES(149, 'systems', 'hydraulics', 'mc', 'Restricts hydraulic presure from the landing gear to the ensure pressure for the flight controls.', NULL, NULL, 'Ensures hydraulic pressure to the landing gear when operating on the electric hydraulic pump.', 'Allows hydraulic system 2 to assisty hydraulic system 1 in low pressure situations.', 'Gives hydraulic system 1 priority over hydraulic system 2.', 'The priority value in hydraulic system 1 provides:', '');
INSERT INTO `questions` VALUES(150, 'systems', 'hydraulics', 'mc', 'Turns on the electric pump regardless of system pressure.', NULL, NULL, 'Turns on the electric hydraulic pump only if system pressure is lost.', 'Turns on the electric pump only if the engine is shut down.', 'Places the electric hydraulic pump in a standby condition.', 'The electric hydraulic pump control knob in the ON position:', '');
INSERT INTO `questions` VALUES(151, 'systems', 'hydraulics', 'mc', 'The nose-wheel steering.', NULL, NULL, 'The parking brake.', 'The inboard flaps.', 'The rudder above 135 KIAS.', 'Hydraulic system 1 provides pressure to:', '');
INSERT INTO `questions` VALUES(152, 'systems', 'hydraulics', 'nc', NULL, NULL, NULL, 'EICAS.', 'MFD ECS/AI page.', 'The RMU Engine page 1.', 'The hydraulic system quantity can be monitored on the:', '');
INSERT INTO `questions` VALUES(153, 'systems', 'hydraulics', 'mc', 'Cannot be monitored.', NULL, NULL, 'MFD hydraulic page.', 'EICAS.', 'The MFD hydraulic page for system 1 only.', 'Hydraulic system temperature can be monitored on the:', '');
INSERT INTO `questions` VALUES(154, 'systems', 'hydraulics', 'nc', NULL, NULL, NULL, 'Emergency brakes.', 'Ailerons and rudder should all presure be lost.', 'Nosewheel steering.', 'The hydraulic accumulator #1 provides pressure for:  ', '');
INSERT INTO `questions` VALUES(155, 'systems', 'hydraulics', 'mc', 'Not available.', NULL, NULL, 'Both available.', 'Only the #1 pump is available for landing gear extension.', 'Only the #2 pump is available for the emergency brakes.', 'In essential power, the electric hydraulic pumps are:', '');
INSERT INTO `questions` VALUES(156, 'systems', 'hydraulics', 'mc', 'Both hydraulic systems.', NULL, NULL, 'Hydraulic system 1 only.', 'Hydraulic system 2 only.', 'Hydraulic system 2 only, when above 135 KIAS.', 'The ailerons are normally hydraulically powered by:', '');
INSERT INTO `questions` VALUES(157, 'systems', 'hydraulics', 'mc', 'Electric pumps to AUTO, 2900 psi +/- 200.', NULL, NULL, 'Electric pumps to AUTO, 3000 psi +/- 200.', 'Electric pumps to ON, 1600 psi.', 'Engine driven pumps producing pressure when engines are at 56.4 N2.', 'The following indications reflect a successful hydraulic system test:', '');
INSERT INTO `questions` VALUES(158, 'systems', 'ice_rain_prot', 'mc', 'By pressing the SPS test button (on the ground only).', NULL, NULL, 'Once the aircraft exits icing conditions.', 'By pressing the SPS test button at any time.', 'By pressing the quick disconnect button.', 'The SPS/ICE SPEEDS EICAS message is cleared:', '');
INSERT INTO `questions` VALUES(159, 'systems', 'ice_rain_prot', 'mc', '1000\\'' overcast and 12 degrees Celsius.', NULL, NULL, 'Visibility 1 & 1/2 SM and 15 degrees Celsius.', 'Clear skies and 2 degrees Celsius.', 'Rain and 20 degrees Celsius.', 'When is the ice protection penalty on the runway analysis required?', '');
INSERT INTO `questions` VALUES(160, 'systems', 'ice_rain_prot', 'mc', 'Whenever the temperature is 10 C or less and visible moisture is present.', NULL, NULL, 'Whenever the temperature is 10 C or less.', 'Whenever visible moisture is present.', 'Whenever the TAT heating is selected ON.', 'When is engine lip anti-ice required?', '');
INSERT INTO `questions` VALUES(161, 'systems', 'ice_rain_prot', 'mc', 'There are clear ice-detectors on the wings.', NULL, NULL, 'The XR has boots.', 'The vertical stabilizer is heated.', 'No ice test is needed.', 'How is the XR anti-ice system different?', '');
INSERT INTO `questions` VALUES(162, 'systems', 'ice_rain_prot', 'nc', NULL, NULL, NULL, 'Uses bleed air from the 9th stage of the compressor.', 'Cannot be activated unless ice is detected.', 'Fails closed (OFF) in essential power.', 'Engine lip anti-ice:', '');
INSERT INTO `questions` VALUES(163, 'systems', 'ice_rain_prot', 'mc', 'Only engine bleed air may be used.', NULL, NULL, 'All three bleed valves must be closed.', 'Engine, wing, and stab anti-ice must be selected OFF.', 'The engine thrust must be at a minimum of 83% N1.', 'To perform the A ice protection test:', '');
INSERT INTO `questions` VALUES(164, 'systems', 'ice_rain_prot', 'mc', 'One or both ice detectos must be detecting ice.', NULL, NULL, 'Both ice detectors must be working and detecting ice.', 'The TAT must be less than 0 C.', 'The TAT must be less than 10 C.', 'For ice protection to be activated automatically:', '');
INSERT INTO `questions` VALUES(165, 'systems', 'ice_rain_prot', 'mc', 'The essential buses.', NULL, NULL, 'DC Bus 1.', 'DC Bus 2.', 'The shed bus.', 'Pitot/static tube #3 receives electrical heating from :', '');
INSERT INTO `questions` VALUES(166, 'systems', 'ice_rain_prot', 'mc', 'On and cannot be turned off.', NULL, NULL, 'Not available.', 'Available if selected on or in icing conditions.', 'Comes from the 9th stage of the compressor only.', 'In essential power, engine anti-ice is:', '');
INSERT INTO `questions` VALUES(167, 'systems', 'ice_rain_prot', 'mc', 'Is not available.', NULL, NULL, 'Is on and cannot be turned off.', 'Is available with the override switch in ALL.', 'Wing and stabilizer anti-ice will operate, but expect failure messages.', 'In essential power, wing and stabilizer anti-ice:', '');
INSERT INTO `questions` VALUES(168, 'systems', 'ice_rain_prot', 'mc', 'The engines bleed shoud be selected open.', NULL, NULL, 'PacK 1 is off, Pack 2 is on.', 'The use of packs is only permitted if the APU bleed is available.', 'The engines bleeds will always be closed.', 'When taking off into icing conditions:', '');
INSERT INTO `questions` VALUES(169, 'systems', 'ice_rain_prot', 'mc', 'The APU bleed air can be used for air conditioning.', NULL, NULL, 'The engines bleeds must be open for anti-ice.', 'The APU bleed cannot be used becuase it is not hot enough for engine anti-ice.', 'The APU bleed can be used but only for a single engine taxi, since it is on the left side of the system.', 'When taxiing in icing conditions:', '');
INSERT INTO `questions` VALUES(170, 'systems', 'ice_rain_prot', 'mc', 'ICE CONDITION EICAS message.', NULL, NULL, 'Hold the test switch for twenty seconds.', '4 \\''open\\'' inscriptions on the overhead panel.', 'AOA 1(2) HEAT INOP.', 'During the first part of ice test B (ground portion), which of the following should occur?', '');
INSERT INTO `questions` VALUES(171, 'systems', 'ice_rain_prot', 'mc', 'Override to ALL, test switch for 10 seconds minimum.', NULL, NULL, 'Override to AUTO.', 'Override to AUTO for a minimum of 10 seconds, maximum 30 seconds.', 'The override to ENG/test switch held for 20 seconds in each position.', 'Ice test A requires:', '');
INSERT INTO `questions` VALUES(172, 'systems', 'ice_rain_prot', 'c2', 'Ice detectors.', 'TAT probes.', NULL, 'The leading edge of the wings and the horizontal stabilizer.', NULL, NULL, 'Regarding ice protection, what aircraft components are heated electrically?', '');
INSERT INTO `questions` VALUES(173, 'systems', 'ice_rain_prot', 'mc', 'On the ground with a wheel speed at or below 25 kts.', NULL, NULL, 'With the FADEC Ref. anti-ice selected OFF.', 'During a bleed overtemp.', 'They are never inhbited.', 'The horizontal stabilizer and wing anti-ice subsystems are automatically inhibited:', '');
INSERT INTO `questions` VALUES(174, 'systems', 'ice_rain_prot', 'mc', 'On the ground only, when clear ice is present on the wing.', NULL, NULL, 'In flight only, when clear ice is present on the wing.', 'On the ground or in flight when clear ice is present on the wing.', 'XRJ''s are not equipped with clear ice detectors.', 'The clear ice detectors on the XRJ will trigger a CLR ICE 1(2) EICAS message:', 'Which statement is true regarding the operation of the clear ice detection on an XRJ?');
INSERT INTO `questions` VALUES(175, 'systems', 'ldg_gear_brk', 'mc', 'Activating nosewheel steering.', NULL, NULL, 'The nose wheel doors to close.', 'The pressurization system to begin pressurizing during takeoff.', 'Removal of ground inihibtion for the weather radar.', 'The nose wheel air/ground sensor provides a signal for:', '');
INSERT INTO `questions` VALUES(176, 'systems', 'ldg_gear_brk', 'mc', 'All 4 brakes.', NULL, NULL, 'The inboard brakes only.', 'The outboard brakes only.', 'All 6 brakes.', 'The emergency brake lines supply:', '');
INSERT INTO `questions` VALUES(177, 'systems', 'ldg_gear_brk', 'mc', 'With the landing gear handle as normal.', NULL, NULL, 'Pulling the freefall lever.', 'Using the electrical override switch.', 'The landing gear freefalls as soon as engine 1 is shutdown.', 'If engine 1 is shutdown, how is the landing gear extended?', '');
INSERT INTO `questions` VALUES(178, 'systems', 'ldg_gear_brk', 'c2', 'At least 6 emergency brake applications.', 'Parking brake pressure for 24 hours.', NULL, 'Unlimited emergency brake applications.', NULL, NULL, 'If down to hydraulic accumulator 2 only, the aircraft has:', '');
INSERT INTO `questions` VALUES(179, 'systems', 'ldg_gear_brk', 'mc', 'Mechanically, hydrualically.', NULL, NULL, 'Hydrualically, hydrualically.', 'Mechanically, Mechanically.', 'Hydraulically, Mechanically.', 'The landing gear is normally help up ___ and extended ___.', '');
INSERT INTO `questions` VALUES(180, 'systems', 'ldg_gear_brk', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'When using the emergency brakes, the anti-skid, locked wheel and touchdown protection are not available.', '');
INSERT INTO `questions` VALUES(181, 'systems', 'ldg_gear_brk', 'mc', '200 KIAS.', NULL, NULL, '145 KIAS.', '250 KIAS.', '320 KIAS or M 0.78.', 'The maximum landing gear retraction speed is:', '');
INSERT INTO `questions` VALUES(182, 'systems', 'ldg_gear_brk', 'mc', 'No anti-skid protection.', NULL, NULL, 'Locked wheel protection, but not touchdown protection.', 'Touchdown protection, but not anti-skid protection.', 'Anti-skid protection only.', 'The emergency brake provides:', '');
INSERT INTO `questions` VALUES(183, 'systems', 'ldg_gear_brk', 'mc', 'Is not available.', NULL, NULL, 'Operates normally.', 'Operates normally, but only above 10 knots.', 'Is available, but with limited capability.', 'In essential power, nosewheel steering:', '');
INSERT INTO `questions` VALUES(184, 'systems', 'ldg_gear_brk', 'mc', 'Requires no electrical or hydrualic power to extend the landing gear.', NULL, NULL, 'Uses hydraulic system 1 pressure to lower the gear.', 'Uses essential power to extend the gear.', 'Bypasses the landing gear handle to extend the gear hydrualically.', 'The landing gear freefall actuator, when pulled:', '');
INSERT INTO `questions` VALUES(185, 'systems', 'ldg_gear_brk', 'c2', 'Must be extended with the freefall actuator.', 'Cannot be retracted once extended.', NULL, 'Operates using hydraulic system 2 pressure, but may be slower due to the priority valve.', NULL, NULL, 'With the total loss of hydraulic system 1, the landing gear lever:', '');
INSERT INTO `questions` VALUES(186, 'systems', 'ldg_gear_brk', 'mc', 'All main gear brakes.', NULL, NULL, 'The outboard brakes only.', 'The inboard brakes only.', 'The main & nose gear brakes.', 'When operating the emergency brakes, hydraulic pressure is applied to:', '');
INSERT INTO `questions` VALUES(187, 'systems', 'ldg_gear_brk', 'mc', 'Outboard.', '', '', 'Inboard.', 'Nose landing gear tires do not have chines.', 'inboard on XR\\''s only.', 'On the nose landing gear tires, the chines are mounted:', '');
INSERT INTO `questions` VALUES(188, 'systems', 'ldg_gear_brk', 'mc', 'Mechanical snubber.', NULL, NULL, 'Hydraulic pressure.', 'Pneumatic pressure.', 'Normal spin down.', 'Nosewheel tire rotation is stopped on retraction by:', '');
INSERT INTO `questions` VALUES(189, 'systems', 'ldg_gear_brk', 'mc', 'Hydraulic system 1.', NULL, NULL, 'Hydraulic system 2.', 'Both hydraulic systems.', 'Is electropneumatic.', 'Nosewheel steering utilizes:', '');
INSERT INTO `questions` VALUES(190, 'systems', 'ldg_gear_brk', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'The purpose of the landing gear over-center brace is to keep the landing gear down and locked.', '');
INSERT INTO `questions` VALUES(191, 'systems', 'ldg_gear_brk', 'mc', 'By normal means.', NULL, NULL, 'Electrical override.', 'Free-fall lever.', 'Through use of hydraulic accumulator 2.', 'In essential power, how should the landing gear be extended?', '');
INSERT INTO `questions` VALUES(192, 'systems', 'ldg_gear_brk', 'mc', 'RA inop, low thrust lever angle, flaps 0-18.', NULL, NULL, '<1200\\'' AGL, low thrust lever angle, flaps 0-22.', 'Any thrust lever angle, flaps 45.', 'Any thrust lever, RA inop, flaps 22.', 'What parameters allow us to cancel a landing gear aural warning message?', '');
INSERT INTO `questions` VALUES(193, 'systems', 'ldg_gear_brk', 'mc', 'Normal braking.', NULL, NULL, 'Spoilers.', 'Flaps.', 'TBCH.', 'What is available when down to essential power?', '');
INSERT INTO `questions` VALUES(194, 'systems', 'lighting', 'mc', 'Flight crew.', NULL, NULL, 'Gate agent.', 'Maintenance.', 'They no longer need to be charged.', 'Charging the XR photo luminescent aisle lights is the responsibility of the:', '');
INSERT INTO `questions` VALUES(195, 'systems', 'lighting', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'With the taxi light switch ON and the gear up and locked, the taxi lights are actually OFF.', 'The nose landing and taxi lights are only illuminated if the respective light switches are on and the gear is down and locked.');
INSERT INTO `questions` VALUES(196, 'systems', 'lighting', 'mc', 'Automatically come on when normal electrical power is lost.', NULL, NULL, 'Drain the main batteries so they should be turned off in an emergency.', 'Can only be turned on manual.y by the flight attendant.', 'Recharge when in the OFF position.', 'The emergency lights:', '');
INSERT INTO `questions` VALUES(197, 'systems', 'lighting', 'mc', '15 minutes.', NULL, NULL, '40 minutes.', '30 minutes.', '45 minutes if pitot 3 heat is turned off.', 'The emergency lights will last a minimum of:', '');
INSERT INTO `questions` VALUES(198, 'systems', 'lighting', 'mc', 'Could deplete battery 2 unless turned OFF.', NULL, NULL, 'Automatically shut off when the airplane is depowered.', 'Knob must be left in the AUTO position.', 'Come on automatically when normal power is lost.', 'The courtesy lights:', '');
INSERT INTO `questions` VALUES(199, 'systems', 'lighting', 'mc', 'Photo luminescent lighting.', NULL, NULL, 'Red and white lights powered by the backup battery.', 'A steady set of green lights powered by DC bus 1.', 'There is no aisle path lighting.', 'Aisle path lighting in the XR consists of:', '');
INSERT INTO `questions` VALUES(200, 'systems', 'lighting', 'mc', 'ARM position.', NULL, NULL, 'OFF position.', 'ON position.', 'Are not charged and replaced periodically by maintenance.', 'The emergency light batteries are charged with normal power established on the aircraft and when the emergency light switch is in the:', '');
INSERT INTO `questions` VALUES(201, 'systems', 'lighting', 'mc', 'Dedicated batteries.', NULL, NULL, 'Essential bus.', 'DC bus.', 'Photo luminescent; no power source required.', 'What is the power source for the emergency lighting system on the 145 EP/LR?', '');
INSERT INTO `questions` VALUES(202, 'systems', 'lighting', 'mc', 'Shed.', NULL, NULL, 'Essential.', 'DC.', 'Backup bus.', 'What is the power source for the nose landing light?', '');
INSERT INTO `questions` VALUES(203, 'systems', 'limitations', 'mc', '-40.', NULL, NULL, '-20.', '-65.', '20.', 'The minimum outside temperature (Celsius)  for takeoff is:', '');
INSERT INTO `questions` VALUES(204, 'systems', 'limitations', 'mc', 'FL 370.', NULL, NULL, 'FL350.', 'FL410.', 'FL450.', 'The XR maximum operational altitude is:', '');
INSERT INTO `questions` VALUES(205, 'systems', 'limitations', 'mc', '200 knots.', NULL, NULL, '250 knots.', '180 knots.', '240 knots.', 'After completing the Emergency Descent memory item, below what airspeed must you retract the landing gear?', '');
INSERT INTO `questions` VALUES(206, 'systems', 'limitations', 'mc', 'Yes.', NULL, NULL, 'No.', 'Only if the crossfeed is on.', 'Yes, provided the flight crew advises ATC.', 'With a FUEL IMBALANCE EICAS message and a 750 lb. fuel imbalance, is it acceptable to takeoff.', '');
INSERT INTO `questions` VALUES(207, 'systems', 'limitations', 'mc', '10 seconds.', '', '', '1 minute.', 'It doesn\\''t.', '5 minutes.', 'While descending through 10,000 ft, you notice the LP spool vibration on engine 1 is in the after.  After running the appropriate QRH, when must the engine be shutdown?', '');
INSERT INTO `questions` VALUES(208, 'systems', 'limitations', 'mc', '40 degrees C.', NULL, NULL, '20 degrees C.', '40 degrees F.', '20 degrees F.', 'What is the minimum oil temperature required to increase N2 above 83%?', '');
INSERT INTO `questions` VALUES(209, 'systems', 'limitations', 'mc', 'Control column hold firmly.', NULL, NULL, 'Quick disconnect button, press and hold.', 'Pitch systems 1 & 2 off.', 'Actuate the pitch trim switch in the opposite direction.', 'What is the first step in the PITCH TRIM RUNAWAY memory item?', '');
INSERT INTO `questions` VALUES(210, 'systems', 'limitations', 'mc', '-40 C.', NULL, NULL, '-40 F.', '-20 F.', '-20 C.', 'What is the minimum oil temperature for engine start?', '');
INSERT INTO `questions` VALUES(211, 'systems', 'limitations', 'mc', '10 knots.', NULL, NULL, '20 knots.', '15 knots.', '30 knots.', 'The maximum tailwind component for takeoff and landing is ___.', '');
INSERT INTO `questions` VALUES(212, 'systems', 'limitations', 'mc', 'ISA + 35 C.', NULL, NULL, 'ISA + 45 C.', 'ISA + 15 C.', 'ISA + 25 C.', 'The maximum static air temperature (SAT) for aircraft operation is ___.', '');
INSERT INTO `questions` VALUES(213, 'systems', 'limitations', 'mc', '-21.5 C.', NULL, NULL, '-65 C.', '35 C.', '9 C.', 'The maximum static air temperature (SAT) at FL370 is ___.', '');
INSERT INTO `questions` VALUES(214, 'systems', 'limitations', 'mc', '-45 C with momentary deviations to -50 C permitted.', NULL, NULL, '-30 C.', '-52 C.', '-65 C.', 'The total air temperature (TAT) in cruise flight above FL250 is limited to ___.', '');
INSERT INTO `questions` VALUES(215, 'systems', 'limitations', 'mc', '250 knots.', NULL, NULL, '200 knots.', '180 knots.', '200 knots below 10,000 and 180 knots when above 10,000.', 'What is VLE?', '');
INSERT INTO `questions` VALUES(216, 'systems', 'limitations', 'mc', '800 lbs.', NULL, NULL, '100 lbs.', '900 lbs.', 'No maximum exists provided the roll trim is operative.', 'The maximum permitted fuel imbalance between wing tanks is ___.', '');
INSERT INTO `questions` VALUES(217, 'systems', 'limitations', 'mc', '160 knots.', NULL, NULL, '170 knots.', '200 knots.', 'Our fleet is post-mod SB 10-02 and the limitation no longer applies.', 'What is the maximum airspeed after takeoff without re-trimming?', '');
INSERT INTO `questions` VALUES(218, 'systems', 'limitations', 'mc', 'FL300.', NULL, NULL, 'FL370.', 'FL200.', 'FL350.', 'What is the maximum altitude for starting the APU?', '');
INSERT INTO `questions` VALUES(219, 'systems', 'limitations', 'mc', '300 amps.', NULL, NULL, '400 amps.', '250 amps.', '350 amps.', 'The maximum load on the APU generator above FL300 is:', '');
INSERT INTO `questions` VALUES(220, 'systems', 'limitations', 'mc', '800 C.', NULL, NULL, '565 C.', '560 C.', '750 C.', 'The maximum ITT for engine start is ___.', '');
INSERT INTO `questions` VALUES(221, 'systems', 'limitations', 'mc', 'Takeoff.', NULL, NULL, 'Complete a static run-up to 88% N2 and allow the engines to stabilize.', 'Notify maintenance and return to the gate.', 'Delay takeoff until the oil temperature is above 40 C.', 'The engines have been running for 8 minutes and the oil temperature is 40 C.  What action is appropriate?', '');
INSERT INTO `questions` VALUES(222, 'systems', 'limitations', 'mc', 'Continue takeoff and start your timer.  Youa re time limited to 2 minutes.', NULL, NULL, 'Abort the takeoff if below 80 knots.', 'Abort the takeoff if below V1.', 'Disregard - this is a normal oil pressure on takeoff.', 'On the takeoff roll, oil pressure reaches 118 PSI. The correct action is to ...', '');
INSERT INTO `questions` VALUES(223, 'systems', 'limitations', 'mc', '200 KIAS.', NULL, NULL, '250 KIAS below 10,000 feet.', '250 KIAS or MACH .63, whichever is lower.', '250 KIAS or MACH .63, whichever is higher.', 'Maneuvering speed (VA) is ...?', '');
INSERT INTO `questions` VALUES(224, 'systems', 'oxy', 'mc', 'Turn the regulator knob to the emergency position and listen for the flow of oxygen.', '', '', 'Use the test/reset switch on the ACM\\''s oxygen mask.', 'Look for the yellow blinker to illuminate.', 'Press the emergency button on the ACM\\''s digital audio panel.', 'In order to test the ACM\\''s oxygen mask, select mask on the ACM and either pilot\\''s DAP and:', '');
INSERT INTO `questions` VALUES(225, 'systems', 'oxy', 'mc', 'When the oxygen ON indicator light is illuminated.', NULL, NULL, 'Never.', 'In essential power.', 'Upon pressing the CONFIRM INIT button on the FMS prior to pushback.', 'The FASTEN SEAT BELT signs are automatically turned on:', '');
INSERT INTO `questions` VALUES(226, 'systems', 'oxy', 'mc', '14,000\\'' cabin altitude.', NULL, NULL, '14,000\\'' MSL.', '14,000\\'' AGL.', '9,900 +/- 100\\'' cabin altitude.', 'With the passenger oxygen knob in AUTO (non-XR) the passenger oxygen masks drop at:', '');
INSERT INTO `questions` VALUES(227, 'systems', 'oxy', 'mc', 'Oxygen generators.', NULL, NULL, 'Demand flow masks.', 'Two oxygen bottles, which supply the passenger oxygen masks.', '50 inflatable harness masks.', 'The passenger oxygen system includes:', '');
INSERT INTO `questions` VALUES(228, 'systems', 'oxy', 'mc', 'The oxygen pressure is at or below 400 psi.', NULL, NULL, 'Approximately 30 minutes of crew oxygen remains.', 'The passenger oxygen is below 550 psi.', 'Oxygen masks have dropped when they should not have.', 'The OXYGEN LOW PRESS message appears on the EICAS when:', '');
INSERT INTO `questions` VALUES(229, 'systems', 'oxy', 'mc', '1200 PSI.', NULL, NULL, '400 PSI.', '500 PSI.', '1850 PSI.', 'Minimum dispatch pressure for the portable oxygen bottle is:', '');
INSERT INTO `questions` VALUES(230, 'systems', 'oxy', 'tf', 'FALSE', NULL, NULL, NULL, NULL, NULL, 'When the passenger masks fall, the oxygen flow starts without the passengers taking any action.', '');
INSERT INTO `questions` VALUES(231, 'systems', 'oxy', 'mc', '14,500\\'' +/- 500 cabin altitude.', NULL, NULL, '14,000\\'' MSL.', '14,000\\'' AGL.', '10,000\\'' cabin altitude.', 'In the XR with passenger oxygen masks in AUTO, the oxygen masks drop at:', '');
INSERT INTO `questions` VALUES(232, 'systems', 'oxy', 'mc', 'Anytime power is supplied.', NULL, NULL, 'When cabin altitude exceeds 14,000 feet.', 'Only in flight.', 'Only in essential power.', 'Placing the passenger oxygen knob to ON will deploy the oxygen masks:', '');
INSERT INTO `questions` VALUES(233, 'systems', 'oxy', 'mc', 'Turn the valve in the flightdeck.', '', '', 'Turn the valve on the outside oxygen panel.', 'There is no valve.', 'This is a maintenance responsibility.', 'To ensure the main oxygen cylinder is in the "ON" position:', '');
INSERT INTO `questions` VALUES(234, 'systems', 'oxy', 'mc', 'May indicate that an overpressure has occurred if missing.', NULL, NULL, 'Prevents contamination of the discharge line.', 'Is located within the oxygen servicing panel.', 'Turns red when the pressure is low.', 'The green flight crew oxygen system safety disk:', '');
INSERT INTO `questions` VALUES(235, 'systems', 'oxy', 'mc', 'Cockpit temperature.', NULL, NULL, 'Outisde air temperature.', 'Current ATIS temperature.', 'Actual ramp temperature.', 'To ensure adequate oxygen for dispatch, one must know the number of crew, oxygen pressure and:', '');
INSERT INTO `questions` VALUES(236, 'systems', 'oxy', 'nc', NULL, NULL, NULL, 'Is identical to the CA & FO.', 'Has only a test button.', 'Has only a visible test flow blinker.', 'The ACM oxygen mask storage unit:', '');
INSERT INTO `questions` VALUES(237, 'systems', 'oxy', 'mc', 'Select "Mask" on the DAP, adjust speaker volume, and press test button.', '', '', 'Select "Mask" on the DAP, twist to Emergency.', 'Press the "test" button.  In this case it is not necessary to select "Mask."', 'The crew must ensure that no passengers are on board.', 'In order to test the First Officer\\''s oxygen mask,', '');
INSERT INTO `questions` VALUES(238, 'systems', 'oxy', 'mc', 'A fixed oxygen cylinder.', NULL, NULL, 'An oxygen generator.', 'The PBE.', 'A portable oxygen bottle.', 'During a rapid cabin depressurization, flight dec crew members receive oxygen from...', '');
INSERT INTO `questions` VALUES(239, 'systems', 'pneum', 'mc', 'Engine bleeds open, APU bleed closed, PACKs off.', '', '', 'Engine bleeds closed, APU bleed open, PACKs on.', 'Engine bleeds open, APU bleed closed, PACKs on, crossbleed open.', 'All bleeds open, PACKs on, cross bleed open.', 'For a summer takeoff in Houston with an MEL\\''d APU, the bleeds should be configured:', '');
INSERT INTO `questions` VALUES(240, 'systems', 'pneum', 'mc', 'The APU bleed valve closes.', NULL, NULL, 'The engine bleed valve closes.', 'Both valves can be open at the same time.', 'Both valves close.', 'With the APU bleed valve selected OPEN, if engine 1 bleed valve is also opened, ', '');
INSERT INTO `questions` VALUES(241, 'systems', 'pneum', 'mc', 'A line, no OPEN inscription.', NULL, NULL, 'A line and an OPEN inscription.', 'Open inscription, no line.', 'No line, no open inscription.', 'With the APU off and the APU bleed button selected OPEN, the button has:', '');
INSERT INTO `questions` VALUES(242, 'systems', 'pneum', 'mc', 'AUTO, closed.', NULL, NULL, 'CLOSED, closed.', 'OPEN, open.', 'AUTO, open.', 'In normal cruise flight conditions, the crossbleed knob is in ___ and the crossbleed valve ___.', '');
INSERT INTO `questions` VALUES(243, 'systems', 'pneum', 'mc', 'Air leaving the pre-cooler is too hot.', NULL, NULL, 'The air leaving the pack is too hot.', 'A massive leak detector has detected a bleed leak.', 'Air leaving the pack is too hot.', 'The EICAS warning BLD 1(2) OVTEMP indicates that:', '');
INSERT INTO `questions` VALUES(244, 'systems', 'pneum', 'c2', 'The 9th compressor stage at higher thrust settings.', 'The 14th compressor stage in icing conditions.', NULL, 'The 14th stage compressor only.', NULL, NULL, 'Engine bleed air is used from:', '');
INSERT INTO `questions` VALUES(245, 'systems', 'pneum', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'While taxiing in ground icing conditions, the APU bleed may be used to supply air to the packs.', '');
INSERT INTO `questions` VALUES(246, 'systems', 'pneum', 'ac', 'The engine bleed valve should automatically close.', 'Hot bleed air is escaping from the bleed lines.', 'A red "LEAK" inscription appears on the pneumatic panel.', NULL, NULL, NULL, 'During a bleed leak.', '');
INSERT INTO `questions` VALUES(247, 'systems', 'pneum', 'mc', 'During a cross-bleed start.', NULL, NULL, 'During ice test A.', 'Anytime the ICE CONDITION EICAS message is displayed.', 'When the override knob on the ice protection panel is in ENG.', 'Wen will the crossbleed valve open automatically when in the "AUTO" position?', '');
INSERT INTO `questions` VALUES(248, 'systems', 'pneum', 'mc', 'External air starts.', NULL, NULL, 'Ice test A.', 'Low power settings.', 'Cross-bleed starts.', '14th stage air is used for all of the above except...', '');
INSERT INTO `questions` VALUES(249, 'systems', 'powerplant', 'mc', 'The FADEC reduces the thrust to idle automatically.', NULL, NULL, 'The engine shuts down automatically.', 'The thrust reverser stows automatically.', 'There is no automatic reaction.', 'If a thrust-reverser deploys in flight:', '');
INSERT INTO `questions` VALUES(250, 'systems', 'powerplant', 'mc', 'The PMA, only above 10% N2.', NULL, NULL, 'The FADEC itself.', 'The PMA, only above 50% N2.', 'The essential buses.', 'The engine ignition system receives electrical power from:', '');
INSERT INTO `questions` VALUES(251, 'systems', 'powerplant', 'mc', 'The engine shuts down.', NULL, NULL, 'The engine keeps running but thrust cannot be changed.', 'The FADECS of the other engine take over, using the inter-nacelle data bus.', 'The engine keeps running in N1 reversionary mode.', 'If both FADECs of one engine fail:', '');
INSERT INTO `questions` VALUES(252, 'systems', 'powerplant', 'mc', 'ALT TO, TO, ETO.', NULL, NULL, 'ETO, TO RSV, ETO RSV.', 'TO, ETO, TO RSV.', 'ATO TO, TO RSV, ETO RSV.', 'What are the three selectable thrust ratings for takeoff in the XR?', '');
INSERT INTO `questions` VALUES(253, 'systems', 'powerplant', 'mc', 'The other FADEC (same engine) immediately takes over.', NULL, NULL, 'The engine shuts down.', 'The engine runs in idle until the pilot resets the FADEC.', 'The engine shuts down and may be restarted after alternating FADECs.', 'If the controlling FADEC fails.', '');
INSERT INTO `questions` VALUES(254, 'systems', 'powerplant', 'tf', 'TRUE', NULL, NULL, NULL, NULL, NULL, 'Do not abort the takeoff if oil pressure increases from the green to the amber range:', 'During the takeoff, oil pressure rises to 117 PSI.  The takeoff should not be aborted.');
INSERT INTO `questions` VALUES(255, 'systems', 'powerplant', 'mc', '992 C for 90 seconds and up to 970 C for 5 minutes.', NULL, NULL, '948 C.', '901 continuous.', '880 for starting.', 'The A1/E engines are limited to ___ ITT.', '');
INSERT INTO `questions` VALUES(256, 'systems', 'powerplant', 'mc', 'Automatically shuts down the engine.', NULL, NULL, 'Fails and the other FADEC takes over.', 'Limits N1 to 106%.', 'Presents the FADEC NO DISP EICAS.', 'If N1 overspeeds, the FADEC:', '');
INSERT INTO `questions` VALUES(257, 'systems', 'powerplant', 'mc', '800 C.', NULL, NULL, '901 C.', '868 C.', '506 C.', 'Maximum ITT for engine start on an A1/P engine is:', '');
INSERT INTO `questions` VALUES(258, 'systems', 'powerplant', 'mc', '2 minutes.', NULL, NULL, '1 minute.', '3 minutes.', '5 minutes.', 'The engine must run at idle or taxi thrust for a minimum of ___ before shutdown.', '');
INSERT INTO `questions` VALUES(259, 'systems', 'powerplant', 'mc', 'N2 via the tower shaft.', NULL, NULL, 'N1 via the tower shaft.', 'Reduction gears via the N1 turbine.', 'N2 via a linkage on the HP spool.', 'What drives the items on the Engine Accessory Gearbox?', '');
INSERT INTO `questions` VALUES(260, 'systems', 'powerplant', 'mc', 'The essential buses or the PMA depending on N2 RPM.', '', '', 'The PMA only.', 'The essential buses.', 'The essential buses during an electrical emergency.', 'The FADECs receive electrical power from: ', 'Engine FADECs are powered by...');
INSERT INTO `questions` VALUES(261, 'systems', 'powerplant', 'mc', 'MFD takeoff page.', NULL, NULL, 'EICAS.', 'MFD Hydraulic page.', 'RMU maintenance page.', 'Engine oil quantity can be monitored on the:', '');
INSERT INTO `questions` VALUES(262, 'systems', 'powerplant', 'mc', 'Approximately 30 percent N2.', NULL, NULL, '12-14 percent N2.', '56.4 percent N2.', 'Immediately after IGN is displayed on the EICAS.', 'During an engine start, fuel should be introduced at...', '');
INSERT INTO `questions` VALUES(263, 'systems', 'powerplant', 'mc', 'Fuel pressure.', '', '', 'Engine oil pressure.', 'Fuel pressure.', '9th stage bleed air.', 'Regarding the powerplant, what actuates the CVG\\''s?', '');
INSERT INTO `questions` VALUES(264, 'systems', 'powerplant', 'mc', 'FADEC "A" automatically takes over.', NULL, NULL, 'The engines shuts down.', 'Engine page 1 automatically appears on RMU1.', 'The engine reverts to N1SYN mode.', 'If FADEC B fails when it is controlling Engine 2:', '');
INSERT INTO `questions` VALUES(265, 'systems', 'powerplant', 'mc', 'Ejector pump.', '', '', 'Engine driven generator.', 'Oil pump.', 'Ejector pump.', 'Which is not an item in the engine\\''s accessory gear box?', '');
INSERT INTO `questions` VALUES(266, 'systems', 'powerplant', 'mc', 'TO-RSV.', NULL, NULL, 'E-TO.', 'TO-1.', 'ALT-TO.', 'Which is not a pilot selectable thrust setting for the A1E engine?', '');
INSERT INTO `questions` VALUES(267, 'systems', 'powerplant', 'mc', 'Leave the engine running and call for the ATS SOV OPEN QRH.', NULL, NULL, 'Shut the engine down immediately and call maintenance.', 'Shut the engine down and call for the ATS SOV OPEN QRH.', 'Leave the engine running and call for the Abnormal Engine Start QRH.', 'Select the correct statement regarding an "ATS SOV OPEN" caution.', '');
INSERT INTO `questions` VALUES(268, 'systems', 'pressurization', 'mc', 'Landing elevation.', NULL, NULL, 'Cruise altitude.', 'Takeoff elevation.', 'Desired cabin altitude.', 'Which altitude needs to be set by the pilot in the automatic pressurization system?', '');
INSERT INTO `questions` VALUES(269, 'systems', 'pressurization', 'mc', 'Underpressure/overpressure relief should the cabin exceed 8.1 PSI or -0.3 PSI.', NULL, NULL, 'Provide static information to the ADCs.', 'Provide static information to the CPAM.', 'Provide static information to the standby airspeed and standby altimeter/ISIS.', 'The purpose of the FADEC/Pressurization static port is to:', '');
INSERT INTO `questions` VALUES(270, 'systems', 'pressurization', 'mc', '25,000\\''.', NULL, NULL, '1700\\'' AGL.', '24,600\\''.', '14,000\\'' +/- 500\\''.', 'The maximum altitude with one PACK inoperative is:', '');
INSERT INTO `questions` VALUES(271, 'systems', 'pressurization', 'mc', '-0.3', NULL, NULL, '7.8', '8.1', '7.5', 'The maximum allowed negative cabin differential is ___ PSID:', '');
INSERT INTO `questions` VALUES(272, 'systems', 'pressurization', 'mc', 'Pitot/static tube 3.', NULL, NULL, 'Static ports 1 and 4.', 'Static ports 2 and 3.', 'The static/pressurization ports.', 'The CPAM receives its static air pressure from:', '');
INSERT INTO `questions` VALUES(273, 'systems', 'pressurization', 'mc', 'Immediately after the PACKs are selected during the after takeoff flow.', NULL, NULL, 'Immediately to 0.2 PSID below current altitude once thrust is set for takeoff.', 'Immediately to 300 feet below current altitude once thrust is set for takeoff.', 'The pneumatic/electropneumatic outflow valves are closed and allow for -0.1 pressurization when thust is set.', 'During an icing takeoff, the aircraft will begin to pressurize...', '');
INSERT INTO `questions` VALUES(274, 'systems', 'pressurization', 'c2', 'Is not useable in manual pressurization mode.', 'Depressurizes the cabin to a maximum of 14,500 ft.', NULL, 'Will depressurize up to FL370.', NULL, NULL, 'The "Dump" button on the automatic pressurization controller:', '');
INSERT INTO `questions` VALUES(275, 'systems', 'profiles', 'mc', 'Reaching acceleration height and then a speed of V2 + 15.', NULL, NULL, 'Positive rate of climb.', 'Vfs.', 'Above a safe altitude.', 'During a go-around, the flaps can be raised to 0 degrees at:', '');
INSERT INTO `questions` VALUES(276, 'systems', 'profiles', 'mc', 'Continue the takeoff and perform the engine fire QRH after reaching a safe altitude.', NULL, NULL, 'The takeoff should be aborted if sufficient runway remains.', 'Continue the takeoff and perform the engine fire QRH after reaching V2.', 'Perform the engine fire QRH at acceleration height after reaching Vfs.', 'During takeoff, if an engine fire is indicated after V1:', '');
INSERT INTO `questions` VALUES(277, 'systems', 'radar', 'mc', 'Changes the intensity of each color displayed.', NULL, NULL, 'Changes the amount of energy transmitted.', 'Should always be turned to MAX.', 'Should always be pulled out (VAR).', 'The RADAR gain knob:', '');
INSERT INTO `questions` VALUES(278, 'systems', 'radar', 'mc', 'Increasing gain increases receiver sensitivity.', NULL, NULL, 'Increasing gain increases the energy output from the antenna.', 'The radar cannot be used on the ground.', 'GMAP mode is only available during ground operations.', 'Regarding the weather radar, select the true statement.', '');
INSERT INTO `questions` VALUES(279, 'systems', 'stall_prot', 'mc', 'If one channel of the SPS is inoperative.', NULL, NULL, 'If the airspeed is less than 200 kts.', 'During an SPS test.', 'If the SPS/ICE SPEEDs message is displayed.', 'The stick pusher is inhibited:', '');
INSERT INTO `questions` VALUES(280, 'systems', 'stall_prot', 'c2', 'When the low speed awareness tape is in the amber range.', 'When the aircraft symbol touches the PLI.', NULL, 'At 130 KIAS.', NULL, NULL, 'The stick shaker activates:', '');
INSERT INTO `questions` VALUES(281, 'systems', 'stall_prot', 'mc', 'Red.', NULL, NULL, 'White', 'Green.', 'Amber.', 'When your airspeed is in the amber part of the low speed awareness scale, what color is the PLI?', '');
INSERT INTO `questions` VALUES(282, 'systems', 'stall_prot', 'mc', 'Stick shaker and pusher actuation is set to lower angles of attack (higher speeds) due to some type of system failure.', NULL, NULL, 'Stick shaker and pusher actuation is set to higher angles of attack (lower speeds) due to some type of system failure.', 'Is a normal message when flying through icing conditions and will go away once out of icing.', 'Is a normal message when flying through icing conditions and can only be reset on the ground when performing the SPS test.', 'The caution SPS ADVANCED means:', '');

-- --------------------------------------------------------

--
-- Table structure for table `stamp`
--

CREATE TABLE `stamp` (
  `genDate` date NOT NULL,
  `stampin` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `stamp`
--


-- --------------------------------------------------------

--
-- Table structure for table `studentTestRecords`
--

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
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=44 ;

--
-- Dumping data for table `studentTestRecords`
--

INSERT INTO `studentTestRecords` VALUES(4, 'W2344', 'Bill', 'Blakeley', '2011-02-18', '2011-02-20', 'G7057', 'L4', 'nh', 60, 0, 'satisfactory', 92);
INSERT INTO `studentTestRecords` VALUES(5, 'W5422', 'Brenda', 'Walker', '2011-02-18', '2011-02-20', 'G7057', 'L4', 'nh', 60, 0, 'satisfactory', 96);
INSERT INTO `studentTestRecords` VALUES(6, 'W1325', 'John', 'Prenning', '2011-02-18', '2011-02-20', 'G7057', 'L4', 'nh', 60, 0, 'satisfactory', 100);
INSERT INTO `studentTestRecords` VALUES(7, 'W4522', 'Jay', 'Riley', '2011-02-18', '2011-02-20', 'G7057', 'L4', 'nh', 60, 0, 'satisfactory', 88);
INSERT INTO `studentTestRecords` VALUES(8, 'W4231', 'Langley', 'Parsons', '2011-02-18', '2011-02-20', 'G7057', 'L4', 'nh', 60, 0, 'unsatisfactory', 76);
INSERT INTO `studentTestRecords` VALUES(9, 'G6233', 'Dan', 'Reeves', '2006-05-01', '2011-02-23', 'G7057', 'L3', 'upg', 61, 0, 'satisfactory', 96);
INSERT INTO `studentTestRecords` VALUES(10, 'G6152', 'Scott', 'Grosner', '2006-01-02', '2011-02-23', 'G7057', 'L3', 'upg', 61, 0, 'satisfactory', 100);
INSERT INTO `studentTestRecords` VALUES(11, 'G5688', 'Gene', 'Hurger', '2005-08-10', '2011-02-24', 'G7057', 'L3', 'upg', 62, 0, 'unsatisfactory', 76);
INSERT INTO `studentTestRecords` VALUES(12, 'W3389', 'Gerry', 'Blaugher', '2011-02-01', '2011-03-02', 'G7057', 'L4', 'nh', 64, 0, 'satisfactory', 96);
INSERT INTO `studentTestRecords` VALUES(13, 'W3259', 'Mario', 'Listinelli', '2011-02-20', '2011-03-02', 'G7057', 'L4', 'nh', 64, 0, 'satisfactory', 80);
INSERT INTO `studentTestRecords` VALUES(14, 'W3523', 'Karey', 'Durman', '2011-02-20', '2011-03-02', 'G7057', 'L4', 'nh', 65, 0, 'satisfactory', 80);
INSERT INTO `studentTestRecords` VALUES(15, 'W3523', 'Karey', 'Durman', '2011-02-20', '2011-03-02', 'G7057', 'L4', 'nh', 66, 0, 'satisfactory', 80);
INSERT INTO `studentTestRecords` VALUES(16, 'U3411', 'Roy', 'Yanding', '2011-02-21', '2011-03-03', 'G7057', 'L4', 'nh', 67, 0, 'satisfactory', 100);
INSERT INTO `studentTestRecords` VALUES(17, 'W8798', 'Gill', 'Roland', '2011-02-02', '2011-03-03', 'G7057', 'L4', 'nh', 67, 0, 'satisfactory', 96);
INSERT INTO `studentTestRecords` VALUES(18, 'W6129', 'Harry', 'Reeder', '2011-02-02', '2011-03-03', 'G7057', 'L4', 'nh', 67, 0, 'satisfactory', 100);
INSERT INTO `studentTestRecords` VALUES(19, 'W5344', 'Denny', 'Laughlin', '2011-02-02', '2011-03-03', 'G7057', 'L4', 'nh', 67, 0, 'satisfactory', 92);
INSERT INTO `studentTestRecords` VALUES(43, 'G7057', 'Matthew', 'Hull', '2006-05-22', '2011-05-05', 'G7057', 'l4', 'nh', 89, 0, 'satisfactory', 100);
INSERT INTO `studentTestRecords` VALUES(42, 'T8987', 'beta', 'beta', '1970-01-01', '2011-04-14', 'G7057', 'l4', 'nh', 85, 0, 'satisfactory', 96);
INSERT INTO `studentTestRecords` VALUES(41, 'betab', 'beta', 'beta', '2011-04-05', '2011-04-05', 'G7057', 'l4', 'nh', 83, 0, 'unsatisfactory', 58);
INSERT INTO `studentTestRecords` VALUES(40, 'beta', 'beta', 'beta', '1970-01-01', '2011-03-30', 'G5065', 'L1', 'nh', 74, 0, 'satisfactory', 92);
INSERT INTO `studentTestRecords` VALUES(39, 'bewta', 'beta', 'beta', '1970-01-01', '2011-03-15', 'G7057', 'L4', 'nh', 73, 0, 'satisfactory', 96);

-- --------------------------------------------------------

--
-- Table structure for table `testResults`
--

CREATE TABLE `testResults` (
  `resultID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employeeNo` char(10) NOT NULL,
  `genTestID` int(10) unsigned NOT NULL,
  `questionID` int(10) unsigned NOT NULL,
  `correct` tinyint(1) NOT NULL,
  PRIMARY KEY (`resultID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=673 ;

--
-- Dumping data for table `testResults`
--

INSERT INTO `testResults` VALUES(422, 'W1211', 54, 1, 1);
INSERT INTO `testResults` VALUES(423, 'W1211', 54, 3, 1);
INSERT INTO `testResults` VALUES(424, 'W1211', 54, 4, 1);
INSERT INTO `testResults` VALUES(425, 'W1211', 54, 6, 1);
INSERT INTO `testResults` VALUES(426, 'W1211', 54, 7, 1);
INSERT INTO `testResults` VALUES(427, 'W1211', 54, 8, 1);
INSERT INTO `testResults` VALUES(428, 'W1211', 54, 9, 1);
INSERT INTO `testResults` VALUES(429, 'W1211', 54, 10, 1);
INSERT INTO `testResults` VALUES(430, 'W1211', 54, 11, 1);
INSERT INTO `testResults` VALUES(431, 'W1211', 54, 12, 1);
INSERT INTO `testResults` VALUES(432, 'W1211', 54, 13, 1);
INSERT INTO `testResults` VALUES(433, 'W1211', 54, 25, 1);
INSERT INTO `testResults` VALUES(434, 'W1211', 54, 26, 1);
INSERT INTO `testResults` VALUES(435, 'W1211', 54, 27, 1);
INSERT INTO `testResults` VALUES(436, 'W1211', 54, 28, 1);
INSERT INTO `testResults` VALUES(437, 'W1211', 54, 29, 1);
INSERT INTO `testResults` VALUES(438, 'W1211', 54, 30, 0);
INSERT INTO `testResults` VALUES(439, 'W1211', 54, 32, 1);
INSERT INTO `testResults` VALUES(440, 'W1211', 54, 33, 1);
INSERT INTO `testResults` VALUES(441, 'W1211', 54, 34, 1);
INSERT INTO `testResults` VALUES(442, 'W1211', 54, 36, 1);
INSERT INTO `testResults` VALUES(443, 'W1211', 54, 41, 1);
INSERT INTO `testResults` VALUES(444, 'W1211', 54, 42, 1);
INSERT INTO `testResults` VALUES(445, 'W1211', 54, 44, 1);
INSERT INTO `testResults` VALUES(446, 'W1211', 54, 45, 1);
INSERT INTO `testResults` VALUES(447, 'W1211', 55, 29, 1);
INSERT INTO `testResults` VALUES(448, 'W1211', 55, 30, 1);
INSERT INTO `testResults` VALUES(449, 'W2344', 60, 7, 0);
INSERT INTO `testResults` VALUES(450, 'W2344', 60, 11, 1);
INSERT INTO `testResults` VALUES(451, 'W2344', 60, 28, 1);
INSERT INTO `testResults` VALUES(452, 'W2344', 60, 30, 1);
INSERT INTO `testResults` VALUES(453, 'W2344', 60, 34, 0);
INSERT INTO `testResults` VALUES(454, 'W2344', 60, 37, 1);
INSERT INTO `testResults` VALUES(455, 'W5422', 60, 7, 1);
INSERT INTO `testResults` VALUES(456, 'W5422', 60, 11, 1);
INSERT INTO `testResults` VALUES(457, 'W5422', 60, 28, 1);
INSERT INTO `testResults` VALUES(458, 'W5422', 60, 30, 1);
INSERT INTO `testResults` VALUES(459, 'W5422', 60, 34, 0);
INSERT INTO `testResults` VALUES(460, 'W5422', 60, 37, 1);
INSERT INTO `testResults` VALUES(461, 'W1325', 60, 7, 1);
INSERT INTO `testResults` VALUES(462, 'W1325', 60, 11, 1);
INSERT INTO `testResults` VALUES(463, 'W1325', 60, 28, 1);
INSERT INTO `testResults` VALUES(464, 'W1325', 60, 30, 1);
INSERT INTO `testResults` VALUES(465, 'W1325', 60, 34, 1);
INSERT INTO `testResults` VALUES(466, 'W1325', 60, 37, 1);
INSERT INTO `testResults` VALUES(467, 'W4522', 60, 7, 0);
INSERT INTO `testResults` VALUES(468, 'W4522', 60, 11, 1);
INSERT INTO `testResults` VALUES(469, 'W4522', 60, 28, 0);
INSERT INTO `testResults` VALUES(470, 'W4522', 60, 30, 1);
INSERT INTO `testResults` VALUES(471, 'W4522', 60, 34, 0);
INSERT INTO `testResults` VALUES(472, 'W4522', 60, 37, 1);
INSERT INTO `testResults` VALUES(473, 'W4231', 60, 7, 0);
INSERT INTO `testResults` VALUES(474, 'W4231', 60, 11, 0);
INSERT INTO `testResults` VALUES(475, 'W4231', 60, 28, 0);
INSERT INTO `testResults` VALUES(476, 'W4231', 60, 30, 0);
INSERT INTO `testResults` VALUES(477, 'W4231', 60, 34, 0);
INSERT INTO `testResults` VALUES(478, 'W4231', 60, 37, 0);
INSERT INTO `testResults` VALUES(479, 'G6233', 61, 27, 1);
INSERT INTO `testResults` VALUES(480, 'G6233', 61, 39, 1);
INSERT INTO `testResults` VALUES(481, 'G6233', 61, 41, 0);
INSERT INTO `testResults` VALUES(482, 'G6233', 61, 43, 1);
INSERT INTO `testResults` VALUES(483, 'G6152', 61, 27, 1);
INSERT INTO `testResults` VALUES(484, 'G6152', 61, 39, 1);
INSERT INTO `testResults` VALUES(485, 'G6152', 61, 41, 1);
INSERT INTO `testResults` VALUES(486, 'G6152', 61, 43, 1);
INSERT INTO `testResults` VALUES(487, 'G5688', 62, 12, 1);
INSERT INTO `testResults` VALUES(488, 'G5688', 62, 25, 1);
INSERT INTO `testResults` VALUES(489, 'G5688', 62, 26, 0);
INSERT INTO `testResults` VALUES(490, 'G5688', 62, 27, 1);
INSERT INTO `testResults` VALUES(491, 'G5688', 62, 28, 0);
INSERT INTO `testResults` VALUES(492, 'G5688', 62, 33, 1);
INSERT INTO `testResults` VALUES(493, 'G5688', 62, 34, 1);
INSERT INTO `testResults` VALUES(494, 'G5688', 62, 35, 1);
INSERT INTO `testResults` VALUES(495, 'G5688', 62, 39, 0);
INSERT INTO `testResults` VALUES(496, 'G5688', 62, 40, 0);
INSERT INTO `testResults` VALUES(497, 'G5688', 62, 43, 0);
INSERT INTO `testResults` VALUES(498, 'G5688', 62, 47, 0);
INSERT INTO `testResults` VALUES(499, 'W3389', 64, 2, 1);
INSERT INTO `testResults` VALUES(500, 'W3389', 64, 23, 1);
INSERT INTO `testResults` VALUES(501, 'W3389', 64, 26, 1);
INSERT INTO `testResults` VALUES(502, 'W3389', 64, 28, 1);
INSERT INTO `testResults` VALUES(503, 'W3389', 64, 29, 0);
INSERT INTO `testResults` VALUES(504, 'W3389', 64, 30, 1);
INSERT INTO `testResults` VALUES(505, 'W3389', 64, 34, 1);
INSERT INTO `testResults` VALUES(506, 'W3259', 64, 2, 0);
INSERT INTO `testResults` VALUES(507, 'W3259', 64, 23, 0);
INSERT INTO `testResults` VALUES(508, 'W3259', 64, 26, 1);
INSERT INTO `testResults` VALUES(509, 'W3259', 64, 28, 0);
INSERT INTO `testResults` VALUES(510, 'W3259', 64, 29, 0);
INSERT INTO `testResults` VALUES(511, 'W3259', 64, 30, 1);
INSERT INTO `testResults` VALUES(512, 'W3259', 64, 34, 0);
INSERT INTO `testResults` VALUES(513, 'W3523', 65, 1, 0);
INSERT INTO `testResults` VALUES(514, 'W3523', 65, 8, 0);
INSERT INTO `testResults` VALUES(515, 'W3523', 65, 10, 0);
INSERT INTO `testResults` VALUES(516, 'W3523', 65, 11, 0);
INSERT INTO `testResults` VALUES(517, 'W3523', 65, 13, 0);
INSERT INTO `testResults` VALUES(518, 'W3523', 66, 1, 1);
INSERT INTO `testResults` VALUES(519, 'W3523', 66, 8, 0);
INSERT INTO `testResults` VALUES(520, 'W3523', 66, 10, 0);
INSERT INTO `testResults` VALUES(521, 'W3523', 66, 11, 0);
INSERT INTO `testResults` VALUES(522, 'W3523', 66, 13, 0);
INSERT INTO `testResults` VALUES(523, 'W3523', 66, 23, 1);
INSERT INTO `testResults` VALUES(524, 'U3411', 67, 5, 1);
INSERT INTO `testResults` VALUES(525, 'U3411', 67, 14, 1);
INSERT INTO `testResults` VALUES(526, 'U3411', 67, 24, 1);
INSERT INTO `testResults` VALUES(527, 'W8798', 67, 5, 1);
INSERT INTO `testResults` VALUES(528, 'W8798', 67, 14, 0);
INSERT INTO `testResults` VALUES(529, 'W8798', 67, 24, 1);
INSERT INTO `testResults` VALUES(530, 'W6129', 67, 5, 1);
INSERT INTO `testResults` VALUES(531, 'W6129', 67, 14, 1);
INSERT INTO `testResults` VALUES(532, 'W6129', 67, 24, 1);
INSERT INTO `testResults` VALUES(533, 'W5344', 67, 5, 0);
INSERT INTO `testResults` VALUES(534, 'W5344', 67, 14, 1);
INSERT INTO `testResults` VALUES(535, 'W5344', 67, 24, 0);
INSERT INTO `testResults` VALUES(565, 'bewta', 73, 17, 0);
INSERT INTO `testResults` VALUES(564, 'beta', 72, 14, 0);
INSERT INTO `testResults` VALUES(563, 'beta', 72, 14, 1);
INSERT INTO `testResults` VALUES(562, 'beta', 72, 14, 0);
INSERT INTO `testResults` VALUES(561, 'beta', 72, 14, 0);
INSERT INTO `testResults` VALUES(560, 'beta', 72, 14, 1);
INSERT INTO `testResults` VALUES(559, 'beta', 72, 14, 0);
INSERT INTO `testResults` VALUES(558, 'beta', 72, 14, 0);
INSERT INTO `testResults` VALUES(557, 'beta', 71, 41, 0);
INSERT INTO `testResults` VALUES(556, 'beta', 71, 41, 0);
INSERT INTO `testResults` VALUES(555, 'beta', 71, 41, 0);
INSERT INTO `testResults` VALUES(554, 'beta', 71, 41, 0);
INSERT INTO `testResults` VALUES(553, 'beta', 71, 41, 0);
INSERT INTO `testResults` VALUES(552, 'beta', 68, 33, 1);
INSERT INTO `testResults` VALUES(551, 'beta', 68, 33, 1);
INSERT INTO `testResults` VALUES(566, 'beta', 74, 26, 0);
INSERT INTO `testResults` VALUES(567, 'beta', 74, 27, 0);
INSERT INTO `testResults` VALUES(568, 'betab', 83, 1, 1);
INSERT INTO `testResults` VALUES(569, 'betab', 83, 2, 0);
INSERT INTO `testResults` VALUES(570, 'betab', 83, 3, 1);
INSERT INTO `testResults` VALUES(571, 'betab', 83, 4, 1);
INSERT INTO `testResults` VALUES(572, 'betab', 83, 6, 0);
INSERT INTO `testResults` VALUES(573, 'betab', 83, 7, 0);
INSERT INTO `testResults` VALUES(574, 'betab', 83, 8, 1);
INSERT INTO `testResults` VALUES(575, 'betab', 83, 9, 0);
INSERT INTO `testResults` VALUES(576, 'betab', 83, 10, 1);
INSERT INTO `testResults` VALUES(577, 'betab', 83, 11, 0);
INSERT INTO `testResults` VALUES(578, 'betab', 83, 12, 1);
INSERT INTO `testResults` VALUES(579, 'betab', 83, 13, 0);
INSERT INTO `testResults` VALUES(580, 'betab', 83, 17, 0);
INSERT INTO `testResults` VALUES(581, 'betab', 83, 23, 0);
INSERT INTO `testResults` VALUES(582, 'betab', 83, 25, 0);
INSERT INTO `testResults` VALUES(583, 'betab', 83, 26, 0);
INSERT INTO `testResults` VALUES(584, 'betab', 83, 27, 0);
INSERT INTO `testResults` VALUES(585, 'betab', 83, 28, 0);
INSERT INTO `testResults` VALUES(586, 'betab', 83, 29, 1);
INSERT INTO `testResults` VALUES(587, 'betab', 83, 30, 1);
INSERT INTO `testResults` VALUES(588, 'betab', 83, 32, 1);
INSERT INTO `testResults` VALUES(589, 'betab', 83, 33, 0);
INSERT INTO `testResults` VALUES(590, 'betab', 83, 34, 1);
INSERT INTO `testResults` VALUES(591, 'betab', 83, 35, 1);
INSERT INTO `testResults` VALUES(592, 'betab', 83, 36, 1);
INSERT INTO `testResults` VALUES(593, 'betab', 83, 37, 1);
INSERT INTO `testResults` VALUES(594, 'betab', 83, 38, 0);
INSERT INTO `testResults` VALUES(595, 'betab', 83, 39, 0);
INSERT INTO `testResults` VALUES(596, 'betab', 83, 40, 1);
INSERT INTO `testResults` VALUES(597, 'betab', 83, 41, 1);
INSERT INTO `testResults` VALUES(598, 'betab', 83, 42, 1);
INSERT INTO `testResults` VALUES(599, 'betab', 83, 43, 0);
INSERT INTO `testResults` VALUES(600, 'betab', 83, 44, 1);
INSERT INTO `testResults` VALUES(601, 'betab', 83, 45, 0);
INSERT INTO `testResults` VALUES(602, 'betab', 83, 46, 0);
INSERT INTO `testResults` VALUES(603, 'betab', 83, 47, 0);
INSERT INTO `testResults` VALUES(604, 'betab', 83, 48, 0);
INSERT INTO `testResults` VALUES(605, 'betab', 83, 50, 0);
INSERT INTO `testResults` VALUES(606, 'betab', 83, 51, 0);
INSERT INTO `testResults` VALUES(607, 'betab', 83, 52, 1);
INSERT INTO `testResults` VALUES(608, 'betab', 83, 53, 1);
INSERT INTO `testResults` VALUES(609, 'betab', 83, 54, 1);
INSERT INTO `testResults` VALUES(610, 'betab', 83, 55, 0);
INSERT INTO `testResults` VALUES(611, 'betab', 83, 56, 1);
INSERT INTO `testResults` VALUES(612, 'betab', 83, 57, 1);
INSERT INTO `testResults` VALUES(613, 'betab', 83, 58, 1);
INSERT INTO `testResults` VALUES(614, 'betab', 83, 59, 1);
INSERT INTO `testResults` VALUES(615, 'betab', 83, 60, 0);
INSERT INTO `testResults` VALUES(616, 'betab', 83, 61, 1);
INSERT INTO `testResults` VALUES(617, 'betab', 83, 62, 1);
INSERT INTO `testResults` VALUES(618, 'betab', 83, 63, 1);
INSERT INTO `testResults` VALUES(619, 'betab', 83, 64, 1);
INSERT INTO `testResults` VALUES(620, 'betab', 83, 65, 1);
INSERT INTO `testResults` VALUES(621, 'betab', 83, 66, 1);
INSERT INTO `testResults` VALUES(622, 'betab', 83, 76, 0);
INSERT INTO `testResults` VALUES(623, 'betab', 83, 77, 1);
INSERT INTO `testResults` VALUES(624, 'betab', 83, 78, 1);
INSERT INTO `testResults` VALUES(625, 'betab', 83, 79, 0);
INSERT INTO `testResults` VALUES(626, 'betab', 83, 81, 0);
INSERT INTO `testResults` VALUES(627, 'betab', 83, 82, 0);
INSERT INTO `testResults` VALUES(628, 'betab', 83, 83, 1);
INSERT INTO `testResults` VALUES(629, 'betab', 83, 84, 1);
INSERT INTO `testResults` VALUES(630, 'betab', 83, 85, 1);
INSERT INTO `testResults` VALUES(631, 'betab', 83, 86, 1);
INSERT INTO `testResults` VALUES(632, 'betab', 83, 87, 1);
INSERT INTO `testResults` VALUES(633, 'betab', 83, 88, 0);
INSERT INTO `testResults` VALUES(634, 'betab', 83, 89, 0);
INSERT INTO `testResults` VALUES(635, 'betab', 83, 90, 1);
INSERT INTO `testResults` VALUES(636, 'betab', 83, 91, 0);
INSERT INTO `testResults` VALUES(637, 'betab', 83, 92, 0);
INSERT INTO `testResults` VALUES(638, 'betab', 83, 93, 1);
INSERT INTO `testResults` VALUES(639, 'betab', 83, 94, 1);
INSERT INTO `testResults` VALUES(640, 'betab', 83, 95, 0);
INSERT INTO `testResults` VALUES(641, 'betab', 83, 96, 1);
INSERT INTO `testResults` VALUES(642, 'betab', 83, 97, 0);
INSERT INTO `testResults` VALUES(643, 'betab', 83, 98, 1);
INSERT INTO `testResults` VALUES(644, 'betab', 83, 99, 1);
INSERT INTO `testResults` VALUES(645, 'betab', 83, 100, 0);
INSERT INTO `testResults` VALUES(646, 'betab', 83, 101, 0);
INSERT INTO `testResults` VALUES(647, 'betab', 83, 102, 0);
INSERT INTO `testResults` VALUES(648, 'betab', 83, 103, 1);
INSERT INTO `testResults` VALUES(649, 'betab', 83, 104, 0);
INSERT INTO `testResults` VALUES(650, 'betab', 83, 105, 1);
INSERT INTO `testResults` VALUES(651, 'betab', 83, 107, 1);
INSERT INTO `testResults` VALUES(652, 'betab', 83, 108, 1);
INSERT INTO `testResults` VALUES(653, 'betab', 83, 109, 1);
INSERT INTO `testResults` VALUES(654, 'betab', 83, 110, 1);
INSERT INTO `testResults` VALUES(655, 'betab', 83, 111, 1);
INSERT INTO `testResults` VALUES(656, 'betab', 83, 112, 0);
INSERT INTO `testResults` VALUES(657, 'betab', 83, 113, 1);
INSERT INTO `testResults` VALUES(658, 'betab', 83, 114, 1);
INSERT INTO `testResults` VALUES(659, 'betab', 83, 115, 1);
INSERT INTO `testResults` VALUES(660, 'betab', 83, 120, 1);
INSERT INTO `testResults` VALUES(661, 'betab', 83, 121, 0);
INSERT INTO `testResults` VALUES(662, 'betab', 83, 124, 1);
INSERT INTO `testResults` VALUES(663, 'betab', 83, 132, 0);
INSERT INTO `testResults` VALUES(664, 'betab', 83, 135, 0);
INSERT INTO `testResults` VALUES(665, 'betab', 83, 138, 1);
INSERT INTO `testResults` VALUES(666, 'betab', 83, 141, 1);
INSERT INTO `testResults` VALUES(667, 'betab', 83, 142, 1);
INSERT INTO `testResults` VALUES(668, 'T8987', 85, 25, 1);
INSERT INTO `testResults` VALUES(669, 'T8987', 85, 28, 0);
INSERT INTO `testResults` VALUES(670, 'G7057', 89, 269, 1);
INSERT INTO `testResults` VALUES(671, 'G7057', 89, 270, 1);
INSERT INTO `testResults` VALUES(672, 'G7057', 89, 274, 1);

-- --------------------------------------------------------

--
-- Table structure for table `test_info`
--

CREATE TABLE `test_info` (
  `testID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `modelID` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`testID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `test_info`
--


-- --------------------------------------------------------

--
-- Table structure for table `test_model`
--

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
  `pneum` int(10) unsigned NOT NULL,
  `powerplant` int(10) unsigned NOT NULL,
  `pressurization` int(10) unsigned NOT NULL,
  `profiles` int(10) unsigned NOT NULL,
  `radar` int(10) unsigned NOT NULL,
  `stall_prot` int(10) unsigned NOT NULL,
  `mandatory` int(10) unsigned NOT NULL,
  PRIMARY KEY (`testID`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=77 ;

--
-- Dumping data for table `test_model`
--

INSERT INTO `test_model` VALUES(76, 'SY9', 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `usedQuestions`
--

CREATE TABLE `usedQuestions` (
  `genTestID` int(10) unsigned NOT NULL,
  `questionID` int(10) unsigned NOT NULL,
  `type` char(10) NOT NULL,
  `subcategory` char(25) NOT NULL,
  `questionText` char(255) NOT NULL,
  `a` char(255) NOT NULL,
  `b` char(255) NOT NULL,
  `c` char(255) DEFAULT NULL,
  `d` char(255) DEFAULT NULL,
  `answerKey` char(10) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `usedQuestions`
--

INSERT INTO `usedQuestions` VALUES(46, 1, 'tf', 'elec', 'The emergency light system will never activate when the emergency light switch is in the "OFF" position.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(46, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'Ground power is available to supply power to the electrical system.', 'The aircraft electrical system is powered.', 'The ground air supply is supplying bleed air to the packs.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(46, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'All electrical busses except the shed busses.', 'DC bus 1 and DC bus 2', 'The hot battery busses, essential busses, and the central DC bus.', 'The entire electrical system.', 'c');
INSERT INTO `usedQuestions` VALUES(46, 17, 'c2', 'elec', 'The APU can be started using:', 'Battery 2.', 'Battery 1.', 'The GPU (with batteries in AUTO)', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(46, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR (no DME) can be flown using the RMU navigation page', 'VOR approaches are impossible since the PFD is blank.', 'The FMS remains powered.', 'b');
INSERT INTO `usedQuestions` VALUES(47, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The ground air supply is supplying bleed air to the packs.', 'The aircraft electrical system is powered.', 'Ground power is available to supply power to the electrical system.', 'The ground power unit is disconnected from the aircraft.', 'c');
INSERT INTO `usedQuestions` VALUES(47, 17, 'c2', 'elec', 'The APU can be started using:', 'Battery 2.', 'The GPU (with batteries in AUTO)', 'Battery 1.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(47, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'The entire electrical system.', 'All electrical busses except the shed busses.', 'DC bus 1 and DC bus 2', 'The hot battery busses, essential busses, and the central DC bus.', 'd');
INSERT INTO `usedQuestions` VALUES(47, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'The FMS remains powered.', 'VOR approaches are impossible since the PFD is blank.', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR (no DME) can be flown using the RMU navigation page', 'd');
INSERT INTO `usedQuestions` VALUES(47, 9, 'mc', 'elec', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:', 'Starter/Generator', 'Manual controls', 'FADEC', 'EICAS', 'c');
INSERT INTO `usedQuestions` VALUES(48, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '54 C', '70 C', '40 C', '-20 C', 'd');
INSERT INTO `usedQuestions` VALUES(48, 4, 'mc', 'crew_awareness', 'If symbol generator 1 fails:', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'PFD1 and MFD1 go blank.', 'RMU 1 automatically displays Engine Page 1', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(48, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'The cross-side AHRS automatically takes over.', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'Airspeed will be covered with hash marks', 'ATT FAIL appears on the EADI on the PFD.', 'd');
INSERT INTO `usedQuestions` VALUES(48, 11, 'mc', 'elec', 'Which components are energized in essential power configuration?', 'All electrical busses except the shed busses.', 'The hot battery busses, essential busses, and the central DC bus.', 'DC bus 1 and DC bus 2', 'The entire electrical system.', 'b');
INSERT INTO `usedQuestions` VALUES(48, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'VOR (no DME) can be flown using the RMU navigation page', 'The FMS remains powered.', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR approaches are impossible since the PFD is blank.', 'a');
INSERT INTO `usedQuestions` VALUES(49, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air leaving the compressor is too hot.', 'The air entering the pack is too hot.', 'The pressure of air entering the pack is too high.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(49, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air leaving the pack is too hot.', 'The air entering the pack is too hot.', 'The air leaving the compressor is too hot.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(50, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs turn off.', 'Pack 1 turns off.', 'Both packs stay on.', 'Pack 2 turns off.', 'a');
INSERT INTO `usedQuestions` VALUES(50, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air entering the pack is too hot.', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(50, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air entering the compressor is too hot.', 'The air leaving the pack is too hot.', 'The air entering the pack is too hot.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(50, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Baggage compartment door.', 'Forward nose hydraulic compartment.', 'Overwing emergency exit.', 'Under cockpit access hatch.', 'd');
INSERT INTO `usedQuestions` VALUES(50, 9, 'mc', 'apu', 'The APU (Model T-62T-40C14) is controlled by a(n):', 'EICAS', 'Starter/Generator', 'Manual controls', 'FADEC', 'd');
INSERT INTO `usedQuestions` VALUES(50, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '40 C', '-20 C', '70 C', '54 C', 'b');
INSERT INTO `usedQuestions` VALUES(50, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'Immediately at all times.', 'After 10 seconds on the ground.', 'AFter 10 seconds on the ground, immediately in flight.', 'Immediately in flight.', 'b');
INSERT INTO `usedQuestions` VALUES(50, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '200 Amps.', '300 Amps.', '400 Amps.', '500 Amps.', 'b');
INSERT INTO `usedQuestions` VALUES(51, 25, 'mc', 'air_condition', 'At 2000 AGL in CLB thrust mode, icing conditions, both packs selected ON:', 'Pack 2 is on, 1 is off.', 'Pack 1 is on, 2 is off.', 'Both packs are on.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(51, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air entering the pack is too hot.', 'The air leaving the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'b');
INSERT INTO `usedQuestions` VALUES(51, 27, 'c2', 'air_condition', 'What is a pack overload?', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', 'The air entering the pack is too hot.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(51, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '160 % of the length of an EMB-135.', '89 feet in length.', '98 feet in length.', '110 feet in length.', 'c');
INSERT INTO `usedQuestions` VALUES(51, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '40 C', '-20 C', '70 C', '54 C', 'b');
INSERT INTO `usedQuestions` VALUES(51, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the FUEL SHUTOFF button.', 'Turn the master knob to OFF.', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'c');
INSERT INTO `usedQuestions` VALUES(51, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '400 Amps.', '200 Amps.', '500 Amps.', '300 Amps.', 'd');
INSERT INTO `usedQuestions` VALUES(51, 17, 'c2', 'apu', 'The APU can be started using:', 'Battery 2.', 'Battery 1.', 'The GPU (with batteries in AUTO)', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(51, 9, 'mc', 'apu', 'The APU (Model T-62T-40C14) is controlled by a(n):', 'FADEC', 'EICAS', 'Starter/Generator', 'Manual controls', 'a');
INSERT INTO `usedQuestions` VALUES(51, 45, 'mc', 'autopilot', 'When low bank is NOT selected, what is the maximum bank the autopilot will use for any lateral mode?', '27 degrees.', '14 degrees.', '13 degrees.', '10 degrees.', 'a');
INSERT INTO `usedQuestions` VALUES(51, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 9).', '13 degrees pitch up attitude (Flaps 18).', '14 degrees pitch up attitude (Flaps 18).', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(52, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air leaving the compressor is too hot.', 'The air leaving the pack is too hot.', 'The air entering the pack is too hot.', 'The air entering the compressor is too hot.', 'b');
INSERT INTO `usedQuestions` VALUES(52, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Pack 1 turns off.', 'Both packs turn off.', 'Pack 2 turns off.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(52, 25, 'mc', 'air_condition', 'While flying in icing conditions at 2000 AGL in CLB thrust with packs selected ON:', 'Pack 1 is on, 2 is off.', 'Both packs are off.', 'Both packs are on.', 'Pack 2 is on, 1 is off.', 'd');
INSERT INTO `usedQuestions` VALUES(52, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '110 feet in length.', '89 feet in length.', '98 feet in length.', '160 % of the length of an EMB-135.', 'c');
INSERT INTO `usedQuestions` VALUES(52, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'Immediately at all times.', 'AFter 10 seconds on the ground, immediately in flight.', 'After 10 seconds on the ground.', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(52, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '-20 C', '40 C', '70 C', '54 C', 'a');
INSERT INTO `usedQuestions` VALUES(52, 9, 'mc', 'apu', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:', 'Manual controls', 'FADEC', 'Starter/Generator', 'EICAS', 'b');
INSERT INTO `usedQuestions` VALUES(52, 17, 'c2', 'apu', 'The APU can be started using:', 'Battery 2.', 'Battery 1.', 'The GPU (with batteries in AUTO)', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(52, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '23.5V', '19.0V', '20.0V', '24.0V', 'b');
INSERT INTO `usedQuestions` VALUES(52, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'VS mode but with preset vertical speeds', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'SPD mode but with preset speeds.', 'b');
INSERT INTO `usedQuestions` VALUES(52, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 9).', '13 degrees pitch up attitude (Flaps 18).', '14 degrees pitch up attitude (Flaps 18).', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(52, 42, 'c2', 'autopilot', 'Which of these are vertical flight guidance modes?', 'PIT', 'FLC', 'ROL', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(52, 45, 'mc', 'autopilot', 'Full bank is equal to ___: ?', '27 degrees.', '14 degrees.', '10 degrees.', '13 degrees.', 'a');
INSERT INTO `usedQuestions` VALUES(52, 37, 'mc', 'autopilot', 'What is the minimum engagement height for the autopilot (feet)?', '1000', '800', '500', '200', 'c');
INSERT INTO `usedQuestions` VALUES(52, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'The cross-side AHRS automatically takes over.', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'Airspeed will be covered with hash marks', 'ATT FAIL appears on the EADI on the PFD.', 'd');
INSERT INTO `usedQuestions` VALUES(52, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'Engine #1 indications are replaced with amber dashes', 'The FADEC syncs N2 to N1.', 'DAU 1B automatically takes over.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(52, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'VOR approaches are impossible since the PFD is blank.', 'The FMS remains powered.', 'VOR (no DME) can be flown using the RMU navigation page', 'FOR-DME approaches can be flown using the standby instruments.', 'c');
INSERT INTO `usedQuestions` VALUES(52, 11, 'mc', 'elec', 'Which components are energized in essential power configuration?', 'All electrical busses except the shed busses.', 'The hot battery busses, essential busses, and the central DC bus.', 'DC bus 1 and DC bus 2', 'The entire electrical system.', 'b');
INSERT INTO `usedQuestions` VALUES(52, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'Ground power is available to supply power to the electrical system.', 'The aircraft electrical system is powered.', 'The ground air supply is supplying bleed air to the packs.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(53, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air leaving the compressor is too hot.', 'The air entering the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the pack is too hot.', 'd');
INSERT INTO `usedQuestions` VALUES(53, 25, 'mc', 'air_condition', 'While flying in icing conditions at 2000 AGL in CLB thrust with packs selected ON:', 'Both packs are off.', 'Both packs are on.', 'Pack 2 is on, 1 is off.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(53, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs stay on.', 'Pack 2 turns off.', 'Both packs turn off.', 'Pack 1 turns off.', 'c');
INSERT INTO `usedQuestions` VALUES(53, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Overwing emergency exit.', 'Baggage compartment door.', 'Forward nose hydraulic compartment.', 'Under cockpit access hatch.', 'd');
INSERT INTO `usedQuestions` VALUES(53, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '89 feet in length.', '160 % of the length of an EMB-135.', '110 feet in length.', '98 feet in length.', 'd');
INSERT INTO `usedQuestions` VALUES(53, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '54 C', '40 C', '-20 C', '70 C', 'c');
INSERT INTO `usedQuestions` VALUES(53, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'After 10 seconds on the ground.', 'Immediately at all times.', 'Immediately in flight.', 'AFter 10 seconds on the ground, immediately in flight.', 'a');
INSERT INTO `usedQuestions` VALUES(53, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '24.0V', '23.5V', '19.0V', '20.0V', 'c');
INSERT INTO `usedQuestions` VALUES(53, 9, 'mc', 'apu', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:', 'FADEC', 'EICAS', 'Starter/Generator', 'Manual controls', 'a');
INSERT INTO `usedQuestions` VALUES(53, 17, 'c2', 'apu', 'The APU can be started using:', 'Battery 1.', 'Battery 2.', 'The GPU (with batteries in AUTO)', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(53, 46, 'mc', 'autopilot', 'What button on the flight guidance control panel would you push to navigate using the FMS?', 'HDG, then FMS.', 'HDG', 'NAV', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(53, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'VS mode but with preset vertical speeds', 'SPD mode but with preset speeds.', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'a');
INSERT INTO `usedQuestions` VALUES(53, 42, 'c2', 'autopilot', 'Which of these are vertical flight guidance modes?', 'PIT', 'ROL', 'FLC', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(53, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 18).', '14 degrees pitch up attitude (Flaps 9).', '13 degrees pitch up attitude (Flaps 18).', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(53, 39, 'mc', 'autopilot', 'What change should be observed on the FMA after clicking the TOGA buttons on the ground?', 'The thrust rating changes to full thrust.', 'GA mode is activated on the flight director.', 'TO mode is activated on the flight director.', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'c');
INSERT INTO `usedQuestions` VALUES(53, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'The FADEC syncs N2 to N1.', 'DAU 1B automatically takes over.', 'Engine #1 indications are replaced with amber dashes', 'Aft aircraft systems information is unavailable.', 'c');
INSERT INTO `usedQuestions` VALUES(53, 3, 'mc', 'crew_awareness', 'Which one of these will not give you a takeoff configuration warning?', 'Pitch trim set to 0 degrees.', 'Parking brake set.', 'Flaps 0.', 'One or both enginges not running.', 'd');
INSERT INTO `usedQuestions` VALUES(53, 4, 'mc', 'crew_awareness', 'Which event is specific to a symbol generator 1 failure?', 'PFD1 and MFD1 go blank.', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'RMU 1 automatically displays Engine Page 1', 'd');
INSERT INTO `usedQuestions` VALUES(53, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'The cross-side AHRS automatically takes over.', 'ATT FAIL appears on the EADI on the PFD.', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'Airspeed will be covered with hash marks', 'b');
INSERT INTO `usedQuestions` VALUES(54, 25, 'mc', 'air_condition', 'While flying in icing conditions at 2000 AGL in CLB thrust with packs selected ON:', 'Both packs are off.', 'Both packs are on.', 'Pack 1 is on, 2 is off.', 'Pack 2 is on, 1 is off.', 'd');
INSERT INTO `usedQuestions` VALUES(54, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs stay on.', 'Both packs turn off.', 'Pack 2 turns off.', 'Pack 1 turns off.', 'b');
INSERT INTO `usedQuestions` VALUES(54, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air leaving the pack is too hot.', 'The air entering the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'a');
INSERT INTO `usedQuestions` VALUES(54, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', 'The air entering the pack is too hot.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(54, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '89 feet in length.', '98 feet in length.', '110 feet in length.', '160 % of the length of an EMB-135.', 'b');
INSERT INTO `usedQuestions` VALUES(54, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Forward nose hydraulic compartment.', 'Under cockpit access hatch.', 'Overwing emergency exit.', 'Baggage compartment door.', 'b');
INSERT INTO `usedQuestions` VALUES(54, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'Immediately in flight.', 'Immediately at all times.', 'After 10 seconds on the ground.', 'AFter 10 seconds on the ground, immediately in flight.', 'c');
INSERT INTO `usedQuestions` VALUES(54, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '400 Amps.', '300 Amps.', '500 Amps.', '200 Amps.', 'b');
INSERT INTO `usedQuestions` VALUES(54, 9, 'mc', 'apu', 'The APU (Model T-62T-40C14) is controlled by a(n):', 'FADEC', 'Manual controls', 'EICAS', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(54, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Press the FUEL SHUTOFF button.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'Turn the master knob to OFF.', 'a');
INSERT INTO `usedQuestions` VALUES(54, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '19.0V', '23.5V', '24.0V', '20.0V', 'a');
INSERT INTO `usedQuestions` VALUES(54, 42, 'c2', 'autopilot', 'Which of these are vertical flight guidance modes?', 'PIT', 'ROL', 'FLC', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(54, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'SPD mode but with preset speeds.', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS mode but with preset vertical speeds', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'c');
INSERT INTO `usedQuestions` VALUES(54, 45, 'mc', 'autopilot', 'Full bank is equal to ___: ?', '14 degrees.', '10 degrees.', '13 degrees.', '27 degrees.', 'd');
INSERT INTO `usedQuestions` VALUES(54, 44, 'mc', 'autopilot', 'When selected, low bank is equal to ____ : ?', '13 degrees above FL250.', '27 degrees.', '10 degrees.', '14 degrees.', 'd');
INSERT INTO `usedQuestions` VALUES(54, 36, 'mc', 'autopilot', 'At what altitude must the autopilot be disengaged on a CAT I ILS approach?', '200'' AGL.', '1500'' AGL.', '1000'' AGL.', '500'' AGL.', 'a');
INSERT INTO `usedQuestions` VALUES(54, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'Engine #1 indications are replaced with amber dashes', 'DAU 1B automatically takes over.', 'Aft aircraft systems information is unavailable.', 'The FADEC syncs N2 to N1.', 'a');
INSERT INTO `usedQuestions` VALUES(54, 4, 'mc', 'crew_awareness', 'Which event is specific to a symbol generator 1 failure?', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'PFD1 and MFD1 go blank.', 'RMU 1 automatically displays Engine Page 1', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(54, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'ATT FAIL appears on the EADI on the PFD.', 'The cross-side AHRS automatically takes over.', 'Airspeed will be covered with hash marks', 'b');
INSERT INTO `usedQuestions` VALUES(54, 3, 'mc', 'crew_awareness', 'Which one of these will not give you a takeoff configuration warning?', 'Pitch trim set to 0 degrees.', 'Parking brake set.', 'One or both enginges not running.', 'Flaps 0.', 'c');
INSERT INTO `usedQuestions` VALUES(54, 13, 'mc', 'elec', 'What items are available in essential power?', 'SG2, DAU2B', 'FMS1, DAU1B, DAU2B', 'FMS, PFD and MFDs.', 'RMU1, RMU2, EICAS and standby instruments.', 'd');
INSERT INTO `usedQuestions` VALUES(54, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'All electrical busses except the shed busses.', 'DC bus 1 and DC bus 2', 'The hot battery busses, essential busses, and the central DC bus.', 'The entire electrical system.', 'c');
INSERT INTO `usedQuestions` VALUES(54, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'The FMS remains powered.', 'VOR (no DME) can be flown using the RMU navigation page', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR approaches are impossible since the PFD is blank.', 'b');
INSERT INTO `usedQuestions` VALUES(54, 1, 'tf', 'elec', 'The emergency light system will never activate when the emergency light switch is in the "OFF" position.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(54, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The ground power unit is disconnected from the aircraft.', 'The aircraft electrical system is powered.', 'The ground air supply is supplying bleed air to the packs.', 'Ground power is available to supply power to the electrical system.', 'd');
INSERT INTO `usedQuestions` VALUES(55, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '160 % of the length of an EMB-135.', '89 feet in length.', '98 feet in length.', '110 feet in length.', 'c');
INSERT INTO `usedQuestions` VALUES(55, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Overwing emergency exit.', 'Baggage compartment door.', 'Forward nose hydraulic compartment.', 'Under cockpit access hatch.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air entering the compressor is too hot.', 'The air leaving the pack is too hot.', 'The air entering the pack is too hot.', 'The air leaving the compressor is too hot.', 'b');
INSERT INTO `usedQuestions` VALUES(56, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Pack 2 turns off.', 'Pack 1 turns off.', 'Both packs stay on.', 'Both packs turn off.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air entering the pack is too hot.', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 25, 'mc', 'air_condition', 'At 2000 AGL in CLB thrust mode, icing conditions, both packs selected ON:', 'Pack 1 is on, 2 is off.', 'Both packs are on.', 'Both packs are off.', 'Pack 2 is on, 1 is off.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Forward nose hydraulic compartment.', 'Baggage compartment door.', 'Overwing emergency exit.', 'Under cockpit access hatch.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 30, 'mc', 'acft_gen', 'An EMB-145 XR is approximately...', '160 % of the length of an EMB-135.', '89 feet in length.', '110 feet in length.', '98 feet in length.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'Turn the master knob to OFF.', 'Press the FUEL SHUTOFF button.', 'a');
INSERT INTO `usedQuestions` VALUES(56, 35, 'mc', 'apu', 'The APU''s logic commands an automatic shutdown for which of the following conditions in flight?', 'Fire.', 'Overspeed.', 'Overtemperature.', 'High oil temperature.', 'b');
INSERT INTO `usedQuestions` VALUES(56, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '54 C', '-20 C', '70 C', '40 C', 'b');
INSERT INTO `usedQuestions` VALUES(56, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '20.0V', '19.0V', '24.0V', '23.5V', 'b');
INSERT INTO `usedQuestions` VALUES(56, 17, 'c2', 'apu', 'The APU can be started using:', 'Battery 1.', 'Battery 2.', 'The GPU (with batteries in AUTO)', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS mode but with preset vertical speeds', 'SPD mode but with preset speeds.', 'c');
INSERT INTO `usedQuestions` VALUES(56, 39, 'mc', 'autopilot', 'What change should be observed on the FMA after clicking the TOGA buttons on the ground?', 'GA mode is activated on the flight director.', 'TO mode is activated on the flight director.', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'The thrust rating changes to full thrust.', 'b');
INSERT INTO `usedQuestions` VALUES(56, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 9).', '14 degrees pitch up attitude (Flaps 18).', '13 degrees pitch up attitude (Flaps 18).', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 45, 'mc', 'autopilot', 'Full bank is equal to ___: ?', '13 degrees.', '10 degrees.', '14 degrees.', '27 degrees.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 40, 'mc', 'autopilot', 'The aircraft heading must be within ___ degrees of the final approach course (front course) prior to selecting the APR or NAV mode.', '45', '100', '70', '90', 'd');
INSERT INTO `usedQuestions` VALUES(56, 3, 'mc', 'crew_awareness', 'Which one of these will not give you a takeoff configuration warning?', 'Parking brake set.', 'Pitch trim set to 0 degrees.', 'Flaps 0.', 'One or both enginges not running.', 'd');
INSERT INTO `usedQuestions` VALUES(56, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'DAU 1B automatically takes over.', 'The FADEC syncs N2 to N1.', 'Engine #1 indications are replaced with amber dashes', 'Aft aircraft systems information is unavailable.', 'c');
INSERT INTO `usedQuestions` VALUES(56, 4, 'mc', 'crew_awareness', 'If symbol generator 1 fails:', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'RMU 1 automatically displays Engine Page 1', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'PFD1 and MFD1 go blank.', 'b');
INSERT INTO `usedQuestions` VALUES(56, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'ATT FAIL appears on the EADI on the PFD.', 'The cross-side AHRS automatically takes over.', 'Airspeed will be covered with hash marks', 'b');
INSERT INTO `usedQuestions` VALUES(56, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'VOR approaches are impossible since the PFD is blank.', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR (no DME) can be flown using the RMU navigation page', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(56, 1, 'tf', 'elec', 'The emergency light system will never activate when the emergency light switch is in the "OFF" position.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(56, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'The entire electrical system.', 'The hot battery busses, essential busses, and the central DC bus.', 'DC bus 1 and DC bus 2', 'All electrical busses except the shed busses.', 'b');
INSERT INTO `usedQuestions` VALUES(56, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The ground air supply is supplying bleed air to the packs.', 'Ground power is available to supply power to the electrical system.', 'The aircraft electrical system is powered.', 'The ground power unit is disconnected from the aircraft.', 'b');
INSERT INTO `usedQuestions` VALUES(56, 13, 'mc', 'elec', 'What items are available in essential power?', 'RMU1, RMU2, EICAS and standby instruments.', 'SG2, DAU2B', 'FMS1, DAU1B, DAU2B', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(57, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air entering the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'The air leaving the pack is too hot.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air leaving the compressor is too hot.', 'The air entering the pack is too hot.', 'The pressure of air entering the pack is too high.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs turn off.', 'Pack 1 turns off.', 'Both packs stay on.', 'Pack 2 turns off.', 'a');
INSERT INTO `usedQuestions` VALUES(57, 25, 'mc', 'air_condition', 'At 2000 AGL in CLB thrust mode, icing conditions, both packs selected ON:', 'Pack 2 is on, 1 is off.', 'Pack 1 is on, 2 is off.', 'Both packs are off.', 'Both packs are on.', 'a');
INSERT INTO `usedQuestions` VALUES(57, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Under cockpit access hatch.', 'Overwing emergency exit.', 'Baggage compartment door.', 'Forward nose hydraulic compartment.', 'a');
INSERT INTO `usedQuestions` VALUES(57, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '160 % of the length of an EMB-135.', '89 feet in length.', '110 feet in length.', '98 feet in length.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 17, 'c2', 'apu', 'The APU can be started using:', 'Battery 1.', 'Battery 2.', 'The GPU (with batteries in AUTO)', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '500 Amps.', '400 Amps.', '200 Amps.', '300 Amps.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'AFter 10 seconds on the ground, immediately in flight.', 'After 10 seconds on the ground.', 'Immediately at all times.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(57, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '-20 C', '40 C', '54 C', '70 C', 'a');
INSERT INTO `usedQuestions` VALUES(57, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'Turn the master knob to OFF.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(57, 47, 'mc', 'autopilot', 'What vertical speed does FLC give you in a descent above 12,000 feet?', '2,000 feet per minute.', '3 degree glidepath.', '1,000 feet per minute.', '3,000 feet per minute.', 'a');
INSERT INTO `usedQuestions` VALUES(57, 42, 'c2', 'autopilot', 'Which of these are vertical flight guidance modes?', 'PIT', 'FLC', 'ROL', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 39, 'mc', 'autopilot', 'When pressing the TOGA buttons on the ground while taxiing:', 'GA mode is activated on the flight director.', 'The thrust rating changes to full thrust.', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'TO mode is activated on the flight director.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS mode but with preset vertical speeds', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'SPD mode but with preset speeds.', 'b');
INSERT INTO `usedQuestions` VALUES(57, 36, 'mc', 'autopilot', 'At what altitude must the autopilot be disengaged on a CAT I ILS approach?', '1000'' AGL.', '500'' AGL.', '200'' AGL.', '1500'' AGL.', 'c');
INSERT INTO `usedQuestions` VALUES(57, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'DAU 1B automatically takes over.', 'Engine #1 indications are replaced with amber dashes', 'Aft aircraft systems information is unavailable.', 'The FADEC syncs N2 to N1.', 'b');
INSERT INTO `usedQuestions` VALUES(57, 3, 'mc', 'crew_awareness', 'Which one of these will not give you a takeoff configuration warning?', 'Parking brake set.', 'Flaps 0.', 'Pitch trim set to 0 degrees.', 'One or both enginges not running.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'Airspeed will be covered with hash marks', 'The cross-side AHRS automatically takes over.', 'ATT FAIL appears on the EADI on the PFD.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 4, 'mc', 'crew_awareness', 'If symbol generator 1 fails:', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'RMU 1 automatically displays Engine Page 1', 'PFD1 and MFD1 go blank.', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'b');
INSERT INTO `usedQuestions` VALUES(57, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'The FMS remains powered.', 'VOR approaches are impossible since the PFD is blank.', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR (no DME) can be flown using the RMU navigation page', 'd');
INSERT INTO `usedQuestions` VALUES(57, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'Ground power is available to supply power to the electrical system.', 'The aircraft electrical system is powered.', 'The ground power unit is disconnected from the aircraft.', 'The ground air supply is supplying bleed air to the packs.', 'a');
INSERT INTO `usedQuestions` VALUES(57, 1, 'tf', 'elec', 'The emergency light system is powered from Essential DC Bus 2.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(57, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'All electrical busses except the shed busses.', 'DC bus 1 and DC bus 2', 'The entire electrical system.', 'The hot battery busses, essential busses, and the central DC bus.', 'd');
INSERT INTO `usedQuestions` VALUES(57, 13, 'mc', 'elec', 'What items are available in essential power?', 'FMS1, DAU1B, DAU2B', 'SG2, DAU2B', 'RMU1, RMU2, EICAS and standby instruments.', 'FMS, PFD and MFDs.', 'c');
INSERT INTO `usedQuestions` VALUES(58, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '110 feet in length.', '98 feet in length.', '89 feet in length.', '160 % of the length of an EMB-135.', 'b');
INSERT INTO `usedQuestions` VALUES(58, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Under cockpit access hatch.', 'Forward nose hydraulic compartment.', 'Overwing emergency exit.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(59, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air leaving the compressor is too hot.', 'The air entering the compressor is too hot.', 'The air entering the pack is too hot.', 'The air leaving the pack is too hot.', 'd');
INSERT INTO `usedQuestions` VALUES(59, 30, 'mc', 'acft_gen', 'An EMB-145 XR is approximately...', '110 feet in length.', '98 feet in length.', '89 feet in length.', '160 % of the length of an EMB-135.', 'b');
INSERT INTO `usedQuestions` VALUES(59, 9, 'mc', 'apu', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:', 'FADEC', 'Manual controls', 'Starter/Generator', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(59, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 9).', '14 degrees pitch up attitude (Flaps 18).', '13 degrees pitch up attitude (Flaps 18).', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(59, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'ATT FAIL appears on the EADI on the PFD.', 'Airspeed will be covered with hash marks', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'The cross-side AHRS automatically takes over.', 'a');
INSERT INTO `usedQuestions` VALUES(59, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The ground air supply is supplying bleed air to the packs.', 'The aircraft electrical system is powered.', 'Ground power is available to supply power to the electrical system.', 'The ground power unit is disconnected from the aircraft.', 'c');
INSERT INTO `usedQuestions` VALUES(60, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs stay on.', 'Pack 2 turns off.', 'Both packs turn off.', 'Pack 1 turns off.', 'c');
INSERT INTO `usedQuestions` VALUES(60, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '160 % of the length of an EMB-135.', '110 feet in length.', '98 feet in length.', '89 feet in length.', 'c');
INSERT INTO `usedQuestions` VALUES(60, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Turn the master knob to OFF.', 'Press the FUEL SHUTOFF button.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'a');
INSERT INTO `usedQuestions` VALUES(60, 37, 'mc', 'autopilot', 'What is the minimum engagement height for the autopilot (feet)?', '200', '1000', '500', '800', 'c');
INSERT INTO `usedQuestions` VALUES(60, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'The cross-side AHRS automatically takes over.', 'Airspeed will be covered with hash marks', 'ATT FAIL appears on the EADI on the PFD.', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(60, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'All electrical busses except the shed busses.', 'The hot battery busses, essential busses, and the central DC bus.', 'DC bus 1 and DC bus 2', 'The entire electrical system.', 'b');
INSERT INTO `usedQuestions` VALUES(61, 27, 'c2', 'air_condition', 'What is a pack overload?', 'The air entering the pack is too hot.', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(61, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 18).', '14 degrees pitch up attitude (Flaps 9).', '13 degrees pitch up attitude (Flaps 18).', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(61, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS mode but with preset vertical speeds', 'SPD mode but with preset speeds.', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'b');
INSERT INTO `usedQuestions` VALUES(61, 39, 'mc', 'autopilot', 'When pressing the TOGA buttons on the ground while taxiing:', 'The thrust rating changes to full thrust.', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'GA mode is activated on the flight director.', 'TO mode is activated on the flight director.', 'd');
INSERT INTO `usedQuestions` VALUES(62, 27, 'c2', 'air_condition', 'What is a pack overload?', 'The air leaving the compressor is too hot.', 'The air entering the pack is too hot.', 'The pressure of air entering the pack is too high.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(62, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air leaving the compressor is too hot.', 'The air entering the compressor is too hot.', 'The air entering the pack is too hot.', 'The air leaving the pack is too hot.', 'd');
INSERT INTO `usedQuestions` VALUES(62, 25, 'mc', 'air_condition', 'While flying in icing conditions at 2000 AGL in CLB thrust with packs selected ON:', 'Pack 1 is on, 2 is off.', 'Both packs are on.', 'Both packs are off.', 'Pack 2 is on, 1 is off.', 'd');
INSERT INTO `usedQuestions` VALUES(62, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs stay on.', 'Pack 1 turns off.', 'Both packs turn off.', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(62, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the FUEL SHUTOFF button.', 'Turn the master knob to OFF.', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'c');
INSERT INTO `usedQuestions` VALUES(62, 35, 'mc', 'apu', 'The APU''s logic commands an automatic shutdown for which of the following conditions in flight?', 'Overspeed.', 'Fire.', 'Overtemperature.', 'High oil temperature.', 'a');
INSERT INTO `usedQuestions` VALUES(62, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '300 Amps.', '500 Amps.', '400 Amps.', '200 Amps.', 'a');
INSERT INTO `usedQuestions` VALUES(62, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '19.0V', '20.0V', '24.0V', '23.5V', 'a');
INSERT INTO `usedQuestions` VALUES(62, 40, 'mc', 'autopilot', 'The aircraft heading must be within ___ degrees of the final approach course (front course) prior to selecting the APR or NAV mode.', '45', '90', '70', '100', 'b');
INSERT INTO `usedQuestions` VALUES(62, 47, 'mc', 'autopilot', 'What vertical speed does FLC give you in a descent above 12,000 feet?', '3,000 feet per minute.', '1,000 feet per minute.', '3 degree glidepath.', '2,000 feet per minute.', 'd');
INSERT INTO `usedQuestions` VALUES(62, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 18).', '14 degrees pitch up attitude (Flaps 9).', '13 degrees pitch up attitude (Flaps 18).', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(62, 39, 'mc', 'autopilot', 'When pressing the TOGA buttons on the ground while taxiing:', 'GA mode is activated on the flight director.', 'TO mode is activated on the flight director.', 'The thrust rating changes to full thrust.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(63, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air entering the pack is too hot.', 'The air leaving the pack is too hot.', 'The air entering the compressor is too hot.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(63, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '98 feet in length.', '89 feet in length.', '160 % of the length of an EMB-135.', '110 feet in length.', 'a');
INSERT INTO `usedQuestions` VALUES(63, 9, 'mc', 'apu', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:', 'Manual controls', 'FADEC', 'EICAS', 'Starter/Generator', 'b');
INSERT INTO `usedQuestions` VALUES(63, 46, 'mc', 'autopilot', 'What button on the flight guidance control panel would you push to navigate using the FMS?', 'HDG, then FMS.', 'HDG', 'FMS', 'NAV', 'd');
INSERT INTO `usedQuestions` VALUES(63, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'Engine #1 indications are replaced with amber dashes', 'The FADEC syncs N2 to N1.', 'Aft aircraft systems information is unavailable.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(63, 1, 'tf', 'elec', 'The emergency light system is powered from Essential DC Bus 2.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(63, 23, 'nc', 'fire_prot', 'If the lavatory halon bottle discharges:', 'The flight attendant hears a warning horn.', 'The LAV SMOKE EICAS warning appears.', 'The LAV BOTTLE INOP EICAS warning appears.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(64, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs stay on.', 'Both packs turn off.', 'Pack 1 turns off.', 'Pack 2 turns off.', 'b');
INSERT INTO `usedQuestions` VALUES(64, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air leaving the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(64, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Under cockpit access hatch.', 'Baggage compartment door.', 'Forward nose hydraulic compartment.', 'Overwing emergency exit.', 'a');
INSERT INTO `usedQuestions` VALUES(64, 30, 'mc', 'acft_gen', 'An EMB-145 XR is approximately...', '89 feet in length.', '110 feet in length.', '98 feet in length.', '160 % of the length of an EMB-135.', 'c');
INSERT INTO `usedQuestions` VALUES(64, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '54 C', '70 C', '-20 C', '40 C', 'c');
INSERT INTO `usedQuestions` VALUES(64, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Press the FUEL SHUTOFF button.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(64, 23, 'nc', 'fire_prot', 'If the lavatory halon bottle discharges:', 'The LAV SMOKE EICAS warning appears.', 'The LAV BOTTLE INOP EICAS warning appears.', 'The flight attendant hears a warning horn.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(65, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR (no DME) can be flown using the RMU navigation page', 'The FMS remains powered.', 'VOR approaches are impossible since the PFD is blank.', 'b');
INSERT INTO `usedQuestions` VALUES(65, 13, 'mc', 'elec', 'What items are available in essential power?', 'RMU1, RMU2, EICAS and standby instruments.', 'FMS1, DAU1B, DAU2B', 'FMS, PFD and MFDs.', 'SG2, DAU2B', 'a');
INSERT INTO `usedQuestions` VALUES(65, 11, 'mc', 'elec', 'Which components are energized in essential power configuration?', 'The hot battery busses, essential busses, and the central DC bus.', 'All electrical busses except the shed busses.', 'The entire electrical system.', 'DC bus 1 and DC bus 2', 'a');
INSERT INTO `usedQuestions` VALUES(65, 1, 'tf', 'elec', 'The emergency light system will never activate when the emergency light switch is in the "OFF" position.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(65, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The aircraft electrical system is powered.', 'The ground power unit is disconnected from the aircraft.', 'Ground power is available to supply power to the electrical system.', 'The ground air supply is supplying bleed air to the packs.', 'c');
INSERT INTO `usedQuestions` VALUES(66, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'The FMS remains powered.', 'FOR-DME approaches can be flown using the standby instruments.', 'VOR approaches are impossible since the PFD is blank.', 'VOR (no DME) can be flown using the RMU navigation page', 'd');
INSERT INTO `usedQuestions` VALUES(66, 13, 'mc', 'elec', 'What items are available in essential power?', 'FMS1, DAU1B, DAU2B', 'FMS, PFD and MFDs.', 'RMU1, RMU2, EICAS and standby instruments.', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(66, 1, 'tf', 'elec', 'The emergency light system is powered from Essential DC Bus 2.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(66, 11, 'mc', 'elec', 'Which components are energized in essential power configuration?', 'The hot battery busses, essential busses, and the central DC bus.', 'DC bus 1 and DC bus 2', 'All electrical busses except the shed busses.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(66, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The ground power unit is disconnected from the aircraft.', 'Ground power is available to supply power to the electrical system.', 'The aircraft electrical system is powered.', 'The ground air supply is supplying bleed air to the packs.', 'b');
INSERT INTO `usedQuestions` VALUES(66, 23, 'nc', 'fire_prot', 'If the lavatory halon bottle discharges:', 'The LAV BOTTLE INOP EICAS warning appears.', 'The LAV SMOKE EICAS warning appears.', 'The flight attendant hears a warning horn.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(67, 14, 'c2', 'ldg_gear_brk', 'With a total loss of hydraulic system #1, the landing gear:', 'Operates using hydraulic system #2 pressure, but may be slower due to the priority valve', 'Must be extended with the freefall actuator.', 'Cannot be retracted once extended.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(67, 24, 'ac', 'powerplant', 'The engine has:', '6 stages of CVG vanes.', 'A 14 stage compressor.', 'A 2 stage high-pressure turbine.', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(67, 5, 'mc', 'stall_prot', 'The stick pusher is inhibited:', 'If one channel of the SPS is inoperative.', 'During an SPS test.', 'If the airspeed is less than 200 kts.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(68, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '20.0V', '23.5V', '19.0V', '24.0V', 'c');
INSERT INTO `usedQuestions` VALUES(69, 39, 'mc', 'autopilot', 'When pressing the TOGA buttons on the ground while taxiing:', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'GA mode is activated on the flight director.', 'TO mode is activated on the flight director.', 'The thrust rating changes to full thrust.', 'c');
INSERT INTO `usedQuestions` VALUES(70, 45, 'mc', 'autopilot', 'When low bank is NOT selected, what is the maximum bank the autopilot will use for any lateral mode?', '10 degrees.', '27 degrees.', '13 degrees.', '14 degrees.', 'b');
INSERT INTO `usedQuestions` VALUES(71, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'VS mode but with preset vertical speeds', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'SPD mode but with preset speeds.', 'a');
INSERT INTO `usedQuestions` VALUES(72, 14, 'c2', 'ldg_gear_brk', 'With a total loss of hydraulic system #1, the landing gear:', 'Must be extended with the freefall actuator.', 'Cannot be retracted once extended.', 'Operates using hydraulic system #2 pressure, but may be slower due to the priority valve', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(73, 17, 'c2', 'apu', 'The APU can be started using:', 'Battery 1.', 'Battery 2.', 'The GPU (with batteries in AUTO)', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(74, 27, 'c2', 'air_condition', 'What is a pack overload?', 'The air leaving the compressor is too hot.', 'The air entering the pack is too hot.', 'The pressure of air entering the pack is too high.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(74, 26, 'mc', 'air_condition', 'What does the EICAS PACK OVHT indicate?', 'The air leaving the compressor is too hot.', 'The air leaving the pack is too hot.', 'The air entering the compressor is too hot.', 'The air entering the pack is too hot.', 'b');
INSERT INTO `usedQuestions` VALUES(75, 25, 'mc', 'air_condition', 'At 2000 AGL in CLB thrust mode, icing conditions, both packs selected ON:', 'Both packs are off.', 'Both packs are on.', 'Pack 2 is on, 1 is off.', 'Pack 1 is on, 2 is off.', 'c');
INSERT INTO `usedQuestions` VALUES(75, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air leaving the pack is too hot.', 'The air entering the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'a');
INSERT INTO `usedQuestions` VALUES(75, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Pack 1 turns off.', 'Pack 2 turns off.', 'Both packs turn off.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(75, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air leaving the compressor is too hot.', 'The air entering the pack is too hot.', 'The pressure of air entering the pack is too high.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(76, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Baggage compartment door.', 'Forward nose hydraulic compartment.', 'Overwing emergency exit.', 'Under cockpit access hatch.', 'd');
INSERT INTO `usedQuestions` VALUES(76, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '98 feet in length.', '160 % of the length of an EMB-135.', '89 feet in length.', '110 feet in length.', 'a');
INSERT INTO `usedQuestions` VALUES(77, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '23.5V', '20.0V', '19.0V', '24.0V', 'c');
INSERT INTO `usedQuestions` VALUES(77, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'Immediately at all times.', 'Immediately in flight.', 'After 10 seconds on the ground.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(77, 35, 'mc', 'apu', 'The APU''s logic commands an automatic shutdown for which of the following conditions in flight?', 'High oil temperature.', 'Fire.', 'Overspeed.', 'Overtemperature.', 'c');
INSERT INTO `usedQuestions` VALUES(77, 9, 'mc', 'apu', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:', 'Starter/Generator', 'Manual controls', 'FADEC', 'EICAS', 'c');
INSERT INTO `usedQuestions` VALUES(77, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '400 Amps.', '200 Amps.', '300 Amps.', '500 Amps.', 'c');
INSERT INTO `usedQuestions` VALUES(77, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '70 C', '54 C', '-20 C', '40 C', 'c');
INSERT INTO `usedQuestions` VALUES(77, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the FUEL SHUTOFF button.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Turn the master knob to OFF.', 'c');
INSERT INTO `usedQuestions` VALUES(77, 17, 'c2', 'apu', 'The APU can be started using:', 'Battery 2.', 'The GPU (with batteries in AUTO)', 'Battery 1.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(78, 45, 'mc', 'autopilot', 'Full bank is equal to ___: ?', '10 degrees.', '27 degrees.', '14 degrees.', '13 degrees.', 'b');
INSERT INTO `usedQuestions` VALUES(78, 39, 'mc', 'autopilot', 'What change should be observed on the FMA after clicking the TOGA buttons on the ground?', 'The thrust rating changes to full thrust.', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'TO mode is activated on the flight director.', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(78, 48, 'mc', 'autopilot', 'What pitch attitude does the aircraft to to hold in the go-around sub-mode for the first twenty seconds (airspeed > 1.23VS)?', 'The aircraft does not hold a specific pitch attitude during the first 20 seconds of this sub-mode.', '10 Degrees', '13 Degrees.', '14 degrees (once you are flaps 9).', 'b');
INSERT INTO `usedQuestions` VALUES(78, 47, 'mc', 'autopilot', 'What vertical speed does FLC give you in a descent above 12,000 feet?', '1,000 feet per minute.', '3 degree glidepath.', '2,000 feet per minute.', '3,000 feet per minute.', 'c');
INSERT INTO `usedQuestions` VALUES(78, 36, 'mc', 'autopilot', 'At what altitude must the autopilot be disengaged on a CAT I ILS approach?', '1000'' AGL.', '500'' AGL.', '1500'' AGL.', '200'' AGL.', 'd');
INSERT INTO `usedQuestions` VALUES(78, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'SPD mode but with preset speeds.', 'VS mode but with preset vertical speeds', 'd');
INSERT INTO `usedQuestions` VALUES(78, 46, 'mc', 'autopilot', 'What button on the flight guidance control panel would you push to navigate using the FMS?', 'FMS', 'HDG, then FMS.', 'HDG', 'NAV', 'd');
INSERT INTO `usedQuestions` VALUES(78, 50, 'mc', 'autopilot', 'On LR aircraft above 12,000 in FLC, the aircraft climbs at...', '270 KIAS until MACH 0.56', '290 KIAS until MACH 0.56', '270 KIAS until MACH 0.65', '2000 fpm', 'a');
INSERT INTO `usedQuestions` VALUES(78, 42, 'c2', 'autopilot', 'Which of these are vertical flight guidance modes?', 'PIT', 'FLC', 'ROL', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(78, 54, 'mc', 'autopilot', 'The FMA displays what messages after pressing the TOGA buttons on the ground?', 'HDG/TO', 'ROL/GA', 'ROL/TO', 'ROL/VS', 'c');
INSERT INTO `usedQuestions` VALUES(78, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 18).', '14 degrees pitch up attitude (Flaps 9).', '13 degrees pitch up attitude (Flaps 18).', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(78, 38, 'mc', 'autopilot', 'During climb, FLC works just like:', 'SPD but with preset speeds.', 'PIT but with preset attitudes.', 'VS but with preset vertical speeds.', 'SPD with preset values below 10,000'' and VS with preset values above 10,000''.', 'a');
INSERT INTO `usedQuestions` VALUES(78, 51, 'ac', 'autopilot', 'Which of the following will disconnect the autopilot?', 'The quick disconnect button', 'The "AP" button on the Flight Guidance Control Panel', 'Use of pitch trim', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(78, 40, 'mc', 'autopilot', 'The aircraft heading must be within ___ degrees of the final approach course (front course) prior to selecting the APR or NAV mode.', '90', '70', '45', '100', 'a');
INSERT INTO `usedQuestions` VALUES(78, 52, 'tf', 'autopilot', 'The autopilot will not engage with the YD inoperative', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(78, 37, 'mc', 'autopilot', 'What is the minimum engagement height for the autopilot (feet)?', '200', '800', '1000', '500', 'd');
INSERT INTO `usedQuestions` VALUES(78, 53, 'mc', 'autopilot', 'Crews must always verify that the autopilot is coupled to the PF by looking at the:', 'Display Control Panel', '', 'Flight Guidance Controller', 'Flight Director button on the Flight Guidance Control Panel', 'b');
INSERT INTO `usedQuestions` VALUES(78, 44, 'mc', 'autopilot', 'When selected, low bank is equal to ____ : ?', '13 degrees above FL250.', '14 degrees.', '27 degrees.', '10 degrees.', 'b');
INSERT INTO `usedQuestions` VALUES(78, 55, 'mc', 'autopilot', 'What button would push on the Display Control Panel to navigation from FMS?', 'TTG', 'LNAV', 'NAV', 'FMS', 'd');
INSERT INTO `usedQuestions` VALUES(79, 66, 'mc', 'crew_awareness', 'An amber IAS flag on the PFD indicates:', 'CA and FO indicated airspeeds differ by more than 5 knots.', 'Airspeed input from PITOT 3 differs by more than 5 knots from CA or FO indications.', 'SPEED HOLD flight director mode is on.', 'Approaching maximum airspeed (redline).', 'a');
INSERT INTO `usedQuestions` VALUES(79, 57, 'mc', 'crew_awareness', 'The following doors open in flight cause a master warning:', 'Main cabin door only.', 'Over-wing emergency exit.', 'Main and service doors.', 'Fuel and baggage doors.', 'c');
INSERT INTO `usedQuestions` VALUES(79, 58, 'tf', 'crew_awareness', 'The flight attendant can override the cockpit switch and turn the emergency lights on.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(79, 4, 'mc', 'crew_awareness', 'If symbol generator 1 fails:', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'RMU 1 automatically displays Engine Page 1', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'All of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(80, 58, 'tf', 'crew_awareness', 'The flight attendant can override the cockpit switch and turn the emergency lights on, regardless of the emergency light switch position in the cockpit.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(80, 80, 'mc', 'crew_awareness', 'In essential power, the EICAS:', 'Is powered normally.', 'Is automatically displayed on RMU 1', 'Can be presented by using SG reversion.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(80, 4, 'mc', 'crew_awareness', 'If symbol generator 1 fails:', 'PFD1 and MFD1 go blank.', 'RMU 1 automatically displays Engine Page 1', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'b');
INSERT INTO `usedQuestions` VALUES(80, 82, 'mc', 'crew_awareness', 'Standby instruments receive information from which pitot static source?', 'Pitot/Static tube 3', 'Pitot 1/Static ports 1 & 4.', 'Pitot 2/Static ports 2 & 3.', 'Pitot 1/Fadec pressurization static port.', 'a');
INSERT INTO `usedQuestions` VALUES(80, 62, 'mc', 'crew_awareness', 'The EICAS caution AURAL WARN FAIL indicates:', 'Both aural channels have failed.', 'The digital audio panel is inoperative.', 'DAU2B has failed.', 'Only one aural channel is working.', 'a');
INSERT INTO `usedQuestions` VALUES(80, 57, 'mc', 'crew_awareness', 'The following doors open in flight cause a master warning:', 'Main and service doors.', 'Main cabin door only.', 'Over-wing emergency exit.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(80, 63, 'tf', 'crew_awareness', 'Should the need arise, COM 3 is available for voice communication.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(80, 66, 'mc', 'crew_awareness', 'An amber IAS flag on the PFD indicates:', 'Airspeed input from PITOT 3 differs by more than 5 knots from CA or FO indications.', 'Approaching maximum airspeed (redline).', 'SPEED HOLD flight director mode is on.', 'CA and FO indicated airspeeds differ by more than 5 knots.', 'd');
INSERT INTO `usedQuestions` VALUES(80, 87, 'mc', 'crew_awareness', 'The following messages appear during an AHRS 2 failure, prior to reversion:', 'ATT FAIL, HDG FAIL on PFD.', 'SG 2', 'MAG 2, ATT 2.', 'Amber HDG flag above HSI.', 'a');
INSERT INTO `usedQuestions` VALUES(80, 60, 'mc', 'crew_awareness', 'The emergency button on the digital audio panel:', 'Commands the TBCH to operate in the emergency mode.', 'Connect the captain only to COM 1 and NAV 1 and FO to COM 2 and NAV 2.', 'Illuminates the EMER button on the flight attendant interphone.', 'Automatically switches to VHF 1 to 121.50.', 'b');
INSERT INTO `usedQuestions` VALUES(80, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'Engine #1 indications are replaced with amber dashes', 'DAU 1B automatically takes over.', 'Aft aircraft systems information is unavailable.', 'The FADEC syncs N2 to N1.', 'a');
INSERT INTO `usedQuestions` VALUES(80, 76, 'mc', 'crew_awareness', 'The ELT battery:', 'Is charged by the shed buses', 'Is charged only when the ELT switch is in the ARM position.', 'Is not charged.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(80, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'ATT FAIL appears on the EADI on the PFD.', 'The cross-side AHRS automatically takes over.', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'Airspeed will be covered with hash marks', 'a');
INSERT INTO `usedQuestions` VALUES(80, 59, 'tf', 'crew_awareness', 'The TBCH is the only means of tuning NAV2 in essential power.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(80, 64, 'mc', 'crew_awareness', 'How many transponders are on the aircraft?', '2', '3', '1', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(81, 61, 'mc', 'crew_awareness', 'The flight data recorder is activated (starts recording):', 'By turning on the red beacon', 'By turning on the NAV lights.', 'By a 5G impact or immersion in water.', 'As soon as the electrical system is powered.', 'a');
INSERT INTO `usedQuestions` VALUES(81, 64, 'mc', 'crew_awareness', 'How many transponders are on the aircraft?', '3', '0', '2', '1', 'c');
INSERT INTO `usedQuestions` VALUES(82, 64, 'mc', 'crew_awareness', 'How many transponders are on the aircraft?', '2', '0', '3', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(82, 77, 'tf', 'crew_awareness', 'The standby airspeed indicator receives information from the ADCs.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(82, 63, 'tf', 'crew_awareness', 'Should the need arise, COM 3 is available for voice communication.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(82, 85, 'mc', 'crew_awareness', 'How do the 5 cockpit CRTs appear following the loss of DC Bus 2?', 'Red X on MFD 2. MFD 1 and PFD 2 are blank.', 'Red X on PFD 2 and MFD 2.  PFD 1 is blank.', 'PFD 2 and MFD 2 are blank.', 'Red X on PFD 1, MFD 2 and EICAS.', 'a');
INSERT INTO `usedQuestions` VALUES(82, 80, 'mc', 'crew_awareness', 'In essential power, the EICAS:', 'Is powered normally.', 'Is automatically displayed on RMU 1', 'Can be presented by using MFD reversion.', 'Can be presented by using SG reversion.', 'a');
INSERT INTO `usedQuestions` VALUES(82, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'The cross-side AHRS automatically takes over.', 'ATT FAIL appears on the EADI on the PFD.', 'Airspeed will be covered with hash marks', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'b');
INSERT INTO `usedQuestions` VALUES(82, 87, 'mc', 'crew_awareness', 'The following messages appear during an AHRS 2 failure, prior to reversion:', 'SG 2', 'MAG 2, ATT 2.', 'Amber HDG flag above HSI.', 'ATT FAIL, HDG FAIL on PFD.', 'd');
INSERT INTO `usedQuestions` VALUES(82, 84, 'tf', 'crew_awareness', 'During a decreasing performance windshear warning, the aircraft should immediately be re-configured to: Gear Up / Flaps 9.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(82, 65, 'mc', 'crew_awareness', 'If the EICAS screen fails, the EICAS information immediately appears on:', 'MFD 1.', 'TBCH.', 'RMU 1.', 'It doesn''t appear anywhere immediately.', 'd');
INSERT INTO `usedQuestions` VALUES(82, 59, 'tf', 'crew_awareness', 'The TBCH is the only means of tuning NAV2 in essential power.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(82, 4, 'mc', 'crew_awareness', 'Which event is specific to a symbol generator 1 failure?', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'PFD1 and MFD1 go blank.', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'RMU 1 automatically displays Engine Page 1', 'd');
INSERT INTO `usedQuestions` VALUES(82, 62, 'mc', 'crew_awareness', 'The EICAS caution AURAL WARN FAIL indicates:', 'Both aural channels have failed.', 'DAU2B has failed.', 'Only one aural channel is working.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(82, 83, 'tf', 'crew_awareness', 'The EICAS reversionary buttons must be pressed to activate DAU channel B.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(82, 3, 'mc', 'crew_awareness', 'Which parameter is not evaluated for a takeoff configuration check?', 'One or both enginges not running.', 'Parking brake set.', 'Pitch trim set to 0 degrees.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(82, 81, 'mc', 'crew_awareness', 'The power source for SG 2 is:', 'DC Bus 2', 'Essential bus 2', 'Essential bus 1', 'DC bus 1', 'a');
INSERT INTO `usedQuestions` VALUES(82, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'DAU 1B automatically takes over.', 'Aft aircraft systems information is unavailable.', 'Engine #1 indications are replaced with amber dashes', 'The FADEC syncs N2 to N1.', 'c');
INSERT INTO `usedQuestions` VALUES(82, 76, 'mc', 'crew_awareness', 'The ELT battery:', 'Is charged by the esential busses', 'Is charged by the shed buses', 'Is not charged.', 'Is charged only when the ELT switch is in the ARM position.', 'c');
INSERT INTO `usedQuestions` VALUES(82, 61, 'mc', 'crew_awareness', 'The flight data recorder is activated (starts recording):', 'By turning on the red beacon', 'As soon as the electrical system is powered.', 'By a 5G impact or immersion in water.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(82, 60, 'mc', 'crew_awareness', 'The emergency button on the digital audio panel:', 'Automatically switches to VHF 1 to 121.50.', 'Connect the captain only to COM 1 and NAV 1 and FO to COM 2 and NAV 2.', 'Illuminates the EMER button on the flight attendant interphone.', 'Commands the TBCH to operate in the emergency mode.', 'b');
INSERT INTO `usedQuestions` VALUES(82, 78, 'mc', 'crew_awareness', 'An amber HDG indication on the PFD indicates:', 'A difference of 6 degrees between the left and right AHRS headings.', 'The heading system has failed.', 'Check your heading, you''re drifting from the assigned heading.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(82, 66, 'mc', 'crew_awareness', 'An amber IAS flag on the PFD indicates:', 'Approaching maximum airspeed (redline).', 'Airspeed input from PITOT 3 differs by more than 5 knots from CA or FO indications.', 'CA and FO indicated airspeeds differ by more than 5 knots.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(82, 56, 'mc', 'crew_awareness', 'The cockpit voice recorder starts recording:', 'By turning on the navigation lights.', 'As soon as the electrical system is powered.', 'By turning on the red beacon.', 'By a 5G impact or immersion in water.', 'b');
INSERT INTO `usedQuestions` VALUES(82, 57, 'mc', 'crew_awareness', 'The following doors open in flight cause a master warning:', 'Main cabin door only.', 'Fuel and baggage doors.', 'Over-wing emergency exit.', 'Main and service doors.', 'd');
INSERT INTO `usedQuestions` VALUES(82, 58, 'tf', 'crew_awareness', 'The flight attendant can override the cockpit switch and turn the emergency lights on, regardless of the emergency light switch position in the cockpit.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(82, 79, 'c2', 'crew_awareness', 'If an air data computer fails:', 'The standby airspeed indicator becomes unreliable.', 'A red failure indications appears on the airspeed tape, altitude tape and red boxed VS on the VSI indicator.', 'The ADC button on the reversionary panel should be pressed per the QRH.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(82, 82, 'mc', 'crew_awareness', 'Standby instruments receive information from which pitot static source?', 'Pitot 2/Static ports 2 & 3.', 'Pitot 1/Fadec pressurization static port.', 'Pitot 1/Static ports 1 & 4.', 'Pitot/Static tube 3', 'd');
INSERT INTO `usedQuestions` VALUES(82, 86, 'mc', 'crew_awareness', '"CAS MSG" on your PFD indicates:', 'SG reversion has been selected.', 'Altitude displayed on each PFD differs by more than 200 feet.', 'IAS displayed on each PFD differs by more than 5 knots.', 'A disagreement between IC-600''s on EICAS messages displayed.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air entering the pack is too hot.', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 25, 'mc', 'air_condition', 'At 2000 AGL in CLB thrust mode, icing conditions, both packs selected ON:', 'Both packs are off.', 'Pack 2 is on, 1 is off.', 'Both packs are on.', 'Pack 1 is on, 2 is off.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Both packs turn off.', 'Both packs stay on.', 'Pack 2 turns off.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air leaving the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 30, 'mc', 'acft_gen', 'The EMB-145 is approximately ...', '160 % of the length of an EMB-135.', '89 feet in length.', '98 feet in length.', '110 feet in length.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Overwing emergency exit.', 'Forward nose hydraulic compartment.', 'Baggage compartment door.', 'Under cockpit access hatch.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '40 C', '54 C', '70 C', '-20 C', 'd');
INSERT INTO `usedQuestions` VALUES(83, 35, 'mc', 'apu', 'In flight, the APU will shut down automatically for which of the following?', 'High oil temperature.', 'Overspeed.', 'Fire.', 'Overtemperature.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '23.5V', '24.0V', '20.0V', '19.0V', 'd');
INSERT INTO `usedQuestions` VALUES(83, 9, 'mc', 'apu', 'Fuel control and starting for the APU (Model T-62T-40C14) is provided from:', 'FADEC', 'Manual controls', 'Starter/Generator', 'EICAS', 'a');
INSERT INTO `usedQuestions` VALUES(83, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Press the FUEL SHUTOFF button.', 'Turn the master knob to OFF.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '400 Amps.', '300 Amps.', '500 Amps.', '200 Amps.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 17, 'c2', 'apu', 'What power sources can be used to start the APU?', 'Battery 2.', 'Battery 1.', 'The GPU (with batteries in AUTO)', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'AFter 10 seconds on the ground, immediately in flight.', 'Immediately at all times.', 'After 10 seconds on the ground.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 48, 'mc', 'autopilot', 'What pitch attitude does the aircraft to to hold in the go-around sub-mode for the first twenty seconds (airspeed > 1.23VS)?', '13 Degrees.', '10 Degrees', '14 degrees (once you are flaps 9).', 'The aircraft does not hold a specific pitch attitude during the first 20 seconds of this sub-mode.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 52, 'tf', 'autopilot', 'The autopilot will not engage with the YD inoperative', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 36, 'mc', 'autopilot', 'At what altitude must the autopilot be disengaged on a CAT I ILS approach?', '1000'' AGL.', '1500'' AGL.', '500'' AGL.', '200'' AGL.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 9).', '14 degrees pitch up attitude (Flaps 18).', '13 degrees pitch up attitude (Flaps 18).', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 39, 'mc', 'autopilot', 'When pressing the TOGA buttons on the ground while taxiing:', 'The thrust rating changes to full thrust.', 'GA mode is activated on the flight director.', 'TO mode is activated on the flight director.', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'SPD mode but with preset speeds.', 'VS mode but with preset vertical speeds', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 47, 'mc', 'autopilot', 'What vertical speed does FLC give you in a descent above 12,000 feet?', '2,000 feet per minute.', '3,000 feet per minute.', '3 degree glidepath.', '1,000 feet per minute.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 50, 'mc', 'autopilot', 'On LR aircraft above 12,000 in FLC, the aircraft climbs at...', '270 KIAS until MACH 0.56', '2000 fpm', '270 KIAS until MACH 0.65', '290 KIAS until MACH 0.56', 'a');
INSERT INTO `usedQuestions` VALUES(83, 42, 'c2', 'autopilot', 'Which of these are vertical flight guidance modes?', 'PIT', 'ROL', 'FLC', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 44, 'mc', 'autopilot', 'When selected, low bank is equal to ____ : ?', '27 degrees.', '13 degrees above FL250.', '10 degrees.', '14 degrees.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 51, 'ac', 'autopilot', 'Which of the following will disconnect the autopilot?', 'Use of pitch trim', 'The "AP" button on the Flight Guidance Control Panel', 'The quick disconnect button', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 38, 'mc', 'autopilot', 'During climb, FLC works just like:', 'VS but with preset vertical speeds.', 'SPD with preset values below 10,000'' and VS with preset values above 10,000''.', 'SPD but with preset speeds.', 'PIT but with preset attitudes.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 46, 'mc', 'autopilot', 'What button on the flight guidance control panel would you push to navigate using the FMS?', 'FMS', 'HDG', 'HDG, then FMS.', 'NAV', 'd');
INSERT INTO `usedQuestions` VALUES(83, 40, 'mc', 'autopilot', 'After having been cleared for the approach, the approach mode can be activated within ___ degrees for a front course approach.', '45', '100', '90', '70', 'c');
INSERT INTO `usedQuestions` VALUES(83, 55, 'mc', 'autopilot', 'What button would push on the Display Control Panel to navigation from FMS?', 'TTG', 'LNAV', 'FMS', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 37, 'mc', 'autopilot', 'What is the minimum engagement height for the autopilot (feet)?', '800', '1000', '500', '200', 'c');
INSERT INTO `usedQuestions` VALUES(83, 53, 'mc', 'autopilot', 'Crews must always verify that the autopilot is coupled to the PF by looking at the:', 'Display Control Panel', 'Flight Guidance Controller', '', 'Flight Director button on the Flight Guidance Control Panel', 'c');
INSERT INTO `usedQuestions` VALUES(83, 45, 'mc', 'autopilot', 'Full bank is equal to ___: ?', '14 degrees.', '13 degrees.', '27 degrees.', '10 degrees.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 54, 'mc', 'autopilot', 'The FMA displays what messages after pressing the TOGA buttons on the ground?', 'ROL/GA', 'ROL/VS', 'HDG/TO', 'ROL/TO', 'd');
INSERT INTO `usedQuestions` VALUES(83, 82, 'mc', 'crew_awareness', 'Standby instruments receive information from which pitot static source?', 'Pitot 2/Static ports 2 & 3.', 'Pitot 1/Static ports 1 & 4.', 'Pitot 1/Fadec pressurization static port.', 'Pitot/Static tube 3', 'd');
INSERT INTO `usedQuestions` VALUES(83, 4, 'mc', 'crew_awareness', 'If symbol generator 1 fails:', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'RMU 1 automatically displays Engine Page 1', 'PFD1 and MFD1 go blank.', 'All of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 84, 'tf', 'crew_awareness', 'During a decreasing performance windshear warning, the aircraft should immediately be re-configured to: Gear Up / Flaps 9.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(83, 63, 'tf', 'crew_awareness', 'Should the need arise, COM 3 is available for voice communication.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 81, 'mc', 'crew_awareness', 'The power source for SG 2 is:', 'Essential bus 1', 'DC bus 1', 'Essential bus 2', 'DC Bus 2', 'd');
INSERT INTO `usedQuestions` VALUES(83, 65, 'mc', 'crew_awareness', 'If the EICAS screen fails, the EICAS information immediately appears on:', 'TBCH.', 'It doesn''t appear anywhere immediately.', 'MFD 1.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 86, 'mc', 'crew_awareness', '"CAS MSG" on your PFD indicates:', 'SG reversion has been selected.', 'A disagreement between IC-600''s on EICAS messages displayed.', 'Altitude displayed on each PFD differs by more than 200 feet.', 'All of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 66, 'mc', 'crew_awareness', 'An amber IAS flag on the PFD indicates:', 'Airspeed input from PITOT 3 differs by more than 5 knots from CA or FO indications.', 'CA and FO indicated airspeeds differ by more than 5 knots.', 'Approaching maximum airspeed (redline).', 'SPEED HOLD flight director mode is on.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 77, 'tf', 'crew_awareness', 'The standby airspeed indicator receives information from the ADCs.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(83, 3, 'mc', 'crew_awareness', 'Which one of these will not give you a takeoff configuration warning?', 'Pitch trim set to 0 degrees.', 'Flaps 0.', 'One or both enginges not running.', 'Parking brake set.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 57, 'mc', 'crew_awareness', 'The following doors open in flight cause a master warning:', 'Over-wing emergency exit.', 'Main cabin door only.', 'Main and service doors.', 'Fuel and baggage doors.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 56, 'mc', 'crew_awareness', 'The cockpit voice recorder starts recording:', 'By a 5G impact or immersion in water.', 'As soon as the electrical system is powered.', 'By turning on the red beacon.', 'By turning on the navigation lights.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 76, 'mc', 'crew_awareness', 'The ELT battery:', 'Is not charged.', 'Is charged only when the ELT switch is in the ARM position.', 'Is charged by the esential busses', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 87, 'mc', 'crew_awareness', 'The following messages appear during an AHRS 2 failure, prior to reversion:', 'SG 2', 'Amber HDG flag above HSI.', 'ATT FAIL, HDG FAIL on PFD.', 'MAG 2, ATT 2.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'The FADEC syncs N2 to N1.', 'Engine #1 indications are replaced with amber dashes', 'Aft aircraft systems information is unavailable.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 60, 'mc', 'crew_awareness', 'The emergency button on the digital audio panel:', 'Automatically switches to VHF 1 to 121.50.', 'Illuminates the EMER button on the flight attendant interphone.', 'Commands the TBCH to operate in the emergency mode.', 'Connect the captain only to COM 1 and NAV 1 and FO to COM 2 and NAV 2.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 78, 'mc', 'crew_awareness', 'An amber HDG indication on the PFD indicates:', 'Check your heading, you''re drifting from the assigned heading.', 'A difference of 6 degrees between the left and right AHRS headings.', 'The heading system has failed.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 85, 'mc', 'crew_awareness', 'How do the 5 cockpit CRTs appear following the loss of DC Bus 2?', 'Red X on MFD 2. MFD 1 and PFD 2 are blank.', 'PFD 2 and MFD 2 are blank.', 'Red X on PFD 2 and MFD 2.  PFD 1 is blank.', 'Red X on PFD 1, MFD 2 and EICAS.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 64, 'mc', 'crew_awareness', 'How many transponders are on the aircraft?', '3', '2', '0', '1', 'b');
INSERT INTO `usedQuestions` VALUES(83, 83, 'tf', 'crew_awareness', 'The EICAS reversionary buttons must be pressed to activate DAU channel B.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 62, 'mc', 'crew_awareness', 'The EICAS caution AURAL WARN FAIL indicates:', 'Only one aural channel is working.', 'DAU2B has failed.', 'Both aural channels have failed.', 'The digital audio panel is inoperative.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'ATT FAIL appears on the EADI on the PFD.', 'The cross-side AHRS automatically takes over.', 'Airspeed will be covered with hash marks', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'a');
INSERT INTO `usedQuestions` VALUES(83, 61, 'mc', 'crew_awareness', 'The flight data recorder is activated (starts recording):', 'By turning on the red beacon', 'By a 5G impact or immersion in water.', 'By turning on the NAV lights.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 58, 'tf', 'crew_awareness', 'The flight attendant can override the cockpit switch and turn the emergency lights on.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 59, 'tf', 'crew_awareness', 'The TBCH is the only means of tuning NAV2 in essential power.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(83, 79, 'c2', 'crew_awareness', 'If an air data computer fails:', 'A red failure indications appears on the airspeed tape, altitude tape and red boxed VS on the VSI indicator.', 'The standby airspeed indicator becomes unreliable.', 'The ADC button on the reversionary panel should be pressed per the QRH.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 98, 'mc', 'elec', 'The electrical system is made up of...', 'Five, 24 Volt DC generators.', 'Four, 28 Volt DC generators.', 'Five, 28 Volt DC generators.', 'Four, 24 Volt DC generators.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 89, 'mc', 'elec', 'In flight, the NICAD batteries supply the electrical power for ___ minutes while on essential power.', '40 minutes.', '15 minutes.', '25 minutes.', '20 minutes.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 91, 'tf', 'elec', 'The electrical system splits into 2 independent electrical networks when there are 4 or more generators on-line.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 97, 'mc', 'elec', 'The backup battery provides power for:', 'The GCUs, EDL and on XR aircraft, the ISIS.', 'The GCUs, EDL and RMU 1 if IC-600 1 fails.', 'The GCUs, EDL and FADECs.', 'The AHRS to prevent loss of alignment data.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'VOR (no DME) can be flown using the RMU navigation page', 'VOR approaches are impossible since the PFD is blank.', 'VOR-DME approaches can be flown using the standby instruments.', 'The FMS remains powered.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 90, 'tf', 'elec', 'The ground service bus is only powered with the GPU NOT selected and the batteries OFF.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 96, 'mc', 'elec', 'On the ground with the main batteries as the only source of power:', 'All DC buses are powered if the shed bus knob is in OVRD.', 'All DC buses are powered.', 'All DC buses are powered except the shed buses.', 'Only the esential buses can be powered.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'The hot battery busses, essential busses, and the central DC bus.', 'DC bus 1 and DC bus 2', 'All electrical busses except the shed busses.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 13, 'mc', 'elec', 'What items are available in essential power?', 'RMU1, RMU2, EICAS and standby instruments.', 'FMS, PFD and MFDs.', 'SG2, DAU2B', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 92, 'c2', 'elec', 'The shed buses are powered:', 'With the APU off, one engine shut down and the shed bus knob in AUTO.', 'With 3 generators on-line, shed bus knob in AUTO, on the ground.', 'With the GPU selected, shed bus knob in AUTO or OVRD.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The ground air supply is supplying bleed air to the packs.', 'The aircraft electrical system is powered.', 'The ground power unit is disconnected from the aircraft.', 'Ground power is available to supply power to the electrical system.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 95, 'mc', 'elec', 'The following is available if down to essential power.', 'Normal gear extension.', 'Pressurization.', 'Flaps.', 'Roll trim.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 94, 'tf', 'elec', 'With a loss of generator 1 and the APU off, the aircraft still has 2 independent electrical systems.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(83, 93, 'mc', 'elec', 'Which electrical bus supplies power to the ISIS on the XR?', 'DC bus 2.', 'Backup hot bus.', 'Central DC bus.', 'Essential bus 2.', 'b');
INSERT INTO `usedQuestions` VALUES(83, 1, 'tf', 'elec', 'The emergency light system will never activate when the emergency light switch is in the "OFF" position.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(83, 100, 'mc', 'elec', 'The EICAS message ELEC ESS XFR FAIL means:', 'You are not in the essential power configuration but should be.', 'You are in essential power configuration but should not be.', 'You have one electrical system despite having 4 or more generators on-line.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 101, 'mc', 'elec', 'With GPU power available and selected:', 'BC 1 and BC 2 are closed.', 'BTC 1 & 2 are open.', 'The ALC is closed if the APU has been started.', 'BC 1 and BC 2 are open.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 88, 'c2', 'elec', 'The items powered by the AC electrical system are:', 'TCAS.', 'Weather Radar.', 'EGPWS/Wind Shear.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 99, 'mc', 'elec', 'The backup battery button on the electrical panel...', 'Opens the BBC, isolating the backup battery hot bus.', 'Removes power from the backup flight instruments.', 'Allows a test of the ISIS on LR aircraft.', 'Is pushed during an electrical emergency to backup EDL logic.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 103, 'mc', 'emerg_equip', 'On the EMB 145, we have the following emergency equipment in the aircraft.', 'First Aid Kit, 2 PBEs, 2 H20 fire extinguishers.', '3 Halon fire extinguishers, 3 PBEs, 1 H20 fire extinguisher.', '4 flashlights, 50 life vests, 2 oxygen deploy tools.', 'The Enhanced Emergency Master Kit (EEMK)', 'b');
INSERT INTO `usedQuestions` VALUES(83, 102, 'mc', 'emerg_equip', 'The 145 is required to have a total of:', '3 Halon fire extinguishers, 2 PBEs, 1 H2O fire extinguisher, 2 portable O2 bottles.', '2 Halon fire extinguishers, 3 PBEs, 2 H2O fire extinguishers, no portable O2 bottle(s).', '3 Halon fire extinguishers, 3 PBEs, 1 H2O fire extinguisher, 2 portable O2 bottles.', '2 Halon fire extinguishers, 2 PBEs, 1 H2O fire extinguisher, 1 portable O2 bottle.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 23, 'nc', 'fire_prot', 'If the lavatory halon bottle discharges:', 'The LAV SMOKE EICAS warning appears.', 'The LAV BOTTLE INOP EICAS warning appears.', 'The flight attendant hears a warning horn.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 108, 'tf', 'fire_prot', 'Engine fire protection is available when the aircraft is de-powered.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 114, 'ac', 'fire_prot', 'Select the true statement regarding fire protection:', 'APU fire detection and protection is available in essential power.', 'Low pressure in the fire loop will trigger a FIRE DET FAIL caution message.', 'High pressure in the fire loop will trigger a FIRE warning message.', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 105, 'mc', 'fire_prot', 'What is the first immediate action item (memory item) for an engine fire in flight?', 'Thrust lever - IDLE.', 'Fire extinguishing handle - PULL, DO NOT ROTATE.', 'Fire extinguishing handle - PULL & ROTATE.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 111, 'mc', 'fire_prot', 'How does pulling a fire handle affect the hydraulic system?', 'Turns off the associated electric hydraulic pump  - if it is operating.', 'Has no effect on the hydraulic system.', 'Closes the associated hydraulic shutoff valve.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 107, 'tf', 'fire_prot', 'APU fire detection and protection is available when the aircraft is de-powered.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(83, 113, 'mc', 'fire_prot', 'Which of the following messages would indicate a good fire test?', 'E1(2) Fire Det Fail.', 'Lav Smoke', 'APU Fire Loop Fail', 'E1(2) EXTBL A(B) INOP', 'a');
INSERT INTO `usedQuestions` VALUES(83, 104, 'mc', 'fire_prot', 'When a fire extinguishing handle is pulled:', 'The hydraulic shutoff valve is opened.', 'The respective engine fire bottle is discharged.', 'The fuel shutoff valve closes.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 110, 'ac', 'fire_prot', 'Pulling the fire extinguishing handle closes:', 'The hydraulic shutoff valve to the engine-driven fuel pump.', 'The fuel shutoff valve.', 'The engine bleed and lip anti-ice ice valves.', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 112, 'c2', 'fire_prot', 'Pressing the APU fire extinguishing button:', 'Closes the APU fuel shutoff valve.', 'Discharges the APU fire bottle.', 'Shuts down the APU and discharges the fire extinguisher after a 10 second delay.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 109, 'mc', 'fire_prot', 'How many smoke goggles are in the cockpit?', '3', '1', '2', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 115, 'c2', 'fire_prot', 'The aircraft has a total of..', '1 Halon fire bottle for the APU', '1 Halon fire bottle for the lavatory.', '2 Halon fire bottles for the engines and 2 Halon fire bottles for the APU.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 120, 'tf', 'flt_control', 'When in manual reversion, the elevators, ailerons and rudder can all be actuated mechanically.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 121, 'mc', 'flt_control', 'The maximum airspeed with flaps 22 is:', '250 KIAS.', '160 KIAS.', '200 KIAS.', '140 KIAS.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 124, 'tf', 'flt_control', 'The ground spoilers open when the airplane is on the ground, wheel speed >25 kts and a low TLA.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(83, 132, 'mc', 'flt_control', 'The EICAS message "FLAP LOW SPEED"...', 'Indicates a failure of the teleflex cable.', 'Indicates a failure of the flap velocity sensor.', 'Indicates a mis-threading of the ball-screw actuator.', 'Indicates a flap motor failure.', 'd');
INSERT INTO `usedQuestions` VALUES(83, 141, 'tf', 'fuel', 'Fuel crossfeed is not available in essential power.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(83, 135, 'mc', 'fuel', 'Which statement is true concerning XR fuel use?', 'The engines only use fuel from the wings.  When the wing tanks have less than 4630 lbs for 30 seconds, fuel from the ventral tank is transferred.', 'Fuel is used form the wings first. When the wing tanks are empty, fuel is supplied from the ventral tank.', 'Fuel is used from the ventral tank first, then from the wings.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(83, 138, 'mc', 'fuel', 'If the fuel boost bump fails:', 'The engine will continue to run, but at reduced thrust.', 'The engine will eventually flame out due to lack of fuel.', 'The engine will continue to run on boost pressure provided by the other two boost pumps.', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(83, 142, 'mc', 'fuel', 'Assuming useable fuel in an XR''s ventral tank, fuel transfer will automatically occur in the auto mode when ...', 'One wing tank reaches 1863 lbs.', 'The FMS shows fuel remaning on arrival of less thank 1800 lbs.', 'Both wing tanks reach 4630 lbs + 30 seconds.', 'One wing tank reaches 4630 lbs + 30 seconds.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 25, 'mc', 'air_condition', 'While flying in icing conditions at 2000 AGL in CLB thrust with packs selected ON:', 'Both packs are on.', 'Pack 2 is on, 1 is off.', 'Pack 1 is on, 2 is off.', 'Both packs are off.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 27, 'c2', 'air_condition', 'What does the EICAS PACK OVLD indicate?', 'The air leaving the compressor is too hot.', 'The pressure of air entering the pack is too high.', 'The air entering the pack is too hot.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Pack 2 turns off.', 'Both packs turn off.', 'Both packs stay on.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 26, 'mc', 'air_condition', 'What is a pack overheat?', 'The air leaving the pack is too hot.', 'The air entering the pack is too hot.', 'The air entering the compressor is too hot.', 'The air leaving the compressor is too hot.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 29, 'mc', 'acft_gen', 'Which door, when open, will cause an "ACCESS DOORS OPN" EICAS message?', 'Overwing emergency exit.', 'Baggage compartment door.', 'Under cockpit access hatch.', 'Forward nose hydraulic compartment.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 30, 'mc', 'acft_gen', 'An EMB-145 XR is approximately...', '89 feet in length.', '98 feet in length.', '110 feet in length.', '160 % of the length of an EMB-135.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 2, 'mc', 'apu', 'The minimum battery temperature for an APU start is:', '54 C', '-20 C', '70 C', '40 C', 'b');
INSERT INTO `usedQuestions` VALUES(84, 33, 'mc', 'apu', 'An attempt to start the APU can be made if battery voltage is at least:', '20.0V', '24.0V', '23.5V', '19.0V', 'd');
INSERT INTO `usedQuestions` VALUES(84, 32, 'mc', 'apu', 'In case of an APU fire, the APU shuts down:', 'Immediately in flight.', 'AFter 10 seconds on the ground, immediately in flight.', 'Immediately at all times.', 'After 10 seconds on the ground.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 12, 'mc', 'apu', 'The maximum load on the APU generator above FL300 is:', '300 Amps.', '500 Amps.', '200 Amps.', '400 Amps.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 35, 'mc', 'apu', 'The APU''s logic commands an automatic shutdown for which of the following conditions in flight?', 'High oil temperature.', 'Fire.', 'Overspeed.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 17, 'c2', 'apu', 'What power sources can be used to start the APU?', 'Battery 1.', 'Battery 2.', 'The GPU (with batteries in AUTO)', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 9, 'mc', 'apu', 'The APU (Model T-62T-40C14) is controlled by a(n):', 'Manual controls', 'FADEC', 'EICAS', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 34, 'mc', 'apu', 'The proper way to shut down the APU is to:', 'Turn the master knob to OFF.', 'Press the stop button, wait until 0% rotation, then turn the master knob to OFF.', 'Press the FUEL SHUTOFF button.', 'Close the APU bleed valves, wait 3 minutes, press the stop button, then turn the master knob to OFF.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 48, 'mc', 'autopilot', 'What pitch attitude does the aircraft to to hold in the go-around sub-mode for the first twenty seconds (airspeed > 1.23VS)?', 'The aircraft does not hold a specific pitch attitude during the first 20 seconds of this sub-mode.', '13 Degrees.', '14 degrees (once you are flaps 9).', '10 Degrees', 'd');
INSERT INTO `usedQuestions` VALUES(84, 50, 'mc', 'autopilot', 'On LR aircraft above 12,000 in FLC, the aircraft climbs at...', '290 KIAS until MACH 0.56', '2000 fpm', '270 KIAS until MACH 0.56', '270 KIAS until MACH 0.65', 'c');
INSERT INTO `usedQuestions` VALUES(84, 38, 'mc', 'autopilot', 'During climb, FLC works just like:', 'SPD with preset values below 10,000'' and VS with preset values above 10,000''.', 'PIT but with preset attitudes.', 'VS but with preset vertical speeds.', 'SPD but with preset speeds.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 43, 'c2', 'autopilot', 'On the ground, pressing the TOGA buttons will position the command bars to:', '14 degrees pitch up attitude (Flaps 9).', '14 degrees pitch up attitude (Flaps 18).', '13 degrees pitch up attitude (Flaps 18).', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 39, 'mc', 'autopilot', 'What change should be observed on the FMA after clicking the TOGA buttons on the ground?', 'TO mode is activated on the flight director.', 'GA mode is activated on the flight director.', 'The thrust rating changes to full thrust.', 'The flight director shows a 10 degree pitch up indication for takeoff.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 36, 'mc', 'autopilot', 'At what altitude must the autopilot be disengaged on a CAT I ILS approach?', '1000'' AGL.', '500'' AGL.', '200'' AGL.', '1500'' AGL.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 55, 'mc', 'autopilot', 'What button would push on the Display Control Panel to navigation from FMS?', 'NAV', 'LNAV', 'FMS', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 40, 'mc', 'autopilot', 'After having been cleared for the approach, the approach mode can be activated within ___ degrees for a front course approach.', '90', '70', '45', '100', 'a');
INSERT INTO `usedQuestions` VALUES(84, 46, 'mc', 'autopilot', 'What button on the flight guidance control panel would you push to navigate using the FMS?', 'HDG', 'HDG, then FMS.', 'NAV', 'FMS', 'c');
INSERT INTO `usedQuestions` VALUES(84, 44, 'mc', 'autopilot', 'When selected, low bank is equal to ____ : ?', '10 degrees.', '27 degrees.', '14 degrees.', '13 degrees above FL250.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 41, 'mc', 'autopilot', 'During descent, FLC works just like:', 'PIT mode.  It maintains 5 degrees nose down from FL370 down to FL180 then linearly increases pitch to 3 degrees nose down.', 'VS and SPD mode. It maintains 290 KIAS from FL370 down to 10,000 then 1000ft/min.', 'SPD mode but with preset speeds.', 'VS mode but with preset vertical speeds', 'd');
INSERT INTO `usedQuestions` VALUES(84, 53, 'mc', 'autopilot', 'Crews must always verify that the autopilot is coupled to the PF by looking at the:', 'Flight Mode Anunciator (FMA).', 'Flight Guidance Controller', 'Display Control Panel', 'Flight Director button on the Flight Guidance Control Panel', 'a');
INSERT INTO `usedQuestions` VALUES(84, 45, 'mc', 'autopilot', 'Full bank is equal to ___: ?', '13 degrees.', '14 degrees.', '27 degrees.', '10 degrees.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 37, 'mc', 'autopilot', 'What is the minimum engagement height for the autopilot (feet)?', '200', '800', '500', '1000', 'c');
INSERT INTO `usedQuestions` VALUES(84, 52, 'tf', 'autopilot', 'The autopilot will not engage with the YD inoperative', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 54, 'mc', 'autopilot', 'The FMA displays what messages after pressing the TOGA buttons on the ground?', 'ROL/GA', 'HDG/TO', 'ROL/TO', 'ROL/VS', 'c');
INSERT INTO `usedQuestions` VALUES(84, 47, 'mc', 'autopilot', 'What vertical speed does FLC give you in a descent above 12,000 feet?', '3 degree glidepath.', '1,000 feet per minute.', '2,000 feet per minute.', '3,000 feet per minute.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 51, 'ac', 'autopilot', 'Which of the following will disconnect the autopilot?', 'The quick disconnect button', 'Use of pitch trim', 'The "AP" button on the Flight Guidance Control Panel', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 42, 'c2', 'autopilot', 'Which of these are vertical flight guidance modes?', 'PIT', 'ROL', 'FLC', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 60, 'mc', 'crew_awareness', 'The emergency button on the digital audio panel:', 'Automatically switches to VHF 1 to 121.50.', 'Illuminates the EMER button on the flight attendant interphone.', 'Commands the TBCH to operate in the emergency mode.', 'Connect the captain only to COM 1 and NAV 1 and FO to COM 2 and NAV 2.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 58, 'tf', 'crew_awareness', 'The flight attendant can override the cockpit switch and turn the emergency lights on, regardless of the emergency light switch position in the cockpit.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 84, 'tf', 'crew_awareness', 'During a decreasing performance windshear warning, the aircraft should immediately be re-configured to: Gear Up / Flaps 9.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(84, 81, 'mc', 'crew_awareness', 'The power source for SG 2 is:', 'Essential bus 2', 'DC Bus 2', 'DC bus 1', 'Essential bus 1', 'b');
INSERT INTO `usedQuestions` VALUES(84, 64, 'mc', 'crew_awareness', 'How many transponders are on the aircraft?', '3', '0', '2', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 63, 'tf', 'crew_awareness', 'COM 3 cannot be used for voice communication when the EMER button is pushed in (selected) on the digital audio panel.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 59, 'tf', 'crew_awareness', 'The TBCH is the only means of tuning NAV2 in essential power.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(84, 61, 'mc', 'crew_awareness', 'The flight data recorder is activated (starts recording):', 'By a 5G impact or immersion in water.', 'By turning on the red beacon', 'As soon as the electrical system is powered.', 'By turning on the NAV lights.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 57, 'mc', 'crew_awareness', 'The following doors open in flight cause a master warning:', 'Main and service doors.', 'Main cabin door only.', 'Fuel and baggage doors.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 79, 'c2', 'crew_awareness', 'If an air data computer fails:', 'A red failure indications appears on the airspeed tape, altitude tape and red boxed VS on the VSI indicator.', 'The standby airspeed indicator becomes unreliable.', 'The ADC button on the reversionary panel should be pressed per the QRH.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 87, 'mc', 'crew_awareness', 'The following messages appear during an AHRS 2 failure, prior to reversion:', 'Amber HDG flag above HSI.', 'SG 2', 'ATT FAIL, HDG FAIL on PFD.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 6, 'mc', 'crew_awareness', 'What happens if DAU 1A Fails?', 'The FADEC syncs N2 to N1.', 'DAU 1B automatically takes over.', 'Engine #1 indications are replaced with amber dashes', 'All of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 4, 'mc', 'crew_awareness', 'Which event is specific to a symbol generator 1 failure?', 'PFD1 and MFD1 go blank.', 'RMU 1 automatically displays Engine Page 1', 'Symbol generator 2 automatically supplies symbols to all 5 screens.', 'The EICAS reversionary buttons must be pressed to activate channel B.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 7, 'mc', 'crew_awareness', 'If AHRS 1 or 2 fails:', 'The cross-side AHRS automatically takes over.', 'Deselect pitot heat 3 to preserve battery life for the remaining component', 'Airspeed will be covered with hash marks', 'ATT FAIL appears on the EADI on the PFD.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 56, 'mc', 'crew_awareness', 'The cockpit voice recorder starts recording:', 'By turning on the red beacon.', 'By a 5G impact or immersion in water.', 'By turning on the navigation lights.', 'As soon as the electrical system is powered.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 65, 'mc', 'crew_awareness', 'If the EICAS screen fails, the EICAS information immediately appears on:', 'TBCH.', 'It doesn''t appear anywhere immediately.', 'MFD 1.', 'RMU 1.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 78, 'mc', 'crew_awareness', 'An amber HDG indication on the PFD indicates:', 'A difference of 6 degrees between the left and right AHRS headings.', 'Check your heading, you''re drifting from the assigned heading.', 'The heading system has failed.', 'The FMS is suggesting heading select navigation.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 86, 'mc', 'crew_awareness', '"CAS MSG" on your PFD indicates:', 'SG reversion has been selected.', 'IAS displayed on each PFD differs by more than 5 knots.', 'A disagreement between IC-600''s on EICAS messages displayed.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 66, 'mc', 'crew_awareness', 'An amber IAS flag on the PFD indicates:', 'Airspeed input from PITOT 3 differs by more than 5 knots from CA or FO indications.', 'SPEED HOLD flight director mode is on.', 'CA and FO indicated airspeeds differ by more than 5 knots.', 'Approaching maximum airspeed (redline).', 'c');
INSERT INTO `usedQuestions` VALUES(84, 62, 'mc', 'crew_awareness', 'The EICAS caution AURAL WARN FAIL indicates:', 'The digital audio panel is inoperative.', 'Only one aural channel is working.', 'Both aural channels have failed.', 'DAU2B has failed.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 80, 'mc', 'crew_awareness', 'In essential power, the EICAS:', 'Can be presented by using MFD reversion.', 'Is automatically displayed on RMU 1', 'Can be presented by using SG reversion.', 'Is powered normally.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 3, 'mc', 'crew_awareness', 'Which parameter is not evaluated for a takeoff configuration check?', 'Parking brake set.', 'Flaps 0.', 'Pitch trim set to 0 degrees.', 'One or both enginges not running.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 83, 'tf', 'crew_awareness', 'The EICAS reversionary buttons must be pressed to activate DAU channel B.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 76, 'mc', 'crew_awareness', 'The ELT battery:', 'Is charged by the esential busses', 'Is not charged.', 'Is charged by the shed buses', 'Is charged only when the ELT switch is in the ARM position.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 85, 'mc', 'crew_awareness', 'What does it look like on the 5 cockpit screens when you lose DC Bus 2?', 'Red X on PFD 1, MFD 2 and EICAS.', 'Red X on MFD 2. MFD 1 and PFD 2 are blank.', 'PFD 2 and MFD 2 are blank.', 'Red X on PFD 2 and MFD 2.  PFD 1 is blank.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 82, 'mc', 'crew_awareness', 'Standby instruments receive information from which pitot static source?', 'Pitot 1/Static ports 1 & 4.', 'Pitot/Static tube 3', 'Pitot 1/Fadec pressurization static port.', 'Pitot 2/Static ports 2 & 3.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 11, 'mc', 'elec', 'While on essential power, what busses are powered?', 'The hot battery busses, essential busses, and the central DC bus.', 'The entire electrical system.', 'All electrical busses except the shed busses.', 'DC bus 1 and DC bus 2', 'a');
INSERT INTO `usedQuestions` VALUES(84, 8, 'mc', 'elec', 'In essential power configuration (w/ loss of all generators):', 'VOR approaches are impossible since the PFD is blank.', 'The FMS remains powered.', 'VOR (no DME) can be flown using the RMU navigation page', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 101, 'mc', 'elec', 'With GPU power available and selected:', 'BC 1 and BC 2 are open.', 'The ALC is closed if the APU has been started.', 'BC 1 and BC 2 are closed.', 'BTC 1 & 2 are open.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 99, 'mc', 'elec', 'The backup battery button on the electrical panel...', 'Opens the BBC, isolating the backup battery hot bus.', 'Allows a test of the ISIS on LR aircraft.', 'Is pushed during an electrical emergency to backup EDL logic.', 'Removes power from the backup flight instruments.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 88, 'c2', 'elec', 'The items powered by the AC electrical system are:', 'TCAS.', 'Weather Radar.', 'EGPWS/Wind Shear.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 97, 'mc', 'elec', 'The backup battery provides power for:', 'The GCUs, EDL and on XR aircraft, the ISIS.', 'The AHRS to prevent loss of alignment data.', 'The GCUs, EDL and RMU 1 if IC-600 1 fails.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 100, 'mc', 'elec', 'The EICAS message ELEC ESS XFR FAIL means:', 'Is normal during a loss of all generators.', 'You are not in the essential power configuration but should be.', 'You have one electrical system despite having 4 or more generators on-line.', 'All of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 95, 'mc', 'elec', 'The following is available if down to essential power.', 'Normal gear extension.', 'Pressurization.', 'Roll trim.', 'None of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(84, 89, 'mc', 'elec', 'In flight, the NICAD batteries supply the electrical power for ___ minutes while on essential power.', '25 minutes.', '40 minutes.', '20 minutes.', '15 minutes.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 93, 'mc', 'elec', 'Which electrical bus supplies power to the ISIS on the XR?', 'DC bus 2.', 'Backup hot bus.', 'Central DC bus.', 'Essential bus 2.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 10, 'mc', 'elec', 'The GPU AVAIL inscription on the GPU button indicates:', 'The aircraft electrical system is powered.', 'Ground power is available to supply power to the electrical system.', 'The ground air supply is supplying bleed air to the packs.', 'The ground power unit is disconnected from the aircraft.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 92, 'c2', 'elec', 'The shed buses are powered:', 'With 3 generators on-line, shed bus knob in AUTO, on the ground.', 'With the APU off, one engine shut down and the shed bus knob in AUTO.', 'With the GPU selected, shed bus knob in AUTO or OVRD.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 1, 'tf', 'elec', 'The emergency light system is powered from Essential DC Bus 2.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(84, 90, 'tf', 'elec', 'The ground service bus is not powered when the GPU is selected.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 13, 'mc', 'elec', 'What items are available in essential power?', 'SG2, DAU2B', 'FMS1, DAU1B, DAU2B', 'FMS, PFD and MFDs.', 'RMU1, RMU2, EICAS and standby instruments.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 94, 'tf', 'elec', 'With a loss of generator 1 and the APU off, the aircraft still has 2 independent electrical systems.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(84, 96, 'mc', 'elec', 'On the ground with the main batteries as the only source of power:', 'All DC buses are powered.', 'All DC buses are powered except the shed buses.', 'All DC buses are powered if the shed bus knob is in OVRD.', 'Only the esential buses can be powered.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 91, 'tf', 'elec', 'The electrical system splits into 2 independent electrical networks when there are 4 or more generators on-line.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 98, 'mc', 'elec', 'The electrical system is made up of...', 'Five, 24 Volt DC generators.', 'Four, 28 Volt DC generators.', 'Four, 24 Volt DC generators.', 'Five, 28 Volt DC generators.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 102, 'mc', 'emerg_equip', 'The 145 is required to have a total of:', '2 Halon fire extinguishers, 3 PBEs, 2 H2O fire extinguishers, no portable O2 bottle(s).', '2 Halon fire extinguishers, 2 PBEs, 1 H2O fire extinguisher, 1 portable O2 bottle.', '3 Halon fire extinguishers, 3 PBEs, 1 H2O fire extinguisher, 2 portable O2 bottles.', '3 Halon fire extinguishers, 2 PBEs, 1 H2O fire extinguisher, 2 portable O2 bottles.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 103, 'mc', 'emerg_equip', 'On the EMB 145, we have the following emergency equipment in the aircraft.', 'First Aid Kit, 2 PBEs, 2 H20 fire extinguishers.', '3 Halon fire extinguishers, 3 PBEs, 1 H20 fire extinguisher.', '4 flashlights, 50 life vests, 2 oxygen deploy tools.', 'The Enhanced Emergency Master Kit (EEMK)', 'b');
INSERT INTO `usedQuestions` VALUES(84, 111, 'mc', 'fire_prot', 'How does pulling a fire handle affect the hydraulic system?', 'Turns off the associated electric hydraulic pump  - if it is operating.', 'Has no effect on the hydraulic system.', 'Closes the associated hydraulic shutoff valve.', 'Shuts off all hydraulic pressure on the associated side.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 109, 'mc', 'fire_prot', 'How many smoke goggles are in the cockpit?', '1', '3', '0', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 107, 'tf', 'fire_prot', 'APU fire detection and protection is available when the aircraft is de-powered.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(84, 114, 'ac', 'fire_prot', 'Select the true statement regarding fire protection:', 'High pressure in the fire loop will trigger a FIRE warning message.', 'Low pressure in the fire loop will trigger a FIRE DET FAIL caution message.', 'APU fire detection and protection is available in essential power.', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 115, 'c2', 'fire_prot', 'The aircraft has a total of..', '1 Halon fire bottle for the APU', '1 Halon fire bottle for the lavatory.', '2 Halon fire bottles for the engines and 2 Halon fire bottles for the APU.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 104, 'mc', 'fire_prot', 'When a fire extinguishing handle is pulled:', 'The hydraulic shutoff valve is opened.', 'The respective engine fire bottle is discharged.', 'The engine will not shut down unless the thrust lever is in idle.', 'The fuel shutoff valve closes.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 108, 'tf', 'fire_prot', 'Engine fire protection is available when the aircraft is de-powered.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 110, 'ac', 'fire_prot', 'Pulling the fire extinguishing handle closes:', 'The engine bleed and lip anti-ice ice valves.', 'The fuel shutoff valve.', 'The hydraulic shutoff valve to the engine-driven fuel pump.', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 23, 'nc', 'fire_prot', 'If the lavatory halon bottle discharges:', 'The LAV SMOKE EICAS warning appears.', 'The LAV BOTTLE INOP EICAS warning appears.', 'The flight attendant hears a warning horn.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 113, 'mc', 'fire_prot', 'Which of the following messages would indicate a good fire test?', 'E1(2) Fire Det Fail.', 'E1(2) EXTBL A(B) INOP', 'APU Fire Loop Fail', 'Lav Smoke', 'a');
INSERT INTO `usedQuestions` VALUES(84, 105, 'mc', 'fire_prot', 'What is the first immediate action item (memory item) for an engine fire in flight?', 'Start/Stop Selector - STOP.', 'Fire extinguishing handle - PULL & ROTATE.', 'Thrust lever - IDLE.', 'Fire extinguishing handle - PULL, DO NOT ROTATE.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 112, 'c2', 'fire_prot', 'Pressing the APU fire extinguishing button:', 'Closes the APU fuel shutoff valve.', 'Discharges the APU fire bottle.', 'Shuts down the APU and discharges the fire extinguisher after a 10 second delay.', 'A and B are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 119, 'mc', 'flt_control', 'The gust lock prevents the movement of the:', 'Rudder.', 'Elevator', 'Ailerons.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(84, 132, 'mc', 'flt_control', 'The EICAS message "FLAP LOW SPEED"...', 'Indicates a mis-threading of the ball-screw actuator.', 'Indicates a failure of the flap velocity sensor.', 'Indicates a failure of the teleflex cable.', 'Indicates a flap motor failure.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 125, 'ac', 'flt_control', 'The requirements for the speedbrakes to be open are:', 'The flap lever has to be at 0 or 9 degrees.', 'The speedbrake lever has to be selected to OPEN.', 'A low TLA (thrust lever angle).', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 117, 'tf', 'flt_control', 'The rudder PCU is powered by both hydraulic systems below 135 knots.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(84, 138, 'mc', 'fuel', 'If the fuel boost bump fails:', 'The engine will eventually flame out due to lack of fuel.', 'The engine will continue to run, but at reduced thrust.', 'The engine will continue to run on boost pressure provided by the other two boost pumps.', 'The engine will continue to run by suction feed through a check valve.', 'c');
INSERT INTO `usedQuestions` VALUES(84, 137, 'tf', 'fuel', 'Crossfeeding will not inhibit transfer of fuel from the ventral tank to the wing tanks.', 'TRUE', 'FALSE', '', '', 'b');
INSERT INTO `usedQuestions` VALUES(84, 142, 'mc', 'fuel', 'Assuming useable fuel in an XR''s ventral tank, fuel transfer will automatically occur in the auto mode when ...', 'One wing tank reaches 1863 lbs.', 'The FMS shows fuel remaning on arrival of less thank 1800 lbs.', 'One wing tank reaches 4630 lbs + 30 seconds.', 'Both wing tanks reach 4630 lbs + 30 seconds.', 'd');
INSERT INTO `usedQuestions` VALUES(84, 139, 'mc', 'fuel', 'Selecting crossfeed to Low 1 will result in:', 'De-energizing the boost pumps in tank 1.', 'Closing the fuel shutoff value in tank 2.', 'Closing the fuel shutoff value in tank 1.', 'De-energizing the boost pumps in tank 2.', 'a');
INSERT INTO `usedQuestions` VALUES(85, 25, 'mc', 'air_condition', 'While flying in icing conditions at 2000 AGL in CLB thrust with packs selected ON:', 'Pack 1 is on, 2 is off.', 'Pack 2 is on, 1 is off.', 'Both packs are on.', 'All of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(85, 28, 'mc', 'air_condition', 'During a go-around at 200 AGL...', 'Pack 2 turns off.', 'Both packs stay on.', 'Both packs turn off.', 'Pack 1 turns off.', 'c');
INSERT INTO `usedQuestions` VALUES(86, 146, 'mc', 'hydraulics', 'In normal cruise flight conditions, the electric hydraulic pumps are producing:', '3000 psi.', '2900 psi.', '0 psi.', '1600 psi.', 'c');
INSERT INTO `usedQuestions` VALUES(86, 147, 'mc', 'hydraulics', 'If hydraulic system 1 loses all pressure during flight, the nose wheel doors:', 'Extend normally using the gear handle.', 'Are held up by a mechanical uplock.', 'Freefall (freefall).', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(86, 150, 'mc', 'hydraulics', 'The electric hydraulic pump control knob in the ON position:', 'Turns on the electric pump only if the engine is shut down.', 'Turns on the electric pump regardless of system pressure.', 'Places the electric hydraulic pump in a standby condition.', 'Turns on the electric hydraulic pump only if system pressure is lost.', 'b');
INSERT INTO `usedQuestions` VALUES(86, 248, 'mc', 'pneum', '14th stage air is used for all of the above except...', 'Low power settings.', 'Cross-bleed starts.', 'External air starts.', 'None of the above.', 'c');
INSERT INTO `usedQuestions` VALUES(86, 241, 'mc', 'pneum', 'With the APU off and the APU bleed button selected OPEN, the button has:', 'A line and an OPEN inscription.', 'A line, no OPEN inscription.', 'No line, no open inscription.', 'None of the above.', 'b');
INSERT INTO `usedQuestions` VALUES(87, 148, 'c2', 'hydraulics', 'What does the AUTO position of the electric hydraulic pump knob provide?', 'The pump is kept in standby until the engine driven pump pressure drops below a set value.', 'The pump does not operate unless the ON position is selected.', 'The pump is kept in standby until the asociated engine N2 drops below a set value.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(87, 154, 'nc', 'hydraulics', 'The hydraulic accumulator #1 provides pressure for:', 'Emergency brakes.', 'Nosewheel steering.', 'Ailerons and rudder should all presure be lost.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(87, 152, 'nc', 'hydraulics', 'The hydraulic system quantity can be monitored on the:', 'EICAS.', 'The RMU Engine page 1.', 'MFD ECS/AI page.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(87, 244, 'c2', 'pneum', 'Engine bleed air is used from:', 'The 9th compressor stage at higher thrust settings.', 'The 14th stage compressor only.', 'The 14th compressor stage in icing conditions.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(87, 242, 'mc', 'pneum', 'In normal cruise flight conditions, the crossbleed knob is in ___ and the crossbleed valve ___.', 'AUTO, closed.', 'OPEN, open.', 'CLOSED, closed.', 'All of the above.', 'a');
INSERT INTO `usedQuestions` VALUES(87, 245, 'tf', 'pneum', 'While taxiing in ground icing conditions, the APU bleed may be used to supply air to the packs.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(88, 148, 'c2', 'hydraulics', 'What does the AUTO position of the electric hydraulic pump knob provide?', 'The pump does not operate unless the ON position is selected.', 'The pump is kept in standby until the engine driven pump pressure drops below a set value.', 'The pump is kept in standby until the asociated engine N2 drops below a set value.', 'B and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(88, 151, 'mc', 'hydraulics', 'Hydraulic system 1 provides pressure to:', 'The nose-wheel steering.', 'The inboard flaps.', 'The parking brake.', 'The rudder above 135 KIAS.', 'a');
INSERT INTO `usedQuestions` VALUES(88, 154, 'nc', 'hydraulics', 'The hydraulic accumulator #1 provides pressure for:', 'Emergency brakes.', 'Nosewheel steering.', 'Ailerons and rudder should all presure be lost.', 'None of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(88, 245, 'tf', 'pneum', 'While taxiing in ground icing conditions, the APU bleed may be used to supply air to the packs.', 'TRUE', 'FALSE', '', '', 'a');
INSERT INTO `usedQuestions` VALUES(88, 244, 'c2', 'pneum', 'Engine bleed air is used from:', 'The 9th compressor stage at higher thrust settings.', 'The 14th stage compressor only.', 'The 14th compressor stage in icing conditions.', 'A and C are correct.', 'd');
INSERT INTO `usedQuestions` VALUES(88, 246, 'ac', 'pneum', 'During a bleed leak.', 'Hot bleed air is escaping from the bleed lines.', 'A red "LEAK" inscription appears on the pneumatic panel.', 'The engine bleed valve should automatically close.', 'All of the above.', 'd');
INSERT INTO `usedQuestions` VALUES(89, 270, 'mc', 'pressurization', 'The maximum altitude with one PACK inoperative is:', '25,000''.', '24,600''.', '14,000'' +/- 500''.', '1700'' AGL.', 'a');
INSERT INTO `usedQuestions` VALUES(89, 269, 'mc', 'pressurization', 'The purpose of the FADEC/Pressurization static port is to:', 'Underpressure/overpressure relief should the cabin exceed 8.1 PSI or -0.3 PSI.', 'Provide static information to the ADCs.', 'Provide static information to the CPAM.', 'Provide static information to the standby airspeed and standby altimeter/ISIS.', 'a');
INSERT INTO `usedQuestions` VALUES(89, 274, 'c2', 'pressurization', 'The "Dump" button on the automatic pressurization controller:', 'Is not useable in manual pressurization mode.', 'Depressurizes the cabin to a maximum of 14,500 ft.', 'Will depressurize up to FL370.', 'A and B are correct.', 'd');
