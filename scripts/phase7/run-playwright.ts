#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

import { openDatabase } from '../../src/lib/server/db/index.js';
import { verifyPassword } from '../../src/lib/server/auth/index.js';
import { seedPhase7AcceptanceData } from './seed-acceptance.js';

const directory = await mkdtemp(join(tmpdir(), 'ast-phase7-e2e-'));
const databasePath = join(directory, 'acceptance.sqlite');
const password = 'Synthetic-Phase7-E2E!2026';
const baseUrl = 'http://127.0.0.1:5174';
const key = randomBytes(32).toString('base64');
const database = openDatabase({ path: databasePath });
database.transaction((tx) => seedPhase7AcceptanceData(tx, password));
const storedHash = database.sqlite
	.prepare("SELECT password_hash FROM users WHERE employee_number = 'P7ASSIGNED'")
	.pluck()
	.get();
if (typeof storedHash !== 'string' || !verifyPassword(password, storedHash))
	throw new Error('Synthetic E2E credential verification failed.');
database.close();

const environment = {
	...process.env,
	APP_ENV: 'development',
	DATABASE_PATH: databasePath,
	ORIGIN: baseUrl,
	GENERATION_SEED_KEY_BASE64: key,
	GENERATION_SEED_KEY_ID: 'phase7-e2e-v1',
	GENERATION_CODE_HMAC_KEY_BASE64: randomBytes(32).toString('base64'),
	PLAYWRIGHT_BASE_URL: baseUrl,
	PHASE7_E2E_PASSWORD: password
};
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '5174'], {
	env: environment,
	stdio: ['ignore', 'pipe', 'pipe']
});
preview.stdout.pipe(process.stdout);
preview.stderr.pipe(process.stderr);

try {
	for (let attempt = 0; ; attempt++) {
		try {
			const response = await fetch(baseUrl);
			if (response.ok) break;
		} catch {
			// The preview is still starting.
		}
		if (attempt === 60) throw new Error('Phase 7 E2E preview did not start.');
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	const tests = spawn('npx', ['--no-install', 'playwright', 'test'], {
		env: environment,
		stdio: 'inherit'
	});
	const exitCode = await new Promise<number>((resolve) =>
		tests.on('exit', (code) => resolve(code ?? 1))
	);
	if (exitCode !== 0) process.exitCode = exitCode;
} finally {
	preview.kill('SIGTERM');
	await new Promise<void>((resolve) => preview.once('exit', () => resolve()));
	await rm(directory, { recursive: true, force: true });
}
