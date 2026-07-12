-- Entirely synthetic rows. Tables containing people, credentials, attempts,
-- results, generated tests, or generated snapshots intentionally receive none.

INSERT INTO `TPO` (`tpo_id`, `tpo_number`, `tpo_name`) VALUES
  (1, 100, _latin1 0x53796e74686574696320636166e920637572726963756c756d20726f6f74);

INSERT INTO `SPO` (`spo_id`, `tpo_id`, `spo_number`, `spo_name`) VALUES
  (10, 1, 110, 'Synthetic objective alpha'),
  (20, 1, 120, 'Synthetic objective beta'),
  (99, 999, 199, 'Synthetic orphan objective');

INSERT INTO `EO` (`eo_id`, `spo_id`, `eo_no`, `element_name`) VALUES
  (101, 10, 1, 'Synthetic element alpha one'),
  (102, 10, 2, 'Synthetic element alpha two'),
  (201, 20, 1, 'Synthetic element beta one'),
  (299, 999, 9, 'Synthetic orphan element');

INSERT INTO `variant` (`variant_id`, `variant_name`) VALUES
  (1, 'SYN-A'),
  (2, 'SYN-B');

INSERT INTO `questions`
  (`questionID`, `category`, `subcategory`, `spo_id`, `eo_id`, `variant_id`,
   `type`, `correct_answer`, `alt_correct_answer`, `last_correct_answer`,
   `ans_x`, `ans_y`, `ans_z`, `question_a`, `question_b`) VALUES
  (1001, 'synthetic', 'alpha', 10, 101, 1, 'tf', 'true', NULL, NULL,
   NULL, NULL, NULL, 'Synthetic true or false prompt 1001?', NULL),
  (1002, 'synthetic', 'alpha', 10, 101, 1, 'mc', 'Synthetic choice 1002-C', NULL, NULL,
   'Synthetic choice 1002-X', 'Synthetic choice 1002-Y', 'Synthetic choice 1002-Z',
   'Synthetic single-answer prompt 1002?', 'Synthetic alternate prompt 1002?'),
  (1003, 'synthetic', 'alpha', 10, 102, 1, 'c2', 'Synthetic choice 1003-C1',
   'Synthetic choice 1003-C2', NULL, 'Synthetic choice 1003-X', NULL, NULL,
   'Synthetic compound prompt 1003?', NULL),
  (1004, 'synthetic', 'beta', 20, 201, 2, 'ac', 'Synthetic choice 1004-C1',
   'Synthetic choice 1004-C2', 'Synthetic choice 1004-C3', NULL, NULL, NULL,
   'Synthetic all-correct prompt 1004?', NULL),
  (1005, 'synthetic', 'beta', 20, 201, 2, 'nc', NULL, NULL, NULL,
   'Synthetic choice 1005-X1', 'Synthetic choice 1005-X2', 'Synthetic choice 1005-X3',
   'Synthetic none-correct prompt 1005?', NULL),
  (1006, 'synthetic', 'unmapped', 0, 0, 1, 'mc', 'Synthetic choice 1006-C', NULL, NULL,
   'Synthetic choice 1006-X', 'Synthetic choice 1006-Y', 'Synthetic choice 1006-Z',
   'Synthetic zero-sentinel prompt 1006?', NULL),
  (1007, 'synthetic', 'mismatch', 10, 201, 1, 'mc', 'Synthetic choice 1007-C', NULL, NULL,
   'Synthetic choice 1007-X', 'Synthetic choice 1007-Y', 'Synthetic choice 1007-Z',
   'Synthetic parent-mismatch prompt 1007?', NULL),
  (1008, 'synthetic', 'alpha', 10, 101, 1, 'mc', 'Synthetic choice 1002-C', NULL, NULL,
   'Synthetic choice 1002-X', 'Synthetic choice 1002-Y', 'Synthetic choice 1002-Z',
   'Synthetic single-answer prompt 1002?', 'Synthetic alternate prompt 1002?');

INSERT INTO `test_model`
  (`testID`, `course_type`, `length`, `air_condition`, `acft_gen`, `apu`,
   `autopilot`, `crew_awareness`, `elec`, `emerg_equip`, `fire_prot`,
   `flt_control`, `fuel`, `hydraulics`, `ice_rain_prot`, `ldg_gear_brk`,
   `lighting`, `limitations`, `oxy`, `performance`, `pneum`, `powerplant`,
   `pressurization`, `profiles`, `radar`, `stall_prot`, `mandatory`) VALUES
  (501, 'SYNTH', 5, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
   0, 0, 0, 0, 0, 0, 0, 1);

INSERT INTO `testModel`
  (`test_model_id`, `variant_id`, `spo_id`, `count`, `eo_id`, `course_type`,
   `test_length`, `name`) VALUES
  ('SYN001', 1, 10, 3, NULL, 'SYNTH', '5', 'Synthetic model'),
  ('SYN001', 1, 20, 2, NULL, 'SYNTH', '5', 'Synthetic model'),
  ('SYN001', 1, 10, NULL, 101, 'SYNTH', '5', 'Synthetic model');
