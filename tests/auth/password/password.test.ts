import { argon2Sync, randomBytes } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
	ARGON2ID_PARAMETERS,
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
	hashPassword,
	passwordNeedsRehash,
	validatePassword,
	verifyPassword
} from '../../../src/lib/server/auth/index.js';
import { syntheticPassword } from '../core/helpers.js';

describe('Argon2id password policy', () => {
	it('hashes with the reviewed explicit parameters and verifies without retaining plaintext', () => {
		const password = syntheticPassword();
		const encoded = hashPassword(password);
		expect(encoded).toMatch(
			new RegExp(
				`^\\$argon2id\\$v=19\\$m=${ARGON2ID_PARAMETERS.memoryKiB},t=${ARGON2ID_PARAMETERS.passes},p=${ARGON2ID_PARAMETERS.parallelism}\\$`
			)
		);
		expect(encoded).not.toContain(password);
		expect(verifyPassword(password, encoded)).toBe(true);
		expect(verifyPassword(`${password}-wrong`, encoded)).toBe(false);
		expect(passwordNeedsRehash(encoded)).toBe(false);
	});

	it('identifies valid hashes with older parameters for rehash', () => {
		const password = syntheticPassword();
		const salt = randomBytes(16);
		const hash = argon2Sync('argon2id', {
			message: Buffer.from(password),
			nonce: salt,
			memory: 8_192,
			passes: 2,
			parallelism: 2,
			tagLength: 32
		});
		const encoded = `$argon2id$v=19$m=8192,t=2,p=2$${salt.toString('base64').replace(/=+$/, '')}$${hash.toString('base64').replace(/=+$/, '')}`;
		expect(verifyPassword(password, encoded)).toBe(true);
		expect(passwordNeedsRehash(encoded)).toBe(true);
	});

	it('accepts 8 through 256 characters and rejects values outside those boundaries', () => {
		expect(validatePassword('x'.repeat(MINIMUM_PASSWORD_LENGTH - 1))).toMatchObject({
			ok: false,
			error: 'invalid_input',
			message: 'Use at least 8 characters.'
		});
		expect(validatePassword('x'.repeat(MINIMUM_PASSWORD_LENGTH))).toEqual({ ok: true });
		expect(validatePassword('x'.repeat(MAXIMUM_PASSWORD_LENGTH))).toEqual({ ok: true });
		expect(validatePassword('x'.repeat(MAXIMUM_PASSWORD_LENGTH + 1))).toMatchObject({
			ok: false,
			error: 'invalid_input'
		});
	});

	it('rejects malformed hashes safely', () => {
		expect(verifyPassword(syntheticPassword(), 'not-a-password-hash')).toBe(false);
		expect(passwordNeedsRehash('not-a-password-hash')).toBe(true);
	});
});
