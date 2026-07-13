import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import type { ReplaySeedDecryptor, SeedContext, SeedEnvelope, SeedProtector } from './types.js';

export const SEED_ENVELOPE_VERSION = 'ast-seed-aes-256-gcm-v1';

function contextBytes(context: SeedContext): Buffer {
	return Buffer.from(
		JSON.stringify([context.examId, context.templateVersionId, context.algorithmVersion]),
		'utf8'
	);
}

function validateKey(key: Uint8Array): Buffer {
	if (key.byteLength !== 32) throw new TypeError('Seed encryption requires a 256-bit key.');
	return Buffer.from(key);
}

export class AesGcmSeedProtector implements SeedProtector, ReplaySeedDecryptor {
	readonly #key: Buffer;
	readonly #keyId: string;
	readonly #nonceSource: (size: number) => Uint8Array;

	constructor(options: {
		key: Uint8Array;
		keyId: string;
		nonceSource?: (size: number) => Uint8Array;
	}) {
		this.#key = validateKey(options.key);
		if (!/^[A-Za-z0-9._-]{1,64}$/.test(options.keyId)) throw new TypeError('Invalid seed key id.');
		this.#keyId = options.keyId;
		this.#nonceSource = options.nonceSource ?? randomBytes;
	}

	encrypt(seed: Uint8Array, context: SeedContext): SeedEnvelope {
		if (seed.byteLength < 16) throw new TypeError('Seed entropy is insufficient.');
		const nonce = Buffer.from(this.#nonceSource(12));
		if (nonce.byteLength !== 12) throw new TypeError('Invalid nonce source.');
		const cipher = createCipheriv('aes-256-gcm', this.#key, nonce);
		cipher.setAAD(contextBytes(context));
		const encrypted = Buffer.concat([cipher.update(seed), cipher.final()]);
		const tag = cipher.getAuthTag();
		return {
			envelopeVersion: SEED_ENVELOPE_VERSION,
			keyId: this.#keyId,
			ciphertext: Buffer.concat([nonce, tag, encrypted]).toString('base64url')
		};
	}

	decrypt(envelope: SeedEnvelope, context: SeedContext): Uint8Array {
		if (envelope.envelopeVersion !== SEED_ENVELOPE_VERSION || envelope.keyId !== this.#keyId) {
			throw new Error('Seed envelope is not supported.');
		}
		const payload = Buffer.from(envelope.ciphertext, 'base64url');
		if (payload.byteLength < 29) throw new Error('Seed envelope is invalid.');
		const nonce = payload.subarray(0, 12);
		const tag = payload.subarray(12, 28);
		const encrypted = payload.subarray(28);
		const decipher = createDecipheriv('aes-256-gcm', this.#key, nonce);
		decipher.setAAD(contextBytes(context));
		decipher.setAuthTag(tag);
		return new Uint8Array(Buffer.concat([decipher.update(encrypted), decipher.final()]));
	}
}
