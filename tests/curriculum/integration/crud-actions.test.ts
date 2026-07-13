import { randomUUID } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	actions,
	load as loadHierarchy
} from '../../../src/routes/admin/curriculum/+page.server.js';
import {
	BASELINE_ROLES,
	ROLE_PERMISSION_POLICY,
	type AuthenticatedPrincipal
} from '../../../src/lib/server/authorization/index.js';
import type {
	BloomLevelDto,
	CurriculumHierarchyDto,
	DependencyWarningResult
} from '../../../src/lib/server/curriculum/index.js';
import { openDatabase, type DatabaseHandle } from '../../../src/lib/server/db/index.js';

let database: DatabaseHandle;
let manager: AuthenticatedPrincipal;

function insertUser(id: string): void {
	const now = new Date().toISOString();
	database.sqlite
		.prepare(
			`INSERT INTO users
			 (id, employee_number, first_name, last_name, status, created_at, updated_at)
			 VALUES (?, ?, 'Route', 'Manager', 'active', ?, ?)`
		)
		.run(id, id.slice(-8), now, now);
}

function request(action: string, entries: readonly (readonly [string, string])[]): Request {
	const body = new FormData();
	for (const [name, value] of entries) body.append(name, value);
	return new Request(`https://local.invalid/admin/curriculum?/${action}`, {
		method: 'POST',
		body
	});
}

async function invoke(
	name: keyof typeof actions,
	entries: readonly (readonly [string, string])[]
): Promise<Record<string, unknown>> {
	const action = actions[name];
	if (!action) throw new Error(`Missing ${String(name)} action.`);
	const result = await action({
		locals: { principal: manager, database },
		request: request(String(name), entries)
	} as never);
	expect(result).toMatchObject({ success: true, operation: name });
	return result as Record<string, unknown>;
}

async function hierarchy() {
	return (await loadHierarchy({
		locals: { principal: manager, database }
	} as never)) as {
		hierarchy: CurriculumHierarchyDto;
		bloomLevels: BloomLevelDto[];
		dependencyWarnings: DependencyWarningResult[];
	};
}

beforeEach(() => {
	database = openDatabase({ path: ':memory:' });
	const userId = randomUUID();
	insertUser(userId);
	manager = {
		userId,
		employeeNumber: userId.slice(-8),
		displayName: 'Route Manager',
		roles: [BASELINE_ROLES.CURRICULUM_MANAGER],
		permissions: new Set(ROLE_PERMISSION_POLICY.curriculum_manager),
		sessionIdHash: 'a'.repeat(64)
	};
});

afterEach(() => database.close());

describe('protected hierarchy action integration', () => {
	it('creates, reads, edits, reorders, and safely deletes through real route actions', async () => {
		await invoke('createNode', [
			['type', 'phase'],
			['name', 'Ground']
		]);
		let current = await hierarchy();
		const phase = current.hierarchy.phases[0]!.node;

		await invoke('createNode', [
			['type', 'task'],
			['parentVersionId', phase.latestVersion.id],
			['name', 'Electrical']
		]);
		current = await hierarchy();
		const task = current.hierarchy.phases[0]!.tasks[0]!.node;

		await invoke('createNode', [
			['type', 'subtask'],
			['parentVersionId', task.latestVersion.id],
			['name', 'Distribution']
		]);
		current = await hierarchy();
		const subtask = current.hierarchy.phases[0]!.tasks[0]!.subtasks[0]!.node;

		await invoke('createNode', [
			['type', 'element'],
			['parentVersionId', subtask.latestVersion.id],
			['name', 'Identify buses']
		]);
		current = await hierarchy();
		const element = current.hierarchy.phases[0]!.tasks[0]!.subtasks[0]!.elements[0]!;

		await invoke('updateDraft', [
			['versionId', element.latestVersion.id],
			['expectedVersion', '1'],
			['name', 'Identify essential buses'],
			['description', 'Updated through the protected route action.']
		]);
		await invoke('createNode', [
			['type', 'phase'],
			['name', 'Flight']
		]);
		current = await hierarchy();
		const ordered = current.hierarchy.phases.map((item) => item.node.latestVersion.id).reverse();
		await invoke('reorderSiblings', [
			['nodeType', 'phase'],
			['expectedOrderRevision', current.hierarchy.rootOrderRevision],
			...ordered.map((id) => ['orderedVersionIds', id] as const),
			['focusId', `node-${ordered[0]}`]
		]);

		current = await hierarchy();
		expect(current.hierarchy.phases.map((item) => item.node.latestVersion.name)).toEqual([
			'Flight',
			'Ground'
		]);
		const updated = current.hierarchy.phases[1]!.tasks[0]!.subtasks[0]!.elements[0]!;
		expect(updated.latestVersion.name).toBe('Identify essential buses');
		const deletion = current.dependencyWarnings.find(
			(warning) => warning.entityId === updated.id && warning.operation === 'delete'
		)!;
		expect(deletion.blocksHardDelete).toBe(false);

		await invoke('deleteDraft', [
			['versionId', updated.latestVersion.id],
			['expectedDependencyRevision', deletion.revision],
			['confirmed', 'yes']
		]);
		current = await hierarchy();
		expect(current.hierarchy.phases[1]!.tasks[0]!.subtasks[0]!.elements).toEqual([]);
		expect(
			database.sqlite
				.prepare("SELECT COUNT(*) FROM audit_events WHERE action LIKE 'curriculum.%'")
				.pluck()
				.get()
		).toBe(8);
	});
});
