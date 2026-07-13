import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'tests/foundation/ui/**', 'tests/ui/**']
				}
			},
			{
				extends: './vite.config.ts',
				resolve: {
					conditions: ['browser']
				},
				test: {
					name: 'ui',
					environment: 'jsdom',
					include: [
						'src/**/*.svelte.{test,spec}.{js,ts}',
						'tests/foundation/ui/**/*.{test,spec}.{js,ts}',
						'tests/ui/**/*.{test,spec}.{js,ts}'
					],
					exclude: ['src/lib/server/**']
				}
			}
		]
	}
});
