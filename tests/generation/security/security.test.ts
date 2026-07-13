import { describe, expect, it } from 'vitest';

import {
	AesGcmSeedProtector,
	decryptReplaySeed,
	HmacAccessCodeProtector,
	ReplayAuthorizationError
} from '../../../src/lib/server/generation/security/index.js';

describe('Phase 7 generation secret protection', () => {
	it('encrypts seeds with authenticated context and supports authorized replay', () => {
		const protector = new AesGcmSeedProtector({
			key: new Uint8Array(32).fill(7),
			keyId: 'test-key-1',
			nonceSource: () => new Uint8Array(12).fill(9)
		});
		const context = {
			examId: 'exam-1',
			templateVersionId: 'template-version-1',
			algorithmVersion: 'ast-selection-v1'
		};
		const seed = new Uint8Array(32).fill(3);
		const envelope = protector.encrypt(seed, context);

		expect(envelope.ciphertext).not.toContain(Buffer.from(seed).toString('base64url'));
		expect(
			decryptReplaySeed({ authorized: true, decryptor: protector, envelope, context })
		).toEqual(seed);
		expect(() => protector.decrypt(envelope, { ...context, examId: 'other' })).toThrow();
		expect(() =>
			decryptReplaySeed({ authorized: false, decryptor: protector, envelope, context })
		).toThrow(ReplayAuthorizationError);
	});

	it('creates a one-time raw code and stores only a keyed representation', () => {
		let next = 0;
		const protector = new HmacAccessCodeProtector({
			key: new Uint8Array(32).fill(5),
			entropy: (size) => Uint8Array.from({ length: size }, () => next++ % 32)
		});
		const protectedCode = protector.createAndProtect();

		expect(protectedCode.rawCode).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
		expect(protectedCode.protectedDigest).not.toContain(protectedCode.rawCode);
		expect(
			protector.verify(
				protectedCode.rawCode,
				protectedCode.protectedDigest,
				protectedCode.protectionVersion
			)
		).toBe(true);
		expect(
			protector.verify(
				'ZZZZ-ZZZZ-ZZZZ',
				protectedCode.protectedDigest,
				protectedCode.protectionVersion
			)
		).toBe(false);
	});

	it('rejects invalid key material without revealing it', () => {
		expect(() => new AesGcmSeedProtector({ key: new Uint8Array(31), keyId: 'key' })).toThrow(
			'256-bit'
		);
		expect(() => new HmacAccessCodeProtector({ key: new Uint8Array(16) })).toThrow('256 bits');
	});
});
