import { afterEach, describe, expect, it } from 'vitest';

import { actions as loginActions } from '../../src/routes/login/+page.server.js';
import { actions as passwordActions } from '../../src/routes/login/password/+page.server.js';
import { openDatabase, type DatabaseHandle } from '../../src/lib/server/db/index.js';

const handles: DatabaseHandle[] = [];

function emptyFormRequest(path: string): Request {
	return new Request(`https://local.invalid${path}`, {
		method: 'POST',
		body: new FormData()
	});
}

afterEach(() => {
	for (const handle of handles.splice(0)) handle.close();
});

describe('public authentication route security', () => {
	it('rate limits even malformed blank login attempts through the real action', async () => {
		const database = openDatabase({ path: ':memory:' });
		handles.push(database);
		const action = loginActions.default;
		if (!action) throw new Error('Login action is absent from the route matrix.');
		const statuses: number[] = [];
		for (let attempt = 0; attempt < 6; attempt += 1) {
			const result = await action({
				request: emptyFormRequest('/login'),
				locals: { principal: null, database },
				cookies: { get: () => undefined, set: () => undefined },
				getClientAddress: () => 'synthetic-blank-attempt-network'
			} as never);
			if (typeof result !== 'object' || result === null || !('status' in result)) {
				throw new Error('Blank login did not return a field-safe failure.');
			}
			statuses.push(Number(result.status));
		}
		expect(statuses).toEqual([400, 400, 400, 400, 400, 429]);
	});

	it('returns the same generic password-action failure for missing input', async () => {
		const database = openDatabase({ path: ':memory:' });
		handles.push(database);
		const action = passwordActions.default;
		if (!action) throw new Error('Password action is absent from the route matrix.');
		const result = await action({
			request: emptyFormRequest('/login/password'),
			locals: { principal: null, database }
		} as never);
		expect(result).toMatchObject({
			status: 400,
			data: { success: false, error: 'The password could not be set.' }
		});
	});
});
