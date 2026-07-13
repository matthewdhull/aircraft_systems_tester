import { argon2Sync, randomBytes } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
	ARGON2ID_PARAMETERS,
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

	it('rejects malformed hashes and out-of-policy password lengths safely', () => {
		expect(verifyPassword(syntheticPassword(), 'not-a-password-hash')).toBe(false);
		expect(passwordNeedsRehash('not-a-password-hash')).toBe(true);
		expect(validatePassword('short')).toMatchObject({ ok: false, error: 'invalid_input' });
	});
});
