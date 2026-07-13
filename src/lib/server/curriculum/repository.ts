import type { FoundationDatabase } from '$lib/server/db/database.js';
import type {
	BloomLevelDto,
	BloomVerbDto,
	CurriculumLifecycle,
	CurriculumNodeDto,
	CurriculumNodeType,
	CurriculumVersionDto
} from './types.js';

export const NODE_TABLES = {
	phase: {
		identity: 'phases',
		version: 'phase_versions',
		identityKey: 'phase_id',
		parentKey: null
	},
	task: {
		identity: 'tasks',
		version: 'task_versions',
		identityKey: 'task_id',
		parentKey: 'phase_version_id'
	},
	subtask: {
		identity: 'subtasks',
		version: 'subtask_versions',
		identityKey: 'subtask_id',
		parentKey: 'task_version_id'
	},
	element: {
		identity: 'elements',
		version: 'element_versions',
		identityKey: 'element_id',
		parentKey: 'subtask_version_id'
	}
} as const;

interface VersionRow {
	id: string;
	nodeId: string;
	version: number;
	name: string;
	description: string | null;
	position: number;
	status: CurriculumLifecycle;
	parentVersionId: string | null;
	bloomVerbId: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
	authoredByUserId: string | null;
	reviewedByUserId: string | null;
	reviewedAt: string | null;
	createdAt: string;
	publishedAt: string | null;
	retiredAt: string | null;
	nodeCreatedAt: string;
	nodeRetiredAt: string | null;
}

function selectColumns(type: CurriculumNodeType): string {
	const table = NODE_TABLES[type];
	const parent = table.parentKey ? `v.${table.parentKey}` : 'NULL';
	const bloom = type === 'element' ? 'NULL' : 'v.bloom_verb_id';
	return `v.id, v.${table.identityKey} AS nodeId, v.version, v.name, v.description,
		v.position, v.status, ${parent} AS parentVersionId, ${bloom} AS bloomVerbId,
		v.effective_from AS effectiveFrom, v.effective_to AS effectiveTo,
		v.authored_by_user_id AS authoredByUserId, v.reviewed_by_user_id AS reviewedByUserId,
		v.reviewed_at AS reviewedAt, v.created_at AS createdAt, v.published_at AS publishedAt,
		v.retired_at AS retiredAt, i.created_at AS nodeCreatedAt, i.retired_at AS nodeRetiredAt`;
}

function dto(type: CurriculumNodeType, row: VersionRow): CurriculumNodeDto {
	const version: CurriculumVersionDto = {
		id: row.id,
		nodeId: row.nodeId,
		nodeType: type,
		version: row.version,
		name: row.name,
		description: row.description,
		position: row.position,
		status: row.status,
		parentVersionId: row.parentVersionId,
		bloomVerbId: row.bloomVerbId,
		effectiveFrom: row.effectiveFrom,
		effectiveTo: row.effectiveTo,
		authoredByUserId: row.authoredByUserId ?? '',
		reviewedByUserId: row.reviewedByUserId,
		reviewedAt: row.reviewedAt,
		createdAt: row.createdAt,
		publishedAt: row.publishedAt,
		retiredAt: row.retiredAt
	};
	return {
		id: row.nodeId,
		type,
		createdAt: row.nodeCreatedAt,
		retiredAt: row.nodeRetiredAt,
		latestVersion: version
	};
}

export function findVersion(
	tx: FoundationDatabase,
	versionId: string
): { type: CurriculumNodeType; node: CurriculumNodeDto } | null {
	for (const type of Object.keys(NODE_TABLES) as CurriculumNodeType[]) {
		const table = NODE_TABLES[type];
		const row = tx.$client
			.prepare(
				`SELECT ${selectColumns(type)} FROM ${table.version} v
				 JOIN ${table.identity} i ON i.id = v.${table.identityKey} WHERE v.id = ?`
			)
			.get(versionId) as VersionRow | undefined;
		if (row) return { type, node: dto(type, row) };
	}
	return null;
}

export function findNodeType(tx: FoundationDatabase, nodeId: string): CurriculumNodeType | null {
	for (const type of Object.keys(NODE_TABLES) as CurriculumNodeType[]) {
		if (
			tx.$client.prepare(`SELECT 1 FROM ${NODE_TABLES[type].identity} WHERE id = ?`).get(nodeId)
		) {
			return type;
		}
	}
	return null;
}

export function latestNodes(
	tx: FoundationDatabase,
	type: CurriculumNodeType,
	options: { publishedOnly: boolean; now: string }
): CurriculumNodeDto[] {
	const table = NODE_TABLES[type];
	const lifecycle = options.publishedOnly
		? `AND v.status = 'published' AND v.effective_from <= ?
		   AND (v.effective_to IS NULL OR v.effective_to > ?)`
		: '';
	const parameters = options.publishedOnly ? [options.now, options.now] : [];
	const rows = tx.$client
		.prepare(
			`WITH ranked AS (
			 SELECT ${selectColumns(type)},
			 ROW_NUMBER() OVER (PARTITION BY v.${table.identityKey} ORDER BY v.version DESC, v.id) AS rank
			 FROM ${table.version} v JOIN ${table.identity} i ON i.id = v.${table.identityKey}
			 WHERE i.retired_at IS NULL ${lifecycle}
			)
			SELECT * FROM ranked WHERE rank = 1 AND status <> 'retired'
			ORDER BY position, id`
		)
		.all(...parameters) as unknown as VersionRow[];
	return rows.map((row) => dto(type, row));
}

export function identityVersionCount(
	tx: FoundationDatabase,
	type: CurriculumNodeType,
	nodeId: string
): number {
	const table = NODE_TABLES[type];
	return Number(
		tx.$client
			.prepare(`SELECT count(*) FROM ${table.version} WHERE ${table.identityKey} = ?`)
			.pluck()
			.get(nodeId)
	);
}

export function maxVersion(
	tx: FoundationDatabase,
	type: CurriculumNodeType,
	nodeId: string
): number {
	const table = NODE_TABLES[type];
	return Number(
		tx.$client
			.prepare(
				`SELECT coalesce(max(version), 0) FROM ${table.version} WHERE ${table.identityKey} = ?`
			)
			.pluck()
			.get(nodeId)
	);
}

export function editableSiblings(
	tx: FoundationDatabase,
	type: CurriculumNodeType,
	parentVersionId: string | null
): Array<{ id: string; position: number; status: string }> {
	const table = NODE_TABLES[type];
	const parentClause = table.parentKey ? `${table.parentKey} = ?` : '1 = 1';
	const parameters = table.parentKey ? [parentVersionId] : [];
	return tx.$client
		.prepare(
			`SELECT id, position, status FROM ${table.version}
			 WHERE ${parentClause} AND status = 'draft' ORDER BY position, id`
		)
		.all(...parameters) as Array<{ id: string; position: number; status: string }>;
}

export function listBloomVocabulary(tx: FoundationDatabase): BloomLevelDto[] {
	const levels = tx.$client
		.prepare(
			`SELECT id, ordinal, name, status, created_at AS createdAt, retired_at AS retiredAt
			 FROM bloom_levels ORDER BY ordinal, id`
		)
		.all() as Array<Omit<BloomLevelDto, 'verbs'>>;
	const verbs = tx.$client
		.prepare(
			`SELECT id, bloom_level_id AS bloomLevelId, verb, status, created_at AS createdAt,
			 retired_at AS retiredAt FROM bloom_verbs ORDER BY verb, id`
		)
		.all() as BloomVerbDto[];
	return levels.map((level) => ({
		...level,
		verbs: verbs.filter((verb) => verb.bloomLevelId === level.id)
	}));
}

export function findBloomLevel(tx: FoundationDatabase, id: string): BloomLevelDto | null {
	return listBloomVocabulary(tx).find((level) => level.id === id) ?? null;
}

export function findBloomVerb(tx: FoundationDatabase, id: string): BloomVerbDto | null {
	for (const level of listBloomVocabulary(tx)) {
		const verb = level.verbs.find((candidate) => candidate.id === id);
		if (verb) return verb;
	}
	return null;
}
