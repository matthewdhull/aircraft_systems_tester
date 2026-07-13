import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import type { AccessCodeProtector, ProtectedAccessCode } from './types.js';

export const ACCESS_CODE_PROTECTION_VERSION = 'ast-code-hmac-sha256-v1';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function validateKey(key: Uint8Array): Buffer {
	if (key.byteLength < 32)
		throw new TypeError('Access-code protection requires at least 256 bits.');
	return Buffer.from(key);
}

export class HmacAccessCodeProtector implements AccessCodeProtector {
	readonly #key: Buffer;
	readonly #entropy: (size: number) => Uint8Array;

	constructor(options: { key: Uint8Array; entropy?: (size: number) => Uint8Array }) {
		this.#key = validateKey(options.key);
		this.#entropy = options.entropy ?? randomBytes;
	}

	#createCode(length = 12): string {
		let code = '';
		while (code.length < length) {
			for (const byte of this.#entropy(length - code.length)) {
				// Rejection sampling avoids modulo bias for the 32-symbol alphabet.
				if (byte >= 256 - (256 % ALPHABET.length)) continue;
				code += ALPHABET[byte % ALPHABET.length];
				if (code.length === length) break;
			}
		}
		return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`;
	}

	#digest(rawCode: string): string {
		return createHmac('sha256', this.#key).update(rawCode, 'utf8').digest('base64url');
	}

	createAndProtect(): ProtectedAccessCode {
		const rawCode = this.#createCode();
		return {
			rawCode,
			protectedDigest: this.#digest(rawCode),
			protectionVersion: ACCESS_CODE_PROTECTION_VERSION
		};
	}

	verify(rawCode: string, digest: string, version: string): boolean {
		if (version !== ACCESS_CODE_PROTECTION_VERSION) return false;
		const expected = Buffer.from(this.#digest(rawCode));
		const actual = Buffer.from(digest);
		return expected.byteLength === actual.byteLength && timingSafeEqual(expected, actual);
	}
}
