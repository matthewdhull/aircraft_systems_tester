import type { FoundationDatabase } from '$lib/server/db/database.js';
import type {
	CurriculumNodeType,
	LegacyCurriculumMappingDto,
	LegacyCurriculumNodeDto,
	LegacyEntityType,
	MappingStatus
} from './types.js';

interface LegacyRow {
	id: string;
	number: string;
	name: string;
	parentId?: string;
}

interface MappingRow {
	id: string;
	legacyEntityType: LegacyEntityType;
	legacyEntityId: string;
	targetEntityType: CurriculumNodeType;
	targetEntityId: string;
	status: MappingStatus;
	proposedByUserId: string;
	proposedAt: string;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
	rationale: string;
}

const TARGET_IDENTITY_TABLE: Readonly<Record<CurriculumNodeType, string>> = {
	phase: 'phases',
	task: 'tasks',
	subtask: 'subtasks',
	element: 'elements'
};

const SOURCE_TABLE: Readonly<Record<LegacyEntityType, string>> = {
	tpo: 'legacy_tpos',
	spo: 'legacy_spos',
	eo: 'legacy_eos'
};

function mappingSelect(where = '', order = ''): string {
	return `SELECT id,
		legacy_entity_type AS legacyEntityType,
		legacy_entity_id AS legacyEntityId,
		target_entity_type AS targetEntityType,
		target_entity_id AS targetEntityId,
		status,
		proposed_by_user_id AS proposedByUserId,
		proposed_at AS proposedAt,
		reviewed_by_user_id AS reviewedByUserId,
		reviewed_at AS reviewedAt,
		rationale
	FROM legacy_curriculum_mappings ${where} ${order}`;
}

function toMapping(row: MappingRow): LegacyCurriculumMappingDto {
	return { ...row };
}

export function listLegacyHierarchy(tx: FoundationDatabase): readonly LegacyCurriculumNodeDto[] {
	const tpos = tx.$client
		.prepare('SELECT id, number, name FROM legacy_tpos ORDER BY number, name, id')
		.all() as LegacyRow[];
	const spos = tx.$client
		.prepare(
			'SELECT id, number, name, legacy_tpo_id AS parentId FROM legacy_spos ORDER BY number, name, id'
		)
		.all() as LegacyRow[];
	const eos = tx.$client
		.prepare(
			'SELECT id, number, name, legacy_spo_id AS parentId FROM legacy_eos ORDER BY number, name, id'
		)
		.all() as LegacyRow[];

	const eosBySpo = new Map<string, LegacyCurriculumNodeDto[]>();
	for (const row of eos) {
		const children = eosBySpo.get(row.parentId!) ?? [];
		children.push({ id: row.id, type: 'eo', number: row.number, name: row.name, children: [] });
		eosBySpo.set(row.parentId!, children);
	}

	const sposByTpo = new Map<string, LegacyCurriculumNodeDto[]>();
	for (const row of spos) {
		const children = sposByTpo.get(row.parentId!) ?? [];
		children.push({
			id: row.id,
			type: 'spo',
			number: row.number,
			name: row.name,
			children: eosBySpo.get(row.id) ?? []
		});
		sposByTpo.set(row.parentId!, children);
	}

	return tpos.map((row) => ({
		id: row.id,
		type: 'tpo',
		number: row.number,
		name: row.name,
		children: sposByTpo.get(row.id) ?? []
	}));
}

export function listMappings(tx: FoundationDatabase): readonly LegacyCurriculumMappingDto[] {
	return (
		tx.$client
			.prepare(
				mappingSelect(
					'',
					'ORDER BY legacy_entity_type, target_entity_type, status, proposed_at, id'
				)
			)
			.all() as MappingRow[]
	).map(toMapping);
}

export function findMapping(
	tx: FoundationDatabase,
	mappingId: string
): LegacyCurriculumMappingDto | null {
	const row = tx.$client.prepare(mappingSelect('WHERE id = ?')).get(mappingId) as
		MappingRow | undefined;
	return row ? toMapping(row) : null;
}

export function mappingPairExists(
	tx: FoundationDatabase,
	legacyType: LegacyEntityType,
	legacyId: string,
	targetType: CurriculumNodeType,
	targetId: string
): boolean {
	return Boolean(
		tx.$client
			.prepare(
				`SELECT 1 FROM legacy_curriculum_mappings
				 WHERE legacy_entity_type = ? AND legacy_entity_id = ?
				   AND target_entity_type = ? AND target_entity_id = ?`
			)
			.get(legacyType, legacyId, targetType, targetId)
	);
}

export function approvedMappingConflict(
	tx: FoundationDatabase,
	mapping: LegacyCurriculumMappingDto
): boolean {
	return Boolean(
		tx.$client
			.prepare(
				`SELECT 1 FROM legacy_curriculum_mappings
				 WHERE legacy_entity_type = ? AND legacy_entity_id = ?
				   AND target_entity_type = ? AND status = 'approved' AND id <> ?`
			)
			.get(mapping.legacyEntityType, mapping.legacyEntityId, mapping.targetEntityType, mapping.id)
	);
}

export function sourceExistsWithValidChain(
	tx: FoundationDatabase,
	type: LegacyEntityType,
	id: string
): boolean {
	const sql =
		type === 'tpo'
			? 'SELECT 1 FROM legacy_tpos WHERE id = ?'
			: type === 'spo'
				? `SELECT 1 FROM legacy_spos s
				   JOIN legacy_tpos t ON t.id = s.legacy_tpo_id WHERE s.id = ?`
				: `SELECT 1 FROM legacy_eos e
				   JOIN legacy_spos s ON s.id = e.legacy_spo_id
				   JOIN legacy_tpos t ON t.id = s.legacy_tpo_id WHERE e.id = ?`;
	return Boolean(tx.$client.prepare(sql).get(id));
}

export function targetIdentityExists(
	tx: FoundationDatabase,
	type: CurriculumNodeType,
	id: string
): boolean {
	return Boolean(
		tx.$client.prepare(`SELECT 1 FROM ${TARGET_IDENTITY_TABLE[type]} WHERE id = ?`).get(id)
	);
}

function effective(alias: string): string {
	return `${alias}.status = 'published'
		AND ${alias}.effective_from IS NOT NULL
		AND ${alias}.effective_from <= ?
		AND (${alias}.effective_to IS NULL OR ${alias}.effective_to > ?)`;
}

export function targetHasValidPublishedChain(
	tx: FoundationDatabase,
	type: CurriculumNodeType,
	id: string,
	at: string
): boolean {
	let sql: string;
	let parameters: string[];
	if (type === 'phase') {
		sql = `SELECT 1 FROM phase_versions p
			JOIN phases identity ON identity.id = p.phase_id
			WHERE p.phase_id = ? AND identity.retired_at IS NULL AND ${effective('p')} LIMIT 1`;
		parameters = [id, at, at];
	} else if (type === 'task') {
		sql = `SELECT 1 FROM task_versions v
			JOIN tasks identity ON identity.id = v.task_id
			JOIN phase_versions p ON p.id = v.phase_version_id
			JOIN phases phase_identity ON phase_identity.id = p.phase_id
			WHERE v.task_id = ? AND identity.retired_at IS NULL AND phase_identity.retired_at IS NULL
			  AND ${effective('v')} AND ${effective('p')}
			  AND p.effective_from <= v.effective_from
			  AND (p.effective_to IS NULL OR (v.effective_to IS NOT NULL AND p.effective_to >= v.effective_to))
			LIMIT 1`;
		parameters = [id, at, at, at, at];
	} else if (type === 'subtask') {
		sql = `SELECT 1 FROM subtask_versions v
			JOIN subtasks identity ON identity.id = v.subtask_id
			JOIN task_versions t ON t.id = v.task_version_id
			JOIN tasks task_identity ON task_identity.id = t.task_id
			JOIN phase_versions p ON p.id = t.phase_version_id
			JOIN phases phase_identity ON phase_identity.id = p.phase_id
			WHERE v.subtask_id = ? AND identity.retired_at IS NULL
			  AND task_identity.retired_at IS NULL AND phase_identity.retired_at IS NULL
			  AND ${effective('v')} AND ${effective('t')} AND ${effective('p')}
			  AND t.effective_from <= v.effective_from
			  AND (t.effective_to IS NULL OR (v.effective_to IS NOT NULL AND t.effective_to >= v.effective_to))
			  AND p.effective_from <= t.effective_from
			  AND (p.effective_to IS NULL OR (t.effective_to IS NOT NULL AND p.effective_to >= t.effective_to))
			LIMIT 1`;
		parameters = [id, at, at, at, at, at, at];
	} else {
		sql = `SELECT 1 FROM element_versions v
			JOIN elements identity ON identity.id = v.element_id
			JOIN subtask_versions s ON s.id = v.subtask_version_id
			JOIN subtasks subtask_identity ON subtask_identity.id = s.subtask_id
			JOIN task_versions t ON t.id = s.task_version_id
			JOIN tasks task_identity ON task_identity.id = t.task_id
			JOIN phase_versions p ON p.id = t.phase_version_id
			JOIN phases phase_identity ON phase_identity.id = p.phase_id
			WHERE v.element_id = ? AND identity.retired_at IS NULL
			  AND subtask_identity.retired_at IS NULL AND task_identity.retired_at IS NULL
			  AND phase_identity.retired_at IS NULL
			  AND ${effective('v')} AND ${effective('s')}
			  AND ${effective('t')} AND ${effective('p')}
			  AND s.effective_from <= v.effective_from
			  AND (s.effective_to IS NULL OR (v.effective_to IS NOT NULL AND s.effective_to >= v.effective_to))
			  AND t.effective_from <= s.effective_from
			  AND (t.effective_to IS NULL OR (s.effective_to IS NOT NULL AND t.effective_to >= s.effective_to))
			  AND p.effective_from <= t.effective_from
			  AND (p.effective_to IS NULL OR (t.effective_to IS NOT NULL AND p.effective_to >= t.effective_to))
			LIMIT 1`;
		parameters = [id, at, at, at, at, at, at, at, at];
	}
	return Boolean(tx.$client.prepare(sql).get(...parameters));
}

export function insertMapping(tx: FoundationDatabase, input: LegacyCurriculumMappingDto): void {
	tx.$client
		.prepare(
			`INSERT INTO legacy_curriculum_mappings
			 (id, legacy_entity_type, legacy_entity_id, target_entity_type, target_entity_id,
			  status, proposed_by_user_id, proposed_at, reviewed_by_user_id, reviewed_at, rationale)
			 VALUES (?, ?, ?, ?, ?, 'proposed', ?, ?, NULL, NULL, ?)`
		)
		.run(
			input.id,
			input.legacyEntityType,
			input.legacyEntityId,
			input.targetEntityType,
			input.targetEntityId,
			input.proposedByUserId,
			input.proposedAt,
			input.rationale
		);
}

export function decideMapping(
	tx: FoundationDatabase,
	mappingId: string,
	status: 'approved' | 'rejected',
	reviewerId: string,
	reviewedAt: string,
	rationale: string
): boolean {
	const result = tx.$client
		.prepare(
			`UPDATE legacy_curriculum_mappings
			 SET status = ?, reviewed_by_user_id = ?, reviewed_at = ?, rationale = ?
			 WHERE id = ? AND status = 'proposed'`
		)
		.run(status, reviewerId, reviewedAt, rationale, mappingId);
	return result.changes === 1;
}

export function retireMapping(
	tx: FoundationDatabase,
	mappingId: string,
	reviewerId: string,
	reviewedAt: string,
	rationale: string
): boolean {
	const result = tx.$client
		.prepare(
			`UPDATE legacy_curriculum_mappings
			 SET status = 'retired', reviewed_by_user_id = ?, reviewed_at = ?, rationale = ?
			 WHERE id = ? AND status = 'approved'`
		)
		.run(reviewerId, reviewedAt, rationale, mappingId);
	return result.changes === 1;
}

export function countRows(tx: FoundationDatabase, table: string, where = ''): number {
	return Number(tx.$client.prepare(`SELECT count(*) FROM ${table} ${where}`).pluck().get() ?? 0);
}

export const mappingRepositoryConstants = { SOURCE_TABLE, TARGET_IDENTITY_TABLE } as const;
