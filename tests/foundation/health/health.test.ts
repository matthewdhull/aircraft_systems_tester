import { afterEach, describe, expect, it, vi } from 'vitest';

import { closeReadinessDatabase, verifyReadiness } from '../../../src/lib/server/config/readiness';
import { GET as getHealth } from '../../../src/routes/health/+server';
import { GET as getReady } from '../../../src/routes/ready/+server';

describe('health and readiness', () => {
	afterEach(() => {
		closeReadinessDatabase();
		vi.unstubAllEnvs();
	});

	it('returns a content-free liveness response', async () => {
		const response = await getHealth({} as never);

		expect(response.status).toBe(200);
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(await response.json()).toEqual({ status: 'ok' });
	});

	it('rejects readiness when required configuration is missing', () => {
		expect(verifyReadiness({ APP_ENV: 'test' })).toBe(false);
	});

	it('returns a generic success after database verification', async () => {
		vi.stubEnv('APP_ENV', 'test');
		vi.stubEnv('DATABASE_PATH', ':memory:');
		const response = await getReady({} as never);

		expect(response.status).toBe(200);
		expect(response.headers.get('cache-control')).toBe('no-store');
		expect(await response.json()).toEqual({ status: 'ready' });
	});
});
