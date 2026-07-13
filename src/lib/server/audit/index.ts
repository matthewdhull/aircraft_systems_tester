import { randomUUID } from 'node:crypto';

import { auditEvents } from '$lib/server/db/schema';
import type { FoundationDatabase } from '$lib/server/db/database';

export type AuditScalar = string | number | boolean | null;
export type AuditMetadata = Readonly<Record<string, AuditScalar | readonly AuditScalar[]>>;

export interface AuditEventInput {
	actorUserId: string | null;
	action: string;
	entityType: string;
	entityId: string | null;
	occurredAt: Date;
	before?: Readonly<Record<string, unknown>> | null;
	after?: Readonly<Record<string, unknown>> | null;
}

const SAFE_METADATA_KEYS = new Set([
	'active',
	'aircraftCount',
	'algorithmVersion',
	'changedFields',
	'count',
	'configuredLength',
	'decision',
	'displayName',
	'envelopeVersion',
	'employeeNumber',
	'expiresAt',
	'firstName',
	'fromPosition',
	'futureLinkCount',
	'generationStatus',
	'keyView',
	'lastName',
	'nodeType',
	'position',
	'questionCount',
	'previousValue',
	'questionType',
	'reason',
	'replacementValue',
	'role',
	'roleCode',
	'roleCodes',
	'roles',
	'grantedRoleCode',
	'revokedRoleCode',
	'sourceType',
	'status',
	'templateVersion',
	'targetType',
	'toPosition',
	'version'
]);

const SENSITIVE_KEY_PARTS = [
	'authorization',
	'cookie',
	'credential',
	'hash',
	'password',
	'requestbody',
	'secret',
	'session',
	'token'
];

export class UnsafeAuditMetadataError extends Error {
	constructor() {
		super('Audit metadata contains a field that is not approved for persistence.');
		this.name = 'UnsafeAuditMetadataError';
	}
}

function normalizeKey(key: string): string {
	return key.replaceAll(/[^a-z0-9]/gi, '').toLowerCase();
}

function validateMetadata(
	metadata: Readonly<Record<string, unknown>> | null | undefined
): string | null {
	if (metadata == null) return null;
	for (const [key, value] of Object.entries(metadata)) {
		const normalizedKey = normalizeKey(key);
		if (
			!SAFE_METADATA_KEYS.has(key) ||
			SENSITIVE_KEY_PARTS.some((part) => normalizedKey.includes(part))
		) {
			throw new UnsafeAuditMetadataError();
		}
		if (Array.isArray(value)) {
			if (
				!value.every(
					(item) => item === null || ['string', 'number', 'boolean'].includes(typeof item)
				)
			) {
				throw new UnsafeAuditMetadataError();
			}
		} else if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) {
			throw new UnsafeAuditMetadataError();
		}
	}
	return JSON.stringify(metadata);
}

function requiredSafeText(value: string): string {
	if (value.trim().length === 0) throw new UnsafeAuditMetadataError();
	return value;
}

/** Insert an append-only event using the caller-owned transaction. */
export function recordAuditEvent(tx: FoundationDatabase, input: AuditEventInput): void {
	if (!Number.isFinite(input.occurredAt.getTime())) throw new UnsafeAuditMetadataError();
	const occurredAt = input.occurredAt.toISOString();

	tx.insert(auditEvents)
		.values({
			id: randomUUID(),
			actorUserId: input.actorUserId,
			action: requiredSafeText(input.action),
			entityType: requiredSafeText(input.entityType),
			entityId: input.entityId,
			occurredAt,
			beforeJson: validateMetadata(input.before),
			afterJson: validateMetadata(input.after)
		})
		.run();
}
