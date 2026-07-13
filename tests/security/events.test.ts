import { describe, expect, it } from 'vitest';

import { SECURITY_EVENT, SESSION_REVOCATION_REASON } from '../../src/lib/server/security/events.js';

describe('security event vocabulary', () => {
	it('uses stable namespaced actions for security-sensitive behavior', () => {
		expect(new Set(Object.values(SECURITY_EVENT)).size).toBe(Object.values(SECURITY_EVENT).length);
		for (const action of Object.values(SECURITY_EVENT)) {
			expect(action).toMatch(/^[a-z]+(?:[._][a-z]+)+$/);
		}
	});

	it('defines explicit session revocation reasons', () => {
		expect(SESSION_REVOCATION_REASON).toMatchObject({
			ACCOUNT_DEACTIVATED: 'account_deactivated',
			ACCOUNT_RETIRED: 'account_retired',
			PASSWORD_CHANGED: 'password_changed',
			ROTATION: 'rotation'
		});
	});
});
