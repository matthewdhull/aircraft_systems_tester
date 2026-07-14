import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/generation/e2e',
	fullyParallel: false,
	retries: 0,
	workers: 1,
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5174',
		browserName: 'chromium',
		channel: 'chrome',
		headless: true,
		bypassCSP: true,
		trace: 'retain-on-failure'
	}
});
