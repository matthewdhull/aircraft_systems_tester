import type { FoundationDatabase } from '$lib/server/db';

import {
	BASELINE_ROLES,
	PERMISSIONS,
	ROLE_DISPLAY_NAMES,
	ROLE_PERMISSION_POLICY,
	type BaselineRoleCode,
	type PermissionCode
} from './policy.js';

const ROLE_IDS: Readonly<Record<BaselineRoleCode, string>> = Object.freeze({
	administrator: '2a1c3078-2fad-4a4a-a40f-bd34de759e01',
	instructor: '2a1c3078-2fad-4a4a-a40f-bd34de759e02',
	question_author: '2a1c3078-2fad-4a4a-a40f-bd34de759e03',
	curriculum_manager: '2a1c3078-2fad-4a4a-a40f-bd34de759e04',
	report_viewer: '2a1c3078-2fad-4a4a-a40f-bd34de759e05'
});

const PERMISSION_DESCRIPTIONS: Readonly<Record<PermissionCode, string>> = Object.freeze(
	Object.fromEntries(
		Object.values(PERMISSIONS).map((code) => [code, `Allows the server-side ${code} capability.`])
	) as Record<PermissionCode, string>
);

function stablePermissionId(code: PermissionCode): string {
	const ordinal = Object.values(PERMISSIONS).indexOf(code) + 1;
	return `bf9fcbdd-27e1-46fb-b3e3-${ordinal.toString().padStart(12, '0')}`;
}

export function seedBaselineAuthorization(db: FoundationDatabase, occurredAt: string): void {
	const insertRole = db.$client.prepare(`
		INSERT INTO roles (id, code, display_name, created_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(code) DO UPDATE SET display_name = excluded.display_name
	`);
	const insertPermission = db.$client.prepare(`
		INSERT INTO permissions (id, code, description)
		VALUES (?, ?, ?)
		ON CONFLICT(code) DO UPDATE SET description = excluded.description
	`);
	const insertRolePermission = db.$client.prepare(`
		INSERT INTO role_permissions (role_id, permission_id)
		VALUES (?, ?)
		ON CONFLICT(role_id, permission_id) DO NOTHING
	`);

	for (const roleCode of Object.values(BASELINE_ROLES)) {
		insertRole.run(ROLE_IDS[roleCode], roleCode, ROLE_DISPLAY_NAMES[roleCode], occurredAt);
	}
	for (const permissionCode of Object.values(PERMISSIONS)) {
		insertPermission.run(
			stablePermissionId(permissionCode),
			permissionCode,
			PERMISSION_DESCRIPTIONS[permissionCode]
		);
	}
	for (const [roleCode, permissionCodes] of Object.entries(ROLE_PERMISSION_POLICY) as [
		BaselineRoleCode,
		readonly PermissionCode[]
	][]) {
		for (const permissionCode of permissionCodes) {
			insertRolePermission.run(ROLE_IDS[roleCode], stablePermissionId(permissionCode));
		}
	}
}
