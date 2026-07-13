import { describe, expect, it } from 'vitest';

import {
	DEVELOPMENT_PREVIEW_TRUSTED_ORIGINS,
	trustedOriginsForAppEnvironment
} from '../../svelte.config.js';

describe('preview CSRF origin configuration', () => {
	it('trusts captured local-preview origins only for an explicit development build', () => {
		expect(trustedOriginsForAppEnvironment('development')).toEqual([
			'http://127.0.0.1:5173',
			'http://localhost:5173',
			'null'
		]);
		expect(DEVELOPMENT_PREVIEW_TRUSTED_ORIGINS).toHaveLength(3);
		expect(trustedOriginsForAppEnvironment('test')).toEqual([]);
		expect(trustedOriginsForAppEnvironment('production')).toEqual([]);
		expect(trustedOriginsForAppEnvironment(undefined)).toEqual([]);
	});
});
