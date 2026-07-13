export interface TaskModelingCase {
	id: string;
	legacyEvidence: readonly string[];
	targetAssertion: string;
	rejectLegacyDefect?: boolean;
}

export const TASK_MODELING_CASES: readonly TaskModelingCase[] = Object.freeze([
	{
		id: 'read-hierarchy',
		legacyEvidence: [
			'PHPScripts/getPhases.php',
			'PHPScripts/getTasks.php',
			'PHPScripts/getSubtasks.php',
			'PHPScripts/getElements.php'
		],
		targetAssertion: 'guarded deterministic Phase Task Subtask Element hierarchy'
	},
	...(['phase', 'task', 'subtask', 'element'] as const).flatMap((level) => [
		{
			id: `create-${level}`,
			legacyEvidence: [`PHPScripts/create${level[0]!.toUpperCase()}${level.slice(1)}.php`],
			targetAssertion: 'authorized UUID identity plus initial draft in one transaction'
		},
		{
			id: `edit-${level}`,
			legacyEvidence: [`PHPScripts/update${level[0]!.toUpperCase()}${level.slice(1)}.php`],
			targetAssertion: 'draft-only version edit without published mutation'
		}
	]),
	{
		id: 'reorder-siblings',
		legacyEvidence: ['taskModeling.php', 'Task Analysis Planning/prototyping.md'],
		targetAssertion: 'contiguous collision-free transactional complete sibling reorder'
	},
	{
		id: 'bloom-selection',
		legacyEvidence: [
			'Classes/blooms.php',
			'PHPScripts/getBlooms.php',
			'PHPScripts/getBloomsVerbs.php'
		],
		targetAssertion: 'managed empty-start controlled vocabulary without guessed rows'
	},
	{
		id: 'safe-draft-delete',
		legacyEvidence: ['PHPScripts/deleteElement.php'],
		targetAssertion: 'hard deletion only for safely unreferenced drafts'
	},
	{
		id: 'retire-published-or-referenced',
		legacyEvidence: ['taskModeling.php'],
		targetAssertion: 'retirement replaces destructive deletion',
		rejectLegacyDefect: true
	},
	{
		id: 'parent-dependency-warning',
		legacyEvidence: ['taskModeling.php'],
		targetAssertion: 'server-derived dependency kinds counts and freshness revision',
		rejectLegacyDefect: true
	},
	{
		id: 'invalid-fields',
		legacyEvidence: ['Classes/task.php', 'PHPScripts/createTask.php'],
		targetAssertion: 'field-safe server validation with no write',
		rejectLegacyDefect: true
	},
	{
		id: 'authorization-denial',
		legacyEvidence: ['taskModeling.php', 'PHPScripts/createTask.php'],
		targetAssertion: 'real curriculum.manage route and mutation guard',
		rejectLegacyDefect: true
	},
	{
		id: 'atomic-rollback',
		legacyEvidence: ['Classes/task.php'],
		targetAssertion: 'outer transaction rolls back domain audit and reorder writes',
		rejectLegacyDefect: true
	}
]);

export const REJECTED_LEGACY_DEFECTS = Object.freeze([
	'unauthenticated task-modeling access',
	'hard deletion of referenced content',
	'missing server validation',
	'guessed legacy-to-future mappings',
	'client-side-only authorization',
	'partial reorder writes',
	'malformed content-bearing errors',
	'invented fixed vocabulary'
]);
