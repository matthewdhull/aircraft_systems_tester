import { describe, expect, it } from 'vitest';

import { ConfigurationError, loadServerConfig } from '../../../src/lib/server/config';
import { createLogRecord } from '../../../src/lib/server/logging';

describe('server configuration', () => {
	it('requires a database path', () => {
		expect(() => loadServerConfig({ APP_ENV: 'development' })).toThrow(ConfigurationError);
	});

	it('parses explicit safe values', () => {
		expect(
			loadServerConfig({
				APP_ENV: 'test',
				DATABASE_PATH: ':memory:',
				LOG_LEVEL: 'debug'
			})
		).toEqual({ appEnvironment: 'test', databasePath: ':memory:', logLevel: 'debug' });
	});

	it('rejects an in-memory production database', () => {
		expect(() => loadServerConfig({ APP_ENV: 'production', DATABASE_PATH: ':memory:' })).toThrow(
			ConfigurationError
		);
	});

	it('strips query strings and restricts logging to approved fields', () => {
		const record = createLogRecord('warn', 'readiness check', {
			route: '/ready?access_code=not-logged',
			errorCode: 'database unavailable'
		});

		expect(record.route).toBe('/ready');
		expect(record.errorCode).toBe('database_unavailable');
		expect(JSON.stringify(record)).not.toContain('not-logged');
	});
});
