import { createHash, randomUUID } from 'node:crypto';

import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db/database.js';
import { recordAuditEvent } from '$lib/server/audit/index.js';
import {
	NODE_TABLES,
	editableSiblings,
	findBloomLevel,
	findBloomVerb,
	findVersion,
	identityVersionCount,
	latestNodes,
	listBloomVocabulary,
	maxVersion
} from './repository.js';
import type {
	BloomDeleteCommand,
	BloomLevelDto,
	BloomRetireCommand,
	BloomVerbDto,
	CreateDraftVersionCommand,
	CreateNodeCommand,
	CurriculumErrorCode,
	CurriculumHierarchyDto,
	CurriculumMutationResult,
	CurriculumNodeDto,
	CurriculumNodeType,
	CurriculumServiceDependencies,
	CurriculumVersionDto,
	DeleteDraftCommand,
	DependencyKind,
	DependencyWarningItem,
	DependencyWarningResult,
	PublishVersionCommand,
	ReorderResult,
	ReorderSiblingsCommand,
	RetireVersionCommand,
	ReviewVersionCommand,
	UpdateDraftVersionCommand,
	UpsertBloomLevelCommand,
	UpsertBloomVerbCommand
} from './types.js';
import { date, errors, integer, text, uuid } from './validation.js';

const PARENT_TYPE: Record<CurriculumNodeType, CurriculumNodeType | null> = {
	phase: null,
	task: 'phase',
	subtask: 'task',
	element: 'subtask'
};
const AUDIT = {
	created: 'curriculum.node.created',
	versionCreated: 'curriculum.version.created',
	updated: 'curriculum.version.updated',
	submitted: 'curriculum.version.submitted',
	reviewed: 'curriculum.version.reviewed',
	returned: 'curriculum.version.returned',
	published: 'curriculum.version.published',
	retired: 'curriculum.version.retired',
	deleted: 'curriculum.version.deleted',
	reordered: 'curriculum.siblings.reordered'
} as const;

function revision(parts: unknown): string {
	return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

function failure(error: CurriculumErrorCode) {
	return { ok: false as const, error };
}

function fields(validation: readonly { field: string; message: string }[]) {
	return { ok: false as const, error: 'invalid_input' as const, fields: validation };
}

function orderRevision(rows: readonly { id: string }[]): string {
	return revision(rows.map((row) => row.id));
}

function containsRange(parent: CurriculumVersionDto, start: string, end: string | null): boolean {
	if (!parent.effectiveFrom || parent.effectiveFrom > start) return false;
	if (parent.effectiveTo === null) return true;
	if (end === null) return false;
	return parent.effectiveTo >= end;
}

export class CurriculumService {
	constructor(
		private readonly database: DatabaseHandle,
		private readonly dependencies: CurriculumServiceDependencies
	) {}

	hierarchy(options: { publishedOnly?: boolean } = {}): CurriculumHierarchyDto {
		const now = this.dependencies.clock.now().toISOString();
		const publishedOnly = options.publishedOnly ?? false;
		const phases = latestNodes(this.database.db, 'phase', { publishedOnly, now });
		const tasks = latestNodes(this.database.db, 'task', { publishedOnly, now });
		const subtasks = latestNodes(this.database.db, 'subtask', { publishedOnly, now });
		const elements = latestNodes(this.database.db, 'element', { publishedOnly, now });
		const validElements = elements.filter((element) =>
			subtasks.some((parent) => parent.latestVersion.id === element.latestVersion.parentVersionId)
		);
		const validSubtasks = subtasks.filter((subtask) =>
			tasks.some((parent) => parent.latestVersion.id === subtask.latestVersion.parentVersionId)
		);
		const validTasks = tasks.filter((task) =>
			phases.some((parent) => parent.latestVersion.id === task.latestVersion.parentVersionId)
		);
		return {
			generatedAt: now,
			rootOrderRevision: orderRevision(
				phases
					.filter((node) => node.latestVersion.status === 'draft')
					.map((node) => ({ id: node.latestVersion.id }))
			),
			phases: phases.map((phase) => {
				const children = validTasks.filter(
					(task) => task.latestVersion.parentVersionId === phase.latestVersion.id
				);
				return {
					node: phase,
					childrenOrderRevision: orderRevision(
						children
							.filter((node) => node.latestVersion.status === 'draft')
							.map((node) => ({ id: node.latestVersion.id }))
					),
					tasks: children.map((task) => {
						const taskChildren = validSubtasks.filter(
							(subtask) => subtask.latestVersion.parentVersionId === task.latestVersion.id
						);
						return {
							node: task,
							childrenOrderRevision: orderRevision(
								taskChildren
									.filter((node) => node.latestVersion.status === 'draft')
									.map((node) => ({ id: node.latestVersion.id }))
							),
							subtasks: taskChildren.map((subtask) => {
								const subtaskChildren = validElements.filter(
									(element) => element.latestVersion.parentVersionId === subtask.latestVersion.id
								);
								return {
									node: subtask,
									childrenOrderRevision: orderRevision(
										subtaskChildren
											.filter((node) => node.latestVersion.status === 'draft')
											.map((node) => ({ id: node.latestVersion.id }))
									),
									elements: subtaskChildren
								};
							})
						};
					})
				};
			})
		};
	}

	listBloomVocabulary(): readonly BloomLevelDto[] {
		return listBloomVocabulary(this.database.db);
	}

	dependencyPreview(
		entityType: CurriculumNodeType | 'bloom_level' | 'bloom_verb',
		entityId: string,
		operation: DependencyWarningResult['operation']
	): DependencyWarningResult {
		return this.preview(this.database.db, entityType, entityId, operation);
	}

	createNode(
		actorUserId: string,
		command: CreateNodeCommand
	): CurriculumMutationResult<CurriculumNodeDto> {
		if (!Object.hasOwn(NODE_TABLES, command.type))
			return fields([{ field: 'type', message: 'Select a valid node type.' }]);
		const name = text('name', command.name, { required: true, max: 200 });
		const description = text('description', command.description, { required: false, max: 2_000 });
		const parentId = uuid('parentVersionId', command.parentVersionId, command.type === 'phase');
		const bloomId = uuid('bloomVerbId', command.bloomVerbId, true);
		const position = integer('position', command.position, { min: 0, optional: true });
		const validation = errors(name, description, parentId, bloomId, position);
		if (validation.length) return fields(validation);
		if (command.type === 'element' && bloomId.value !== null) {
			return fields([{ field: 'bloomVerbId', message: 'Elements cannot select a Bloom verb.' }]);
		}
		try {
			return this.database.transaction((tx) => {
				if (!this.validParent(tx, command.type, parentId.value))
					return failure('parent_chain_invalid');
				if (!this.validBloomSelection(tx, command.type, bloomId.value, parentId.value, false)) {
					return fields([{ field: 'bloomVerbId', message: 'Select an available Bloom verb.' }]);
				}
				const siblings = latestNodes(tx, command.type, {
					publishedOnly: false,
					now: this.dependencies.clock.now().toISOString()
				}).filter((node) => node.latestVersion.parentVersionId === parentId.value);
				const requested = position.value ?? siblings.length;
				if (requested > siblings.length) {
					return fields([{ field: 'position', message: 'Select a valid sibling position.' }]);
				}
				if (
					requested !== siblings.length &&
					siblings.some((item) => item.latestVersion.status !== 'draft')
				)
					return failure('referenced_immutable');
				const id = this.dependencies.ids.create();
				const versionId = this.dependencies.ids.create();
				const occurredAt = this.dependencies.clock.now();
				const timestamp = occurredAt.toISOString();
				const table = NODE_TABLES[command.type];
				tx.$client
					.prepare(`INSERT INTO ${table.identity} (id, created_at) VALUES (?, ?)`)
					.run(id, timestamp);
				this.insertVersion(tx, command.type, {
					id: versionId,
					nodeId: id,
					parentVersionId: parentId.value,
					version: 1,
					name: name.value!,
					description: description.value,
					position: siblings.length,
					bloomVerbId: bloomId.value,
					actorUserId,
					timestamp
				});
				if (requested !== siblings.length) {
					const ordered = siblings.map((item) => item.latestVersion.id);
					ordered.splice(requested, 0, versionId);
					this.writePositions(tx, command.type, ordered);
				}
				this.audit(tx, actorUserId, AUDIT.created, command.type, id, occurredAt, {
					nodeType: command.type,
					version: 1,
					status: 'draft',
					position: requested
				});
				return { ok: true, value: findVersion(tx, versionId)!.node };
			});
		} catch {
			return failure('unavailable');
		}
	}

	createDraftVersion(
		actorUserId: string,
		command: CreateDraftVersionCommand
	): CurriculumMutationResult<CurriculumNodeDto> {
		const ids = errors(
			uuid('nodeId', command.nodeId),
			uuid('fromVersionId', command.fromVersionId)
		);
		if (ids.length) return fields(ids);
		try {
			return this.database.transaction((tx) => {
				const source = findVersion(tx, command.fromVersionId);
				if (!source || source.node.id !== command.nodeId) return failure('not_found');
				if (source.node.retiredAt !== null || source.node.latestVersion.status === 'retired')
					return failure('invalid_transition');
				if (source.node.latestVersion.status !== 'published') return failure('invalid_transition');
				const table = NODE_TABLES[source.type];
				if (
					tx.$client
						.prepare(
							`SELECT 1 FROM ${table.version} WHERE ${table.identityKey} = ? AND status IN ('draft', 'review')`
						)
						.get(command.nodeId)
				)
					return failure('conflict');
				const versionId = this.dependencies.ids.create();
				const occurredAt = this.dependencies.clock.now();
				const position = source.node.latestVersion.position;
				this.insertVersion(tx, source.type, {
					id: versionId,
					nodeId: command.nodeId,
					parentVersionId: source.node.latestVersion.parentVersionId,
					version: maxVersion(tx, source.type, command.nodeId) + 1,
					name: source.node.latestVersion.name,
					description: source.node.latestVersion.description,
					position,
					bloomVerbId: source.node.latestVersion.bloomVerbId,
					actorUserId,
					timestamp: occurredAt.toISOString()
				});
				const created = findVersion(tx, versionId)!.node;
				this.audit(tx, actorUserId, AUDIT.versionCreated, source.type, command.nodeId, occurredAt, {
					nodeType: source.type,
					version: created.latestVersion.version,
					status: 'draft',
					position: created.latestVersion.position
				});
				return { ok: true, value: created };
			});
		} catch {
			return failure('unavailable');
		}
	}

	updateDraftVersion(
		actorUserId: string,
		command: UpdateDraftVersionCommand
	): CurriculumMutationResult<CurriculumNodeDto> {
		const versionId = uuid('versionId', command.versionId);
		const name = text('name', command.name, { required: true, max: 200 });
		const description = text('description', command.description, { required: false, max: 2_000 });
		const bloomId = uuid('bloomVerbId', command.bloomVerbId, true);
		const parentId = uuid('parentVersionId', command.parentVersionId, true);
		const validation = errors(versionId, name, description, bloomId, parentId);
		if (validation.length) return fields(validation);
		try {
			return this.database.transaction((tx) => {
				const found = findVersion(tx, command.versionId);
				if (!found) return failure('not_found');
				const before = found.node.latestVersion;
				if (before.status !== 'draft') return failure('referenced_immutable');
				if (before.version !== command.expectedVersion) return failure('stale_version');
				if (found.type === 'element' && bloomId.value !== null)
					return fields([
						{ field: 'bloomVerbId', message: 'Elements cannot select a Bloom verb.' }
					]);
				const newParent =
					command.parentVersionId === undefined ? before.parentVersionId : parentId.value;
				if (!this.validParent(tx, found.type, newParent)) return failure('parent_chain_invalid');
				if (newParent !== before.parentVersionId) {
					const preview = this.preview(tx, found.type, found.node.id, 'parent_change');
					if (
						!command.expectedDependencyRevision ||
						command.expectedDependencyRevision !== preview.revision
					)
						return failure('dependency_changed');
				}
				if (
					!this.validBloomSelection(
						tx,
						found.type,
						bloomId.value,
						newParent,
						bloomId.value === before.bloomVerbId
					)
				)
					return fields([{ field: 'bloomVerbId', message: 'Select an available Bloom verb.' }]);
				const table = NODE_TABLES[found.type];
				if (newParent !== before.parentVersionId && table.parentKey) {
					const oldSiblings = editableSiblings(tx, found.type, before.parentVersionId)
						.filter((item) => item.id !== command.versionId)
						.map((item) => item.id);
					const newSiblings = editableSiblings(tx, found.type, newParent).map((item) => item.id);
					const targetPosition = Math.min(before.position, newSiblings.length);
					tx.$client
						.prepare(`UPDATE ${table.version} SET position = position + 10000000 WHERE id = ?`)
						.run(command.versionId);
					tx.$client
						.prepare(`UPDATE ${table.version} SET ${table.parentKey} = ? WHERE id = ?`)
						.run(newParent, command.versionId);
					this.writePositions(tx, found.type, oldSiblings);
					newSiblings.splice(targetPosition, 0, command.versionId);
					this.writePositions(tx, found.type, newSiblings);
				}
				const sets = ['name = ?', 'description = ?'];
				const values: unknown[] = [name.value, description.value];
				if (found.type !== 'element') {
					sets.push('bloom_verb_id = ?');
					values.push(bloomId.value);
				}
				if (table.parentKey && newParent === before.parentVersionId) {
					sets.push(`${table.parentKey} = ?`);
					values.push(newParent);
				}
				values.push(command.versionId);
				tx.$client
					.prepare(`UPDATE ${table.version} SET ${sets.join(', ')} WHERE id = ?`)
					.run(...values);
				const occurredAt = this.dependencies.clock.now();
				this.audit(tx, actorUserId, AUDIT.updated, found.type, found.node.id, occurredAt, {
					nodeType: found.type,
					version: before.version,
					status: 'draft',
					changedFields: ['name', 'description', 'parentVersionId', 'bloomVerbId']
				});
				return { ok: true, value: findVersion(tx, command.versionId)!.node };
			});
		} catch {
			return failure('unavailable');
		}
	}

	submitForReview(
		actorUserId: string,
		versionId: string
	): CurriculumMutationResult<CurriculumNodeDto> {
		return this.lifecycle(actorUserId, versionId, 'draft', 'review', AUDIT.submitted);
	}

	reviewVersion(
		actorUserId: string,
		command: ReviewVersionCommand
	): CurriculumMutationResult<CurriculumNodeDto> {
		const rationale = text('rationale', command.rationale, { required: true, max: 2_000 });
		const validation = errors(uuid('versionId', command.versionId), rationale);
		if (validation.length) return fields(validation);
		if (command.decision !== 'approve' && command.decision !== 'return')
			return fields([{ field: 'decision', message: 'Select a valid review decision.' }]);
		try {
			return this.database.transaction((tx) => {
				const found = findVersion(tx, command.versionId);
				if (!found) return failure('not_found');
				const version = found.node.latestVersion;
				if (version.status !== 'review') return failure('invalid_transition');
				if (version.authoredByUserId === actorUserId) return failure('distinct_reviewer_required');
				const occurredAt = this.dependencies.clock.now();
				const nextStatus = command.decision === 'return' ? 'draft' : 'review';
				const reviewedBy = command.decision === 'approve' ? actorUserId : null;
				const reviewedAt = command.decision === 'approve' ? occurredAt.toISOString() : null;
				tx.$client
					.prepare(
						`UPDATE ${NODE_TABLES[found.type].version} SET status = ?, reviewed_by_user_id = ?, reviewed_at = ? WHERE id = ?`
					)
					.run(nextStatus, reviewedBy, reviewedAt, command.versionId);
				this.audit(
					tx,
					actorUserId,
					command.decision === 'approve' ? AUDIT.reviewed : AUDIT.returned,
					found.type,
					found.node.id,
					occurredAt,
					{
						nodeType: found.type,
						version: version.version,
						status: nextStatus,
						decision: command.decision
					}
				);
				return { ok: true, value: findVersion(tx, command.versionId)!.node };
			});
		} catch {
			return failure('unavailable');
		}
	}

	publishVersion(
		actorUserId: string,
		command: PublishVersionCommand
	): CurriculumMutationResult<CurriculumNodeDto> {
		const start = date('effectiveFrom', command.effectiveFrom);
		const end = date('effectiveTo', command.effectiveTo, true);
		const validation = errors(uuid('versionId', command.versionId), start, end);
		if (validation.length) return fields(validation);
		if (end.value && start.value! >= end.value) return failure('effective_range_invalid');
		try {
			return this.database.transaction((tx) => {
				const found = findVersion(tx, command.versionId);
				if (!found) return failure('not_found');
				const version = found.node.latestVersion;
				if (version.status !== 'review') return failure('invalid_transition');
				if (!version.reviewedByUserId || !version.reviewedAt)
					return failure('distinct_reviewer_required');
				if (version.authoredByUserId === actorUserId) return failure('distinct_reviewer_required');
				if (
					!this.publishedParentChain(
						tx,
						found.type,
						version.parentVersionId,
						start.value!,
						end.value
					)
				)
					return failure('parent_not_published');
				if (
					!this.validBloomSelection(
						tx,
						found.type,
						version.bloomVerbId,
						version.parentVersionId,
						false
					)
				)
					return failure('parent_chain_invalid');
				const occurredAt = this.dependencies.clock.now();
				tx.$client
					.prepare(
						`UPDATE ${NODE_TABLES[found.type].version} SET status = 'published', effective_from = ?, effective_to = ?, published_at = ? WHERE id = ?`
					)
					.run(start.value, end.value, occurredAt.toISOString(), command.versionId);
				this.audit(tx, actorUserId, AUDIT.published, found.type, found.node.id, occurredAt, {
					nodeType: found.type,
					version: version.version,
					status: 'published'
				});
				return { ok: true, value: findVersion(tx, command.versionId)!.node };
			});
		} catch {
			return failure('unavailable');
		}
	}

	retireVersion(
		actorUserId: string,
		command: RetireVersionCommand
	): CurriculumMutationResult<CurriculumNodeDto> {
		const reason = text('reason', command.reason, { required: true, max: 2_000 });
		const validation = errors(uuid('versionId', command.versionId), reason);
		if (validation.length) return fields(validation);
		try {
			return this.database.transaction((tx) => {
				const found = findVersion(tx, command.versionId);
				if (!found) return failure('not_found');
				if (found.node.latestVersion.status !== 'published') return failure('invalid_transition');
				if (maxVersion(tx, found.type, found.node.id) !== found.node.latestVersion.version)
					return failure('conflict');
				const preview = this.preview(tx, found.type, found.node.id, 'retire');
				if (preview.revision !== command.expectedDependencyRevision)
					return failure('dependency_changed');
				const occurredAt = this.dependencies.clock.now();
				const at = occurredAt.toISOString();
				tx.$client
					.prepare(
						`UPDATE ${NODE_TABLES[found.type].version} SET status = 'retired', retired_at = ? WHERE id = ?`
					)
					.run(at, command.versionId);
				tx.$client
					.prepare(`UPDATE ${NODE_TABLES[found.type].identity} SET retired_at = ? WHERE id = ?`)
					.run(at, found.node.id);
				this.audit(tx, actorUserId, AUDIT.retired, found.type, found.node.id, occurredAt, {
					nodeType: found.type,
					version: found.node.latestVersion.version,
					status: 'retired',
					reason: 'reviewed_dependency_preview'
				});
				return { ok: true, value: findVersion(tx, command.versionId)!.node };
			});
		} catch {
			return failure('unavailable');
		}
	}

	deleteDraft(
		actorUserId: string,
		command: DeleteDraftCommand
	): CurriculumMutationResult<{ deletedVersionId: string }> {
		const validation = errors(uuid('versionId', command.versionId));
		if (validation.length) return fields(validation);
		try {
			return this.database.transaction((tx) => {
				const found = findVersion(tx, command.versionId);
				if (!found) return failure('not_found');
				if (found.node.latestVersion.status !== 'draft') return failure('referenced_immutable');
				const preview = this.preview(tx, found.type, found.node.id, 'delete');
				if (preview.revision !== command.expectedDependencyRevision)
					return failure('dependency_changed');
				if (preview.blocksHardDelete) return failure('dependency_exists');
				const table = NODE_TABLES[found.type];
				tx.$client.prepare(`DELETE FROM ${table.version} WHERE id = ?`).run(command.versionId);
				if (identityVersionCount(tx, found.type, found.node.id) === 0)
					tx.$client.prepare(`DELETE FROM ${table.identity} WHERE id = ?`).run(found.node.id);
				const remaining = editableSiblings(
					tx,
					found.type,
					found.node.latestVersion.parentVersionId
				);
				this.writePositions(
					tx,
					found.type,
					remaining.map((item) => item.id)
				);
				this.audit(
					tx,
					actorUserId,
					AUDIT.deleted,
					found.type,
					found.node.id,
					this.dependencies.clock.now(),
					{
						nodeType: found.type,
						version: found.node.latestVersion.version,
						status: 'draft'
					}
				);
				return { ok: true, value: { deletedVersionId: command.versionId } };
			});
		} catch {
			return failure('unavailable');
		}
	}

	reorderSiblings(
		actorUserId: string,
		command: ReorderSiblingsCommand
	): CurriculumMutationResult<ReorderResult> {
		if (!Object.hasOwn(NODE_TABLES, command.nodeType))
			return fields([{ field: 'nodeType', message: 'Select a valid node type.' }]);
		const validation = errors(
			uuid('parentVersionId', command.parentVersionId, command.nodeType === 'phase')
		);
		if (
			validation.length ||
			new Set(command.orderedVersionIds).size !== command.orderedVersionIds.length ||
			command.orderedVersionIds.some((id) => uuid('orderedVersionIds', id).error)
		)
			return fields(
				validation.length
					? validation
					: [{ field: 'orderedVersionIds', message: 'Submit each sibling exactly once.' }]
			);
		try {
			return this.database.transaction((tx) => {
				if (!this.validParent(tx, command.nodeType, command.parentVersionId))
					return failure('parent_chain_invalid');
				const managerSiblings = latestNodes(tx, command.nodeType, {
					publishedOnly: false,
					now: this.dependencies.clock.now().toISOString()
				}).filter((node) => node.latestVersion.parentVersionId === command.parentVersionId);
				if (managerSiblings.some((node) => node.latestVersion.status !== 'draft'))
					return failure('referenced_immutable');
				const current = editableSiblings(tx, command.nodeType, command.parentVersionId);
				if (orderRevision(current) !== command.expectedOrderRevision) return failure('stale_order');
				if (
					current.length !== command.orderedVersionIds.length ||
					!command.orderedVersionIds.every((id) => current.some((row) => row.id === id))
				)
					return failure('conflict');
				if (current.some((row) => row.status !== 'draft')) return failure('referenced_immutable');
				this.writePositions(tx, command.nodeType, command.orderedVersionIds);
				const nextRevision = orderRevision(command.orderedVersionIds.map((id) => ({ id })));
				this.audit(
					tx,
					actorUserId,
					AUDIT.reordered,
					command.nodeType,
					command.parentVersionId ?? 'root',
					this.dependencies.clock.now(),
					{
						nodeType: command.nodeType,
						count: command.orderedVersionIds.length
					}
				);
				return {
					ok: true,
					value: {
						parentVersionId: command.parentVersionId,
						nodeType: command.nodeType,
						orderedVersionIds: [...command.orderedVersionIds],
						orderRevision: nextRevision
					}
				};
			});
		} catch {
			return failure('unavailable');
		}
	}

	upsertBloomLevel(
		actorUserId: string,
		command: UpsertBloomLevelCommand
	): CurriculumMutationResult<BloomLevelDto> {
		const id = command.id === undefined ? { value: null } : uuid('id', command.id);
		const ordinal = integer('ordinal', command.ordinal, { min: 1 });
		const name = text('name', command.name, { required: true, max: 200 });
		const validation = errors(id, ordinal, name);
		if (validation.length) return fields(validation);
		return this.bloomMutation((tx) => {
			const occurredAt = this.dependencies.clock.now();
			const entityId = id.value ?? this.dependencies.ids.create();
			const existing = id.value ? findBloomLevel(tx, id.value) : null;
			if (id.value && !existing) return failure('not_found');
			if (existing && existing.status !== 'draft') return failure('referenced_immutable');
			if (existing)
				tx.$client
					.prepare('UPDATE bloom_levels SET ordinal = ?, name = ? WHERE id = ?')
					.run(ordinal.value, name.value, entityId);
			else
				tx.$client
					.prepare(
						"INSERT INTO bloom_levels (id, ordinal, name, status, created_at) VALUES (?, ?, ?, 'draft', ?)"
					)
					.run(entityId, ordinal.value, name.value, occurredAt.toISOString());
			this.audit(
				tx,
				actorUserId,
				existing ? 'curriculum.bloom_level.updated' : 'curriculum.bloom_level.created',
				'bloom_level',
				entityId,
				occurredAt,
				{ status: 'draft' }
			);
			return { ok: true, value: findBloomLevel(tx, entityId)! };
		});
	}

	publishBloomLevel(actorUserId: string, id: string): CurriculumMutationResult<BloomLevelDto> {
		return this.bloomLifecycle(
			actorUserId,
			'level',
			id,
			'published'
		) as CurriculumMutationResult<BloomLevelDto>;
	}

	retireBloomLevel(
		actorUserId: string,
		command: BloomRetireCommand
	): CurriculumMutationResult<BloomLevelDto> {
		return this.retireBloom(
			actorUserId,
			'level',
			command
		) as CurriculumMutationResult<BloomLevelDto>;
	}

	deleteBloomLevel(
		actorUserId: string,
		command: BloomDeleteCommand
	): CurriculumMutationResult<{ deletedId: string }> {
		return this.deleteBloom(actorUserId, 'level', command);
	}

	upsertBloomVerb(
		actorUserId: string,
		command: UpsertBloomVerbCommand
	): CurriculumMutationResult<BloomVerbDto> {
		const id = command.id === undefined ? { value: null } : uuid('id', command.id);
		const levelId = uuid('bloomLevelId', command.bloomLevelId);
		const verb = text('verb', command.verb, { required: true, max: 200 });
		const validation = errors(id, levelId, verb);
		if (validation.length) return fields(validation);
		return this.bloomMutation((tx) => {
			if (!findBloomLevel(tx, levelId.value!)) return failure('not_found');
			const occurredAt = this.dependencies.clock.now();
			const entityId = id.value ?? this.dependencies.ids.create();
			const existing = id.value ? findBloomVerb(tx, id.value) : null;
			if (id.value && !existing) return failure('not_found');
			if (existing && existing.status !== 'draft') return failure('referenced_immutable');
			if (existing)
				tx.$client
					.prepare('UPDATE bloom_verbs SET bloom_level_id = ?, verb = ? WHERE id = ?')
					.run(levelId.value, verb.value, entityId);
			else
				tx.$client
					.prepare(
						"INSERT INTO bloom_verbs (id, bloom_level_id, verb, status, created_at) VALUES (?, ?, ?, 'draft', ?)"
					)
					.run(entityId, levelId.value, verb.value, occurredAt.toISOString());
			this.audit(
				tx,
				actorUserId,
				existing ? 'curriculum.bloom_verb.updated' : 'curriculum.bloom_verb.created',
				'bloom_verb',
				entityId,
				occurredAt,
				{ status: 'draft' }
			);
			return { ok: true, value: findBloomVerb(tx, entityId)! };
		});
	}

	publishBloomVerb(actorUserId: string, id: string): CurriculumMutationResult<BloomVerbDto> {
		return this.bloomLifecycle(
			actorUserId,
			'verb',
			id,
			'published'
		) as CurriculumMutationResult<BloomVerbDto>;
	}

	retireBloomVerb(
		actorUserId: string,
		command: BloomRetireCommand
	): CurriculumMutationResult<BloomVerbDto> {
		return this.retireBloom(actorUserId, 'verb', command) as CurriculumMutationResult<BloomVerbDto>;
	}

	deleteBloomVerb(
		actorUserId: string,
		command: BloomDeleteCommand
	): CurriculumMutationResult<{ deletedId: string }> {
		return this.deleteBloom(actorUserId, 'verb', command);
	}

	private insertVersion(
		tx: FoundationDatabase,
		type: CurriculumNodeType,
		value: {
			id: string;
			nodeId: string;
			parentVersionId: string | null;
			version: number;
			name: string;
			description: string | null;
			position: number;
			bloomVerbId: string | null;
			actorUserId: string;
			timestamp: string;
		}
	): void {
		const table = NODE_TABLES[type];
		const columns = ['id', table.identityKey];
		const values: unknown[] = [value.id, value.nodeId];
		if (table.parentKey) {
			columns.push(table.parentKey);
			values.push(value.parentVersionId);
		}
		columns.push(
			'version',
			'name',
			'description',
			'position',
			'status',
			'authored_by_user_id',
			'created_at'
		);
		values.push(
			value.version,
			value.name,
			value.description,
			value.position,
			'draft',
			value.actorUserId,
			value.timestamp
		);
		if (type !== 'element') {
			columns.push('bloom_verb_id');
			values.push(value.bloomVerbId);
		}
		tx.$client
			.prepare(
				`INSERT INTO ${table.version} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`
			)
			.run(...values);
	}

	private validParent(
		tx: FoundationDatabase,
		type: CurriculumNodeType,
		parentId: string | null
	): boolean {
		const expected = PARENT_TYPE[type];
		if (!expected) return parentId === null;
		if (!parentId) return false;
		return findVersion(tx, parentId)?.type === expected;
	}

	private publishedParentChain(
		tx: FoundationDatabase,
		type: CurriculumNodeType,
		parentId: string | null,
		start: string,
		end: string | null
	): boolean {
		if (type === 'phase') return parentId === null;
		if (!parentId) return false;
		const parent = findVersion(tx, parentId);
		if (!parent || parent.type !== PARENT_TYPE[type]) return false;
		const version = parent.node.latestVersion;
		if (version.status !== 'published' || !containsRange(version, start, end)) return false;
		return this.publishedParentChain(tx, parent.type, version.parentVersionId, start, end);
	}

	private validBloomSelection(
		tx: FoundationDatabase,
		type: CurriculumNodeType,
		bloomId: string | null,
		parentId: string | null,
		allowDraft: boolean
	): boolean {
		if (type === 'element') return bloomId === null;
		if (!bloomId) return true;
		const verb = findBloomVerb(tx, bloomId);
		if (!verb) return false;
		const level = findBloomLevel(tx, verb.bloomLevelId);
		if (!level) return false;
		if (verb.status === 'retired' || level.status === 'retired') return false;
		if (!allowDraft && (verb.status !== 'published' || level.status !== 'published')) return false;
		if (!parentId) return true;
		const parent = findVersion(tx, parentId)?.node.latestVersion;
		if (!parent?.bloomVerbId) return true;
		const parentVerb = findBloomVerb(tx, parent.bloomVerbId);
		const parentLevel = parentVerb ? findBloomLevel(tx, parentVerb.bloomLevelId) : null;
		return !parentLevel || level.ordinal >= parentLevel.ordinal;
	}

	private lifecycle(
		actor: string,
		id: string,
		from: string,
		to: string,
		action: string
	): CurriculumMutationResult<CurriculumNodeDto> {
		if (uuid('versionId', id).error)
			return fields([{ field: 'versionId', message: 'Enter a valid identifier.' }]);
		try {
			return this.database.transaction((tx) => {
				const found = findVersion(tx, id);
				if (!found) return failure('not_found');
				if (found.node.latestVersion.status !== from) return failure('invalid_transition');
				tx.$client
					.prepare(`UPDATE ${NODE_TABLES[found.type].version} SET status = ? WHERE id = ?`)
					.run(to, id);
				this.audit(tx, actor, action, found.type, found.node.id, this.dependencies.clock.now(), {
					nodeType: found.type,
					version: found.node.latestVersion.version,
					status: to
				});
				return { ok: true, value: findVersion(tx, id)!.node };
			});
		} catch {
			return failure('unavailable');
		}
	}

	private writePositions(
		tx: FoundationDatabase,
		type: CurriculumNodeType,
		ids: readonly string[]
	): void {
		const table = NODE_TABLES[type].version;
		const temporary = 1_000_000 + ids.length;
		const bump = tx.$client.prepare(`UPDATE ${table} SET position = position + ? WHERE id = ?`);
		for (const id of ids) bump.run(temporary, id);
		const assign = tx.$client.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`);
		ids.forEach((id, position) => assign.run(position, id));
	}

	private preview(
		tx: FoundationDatabase,
		entityType: CurriculumNodeType | 'bloom_level' | 'bloom_verb',
		entityId: string,
		operation: DependencyWarningResult['operation']
	): DependencyWarningResult {
		const counts = new Map<DependencyKind, number>();
		if (entityType === 'bloom_level') {
			counts.set(
				'child_version',
				Number(
					tx.$client
						.prepare('SELECT count(*) FROM bloom_verbs WHERE bloom_level_id = ?')
						.pluck()
						.get(entityId)
				)
			);
		} else if (entityType === 'bloom_verb') {
			let total = 0;
			for (const type of ['phase', 'task', 'subtask'] as const)
				total += Number(
					tx.$client
						.prepare(`SELECT count(*) FROM ${NODE_TABLES[type].version} WHERE bloom_verb_id = ?`)
						.pluck()
						.get(entityId)
				);
			counts.set('child_version', total);
		} else {
			const table = NODE_TABLES[entityType];
			const versionSpecific = operation === 'delete' || operation === 'parent_change';
			const versionIds = tx.$client
				.prepare(
					`SELECT id FROM ${table.version} WHERE ${table.identityKey} = ?
					 ORDER BY version DESC${versionSpecific ? ' LIMIT 1' : ''}`
				)
				.pluck()
				.all(entityId) as string[];
			const placeholders = versionIds.map(() => '?').join(', ');
			if (versionIds.length) {
				const childType =
					entityType === 'phase'
						? 'task'
						: entityType === 'task'
							? 'subtask'
							: entityType === 'subtask'
								? 'element'
								: null;
				if (childType)
					counts.set(
						'child_version',
						Number(
							tx.$client
								.prepare(
									`SELECT count(*) FROM ${NODE_TABLES[childType].version} WHERE ${NODE_TABLES[childType].parentKey} IN (${placeholders})`
								)
								.pluck()
								.get(...versionIds)
						)
					);
				if (entityType === 'subtask') {
					counts.set(
						'question_future_link',
						Number(
							tx.$client
								.prepare(
									`SELECT count(*) FROM question_future_curriculum_links WHERE subtask_version_id IN (${placeholders})`
								)
								.pluck()
								.get(...versionIds)
						)
					);
					counts.set(
						'template_rule',
						Number(
							tx.$client
								.prepare(
									`SELECT count(*) FROM test_template_rules WHERE subtask_version_id IN (${placeholders})`
								)
								.pluck()
								.get(...versionIds)
						)
					);
				}
				if (entityType === 'element') {
					counts.set(
						'question_future_link',
						Number(
							tx.$client
								.prepare(
									`SELECT count(*) FROM question_future_curriculum_links WHERE element_version_id IN (${placeholders})`
								)
								.pluck()
								.get(...versionIds)
						)
					);
					counts.set(
						'template_required_element',
						Number(
							tx.$client
								.prepare(
									`SELECT count(*) FROM test_template_required_elements WHERE element_version_id IN (${placeholders})`
								)
								.pluck()
								.get(...versionIds)
						)
					);
				}
				counts.set(
					'published_version',
					Number(
						tx.$client
							.prepare(
								`SELECT count(*) FROM ${table.version} WHERE id IN (${placeholders}) AND status IN ('published', 'retired')`
							)
							.pluck()
							.get(...versionIds)
					)
				);
			}
			const identityVersions = identityVersionCount(tx, entityType, entityId);
			if (operation !== 'parent_change' && (operation !== 'delete' || identityVersions <= 1)) {
				counts.set(
					'legacy_mapping',
					Number(
						tx.$client
							.prepare(
								"SELECT count(*) FROM legacy_curriculum_mappings WHERE target_entity_type = ? AND target_entity_id = ? AND status IN ('proposed', 'approved')"
							)
							.pluck()
							.get(entityType, entityId)
					)
				);
			}
		}
		const items: DependencyWarningItem[] = [...counts.entries()]
			.filter(([, count]) => count > 0)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([kind, count]) => ({ kind, count, blocking: true }));
		const totalCount = items.reduce((sum, item) => sum + item.count, 0);
		return {
			entityType,
			entityId,
			operation,
			items,
			totalCount,
			blocksHardDelete: totalCount > 0,
			requiresRetirement: (counts.get('published_version') ?? 0) > 0,
			revision: revision({ entityType, entityId, operation, items })
		};
	}

	private bloomMutation<T>(
		work: (tx: FoundationDatabase) => CurriculumMutationResult<T>
	): CurriculumMutationResult<T> {
		try {
			return this.database.transaction(work);
		} catch {
			return failure('unavailable');
		}
	}

	private bloomLifecycle(
		actor: string,
		kind: 'level' | 'verb',
		id: string,
		status: 'published'
	): CurriculumMutationResult<BloomLevelDto | BloomVerbDto> {
		if (uuid('id', id).error)
			return fields([{ field: 'id', message: 'Enter a valid identifier.' }]);
		return this.bloomMutation((tx) => {
			const current = kind === 'level' ? findBloomLevel(tx, id) : findBloomVerb(tx, id);
			if (!current) return failure('not_found');
			if (current.status !== 'draft') return failure('invalid_transition');
			if (
				kind === 'verb' &&
				findBloomLevel(tx, (current as BloomVerbDto).bloomLevelId)?.status !== 'published'
			)
				return failure('parent_not_published');
			tx.$client.prepare(`UPDATE bloom_${kind}s SET status = ? WHERE id = ?`).run(status, id);
			const at = this.dependencies.clock.now();
			this.audit(tx, actor, `curriculum.bloom_${kind}.published`, `bloom_${kind}`, id, at, {
				status
			});
			return {
				ok: true,
				value: kind === 'level' ? findBloomLevel(tx, id)! : findBloomVerb(tx, id)!
			};
		});
	}

	private retireBloom(
		actor: string,
		kind: 'level' | 'verb',
		command: BloomRetireCommand
	): CurriculumMutationResult<BloomLevelDto | BloomVerbDto> {
		const validation = errors(
			uuid('id', command.id),
			text('reason', command.reason, { required: true, max: 2_000 })
		);
		if (validation.length) return fields(validation);
		return this.bloomMutation((tx) => {
			const current =
				kind === 'level' ? findBloomLevel(tx, command.id) : findBloomVerb(tx, command.id);
			if (!current) return failure('not_found');
			if (current.status !== 'published') return failure('invalid_transition');
			const preview = this.preview(tx, `bloom_${kind}`, command.id, 'retire');
			if (preview.revision !== command.expectedDependencyRevision)
				return failure('dependency_changed');
			const at = this.dependencies.clock.now();
			tx.$client
				.prepare(`UPDATE bloom_${kind}s SET status = 'retired', retired_at = ? WHERE id = ?`)
				.run(at.toISOString(), command.id);
			this.audit(tx, actor, `curriculum.bloom_${kind}.retired`, `bloom_${kind}`, command.id, at, {
				status: 'retired',
				reason: 'reviewed_dependency_preview'
			});
			return {
				ok: true,
				value: kind === 'level' ? findBloomLevel(tx, command.id)! : findBloomVerb(tx, command.id)!
			};
		});
	}

	private deleteBloom(
		actor: string,
		kind: 'level' | 'verb',
		command: BloomDeleteCommand
	): CurriculumMutationResult<{ deletedId: string }> {
		if (uuid('id', command.id).error)
			return fields([{ field: 'id', message: 'Enter a valid identifier.' }]);
		return this.bloomMutation((tx) => {
			const current =
				kind === 'level' ? findBloomLevel(tx, command.id) : findBloomVerb(tx, command.id);
			if (!current) return failure('not_found');
			if (current.status !== 'draft') return failure('referenced_immutable');
			const preview = this.preview(tx, `bloom_${kind}`, command.id, 'delete');
			if (preview.revision !== command.expectedDependencyRevision)
				return failure('dependency_changed');
			if (preview.blocksHardDelete) return failure('dependency_exists');
			tx.$client.prepare(`DELETE FROM bloom_${kind}s WHERE id = ?`).run(command.id);
			this.audit(
				tx,
				actor,
				`curriculum.bloom_${kind}.deleted`,
				`bloom_${kind}`,
				command.id,
				this.dependencies.clock.now(),
				{ status: 'draft' }
			);
			return { ok: true, value: { deletedId: command.id } };
		});
	}

	private audit(
		tx: FoundationDatabase,
		actorUserId: string,
		action: string,
		entityType: string,
		entityId: string,
		occurredAt: Date,
		after: Readonly<Record<string, unknown>>
	): void {
		this.dependencies.recordAuditEvent(tx, {
			actorUserId,
			action,
			entityType,
			entityId,
			occurredAt,
			before: null,
			after
		});
	}
}

export function defaultCurriculumDependencies(
	overrides: Partial<CurriculumServiceDependencies> = {}
): CurriculumServiceDependencies {
	return {
		clock: overrides.clock ?? { now: () => new Date() },
		ids: overrides.ids ?? { create: randomUUID },
		recordAuditEvent: overrides.recordAuditEvent ?? recordAuditEvent
	};
}

export function createCurriculumService(database: DatabaseHandle): CurriculumService {
	return new CurriculumService(database, defaultCurriculumDependencies());
}
