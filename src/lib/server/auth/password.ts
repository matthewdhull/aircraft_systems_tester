import { argon2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

import {
	MAXIMUM_PASSWORD_LENGTH,
	MINIMUM_PASSWORD_LENGTH,
	PASSWORD_REQUIREMENT_MESSAGE
} from '$lib/password-policy';

export interface Argon2idParameters {
	version: number;
	memoryKiB: number;
	passes: number;
	parallelism: number;
	tagLength: number;
	saltLength: number;
}

export const ARGON2ID_PARAMETERS: Readonly<Argon2idParameters> = Object.freeze({
	version: 19,
	memoryKiB: 19_456,
	passes: 2,
	parallelism: 2,
	tagLength: 32,
	saltLength: 16
});

const PHC_PATTERN =
	/^\$argon2id\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

export type PasswordValidation =
	{ ok: true } | { ok: false; error: 'invalid_input'; message: string };

export function validatePassword(password: string): PasswordValidation {
	if (password.length < MINIMUM_PASSWORD_LENGTH) {
		return { ok: false, error: 'invalid_input', message: PASSWORD_REQUIREMENT_MESSAGE };
	}
	if (password.length > MAXIMUM_PASSWORD_LENGTH) {
		return {
			ok: false,
			error: 'invalid_input',
			message: `Use no more than ${MAXIMUM_PASSWORD_LENGTH} characters.`
		};
	}
	return { ok: true };
}

function derive(
	password: string,
	salt: Buffer,
	parameters: Readonly<Argon2idParameters> = ARGON2ID_PARAMETERS
): Buffer {
	return argon2Sync('argon2id', {
		message: Buffer.from(password, 'utf8'),
		nonce: salt,
		parallelism: parameters.parallelism,
		tagLength: parameters.tagLength,
		memory: parameters.memoryKiB,
		passes: parameters.passes
	});
}

export function hashPassword(password: string): string {
	const validation = validatePassword(password);
	if (!validation.ok) throw new TypeError(validation.message);
	const salt = randomBytes(ARGON2ID_PARAMETERS.saltLength);
	const hash = derive(password, salt);
	return `$argon2id$v=${ARGON2ID_PARAMETERS.version}$m=${ARGON2ID_PARAMETERS.memoryKiB},t=${ARGON2ID_PARAMETERS.passes},p=${ARGON2ID_PARAMETERS.parallelism}$${salt.toString('base64').replace(/=+$/, '')}$${hash.toString('base64').replace(/=+$/, '')}`;
}

interface ParsedHash {
	version: number;
	memoryKiB: number;
	passes: number;
	parallelism: number;
	salt: Buffer;
	hash: Buffer;
}

function parseHash(encoded: string): ParsedHash | null {
	const match = PHC_PATTERN.exec(encoded);
	if (!match) return null;
	const [, version, memoryKiB, passes, parallelism, salt, hash] = match;
	if (!version || !memoryKiB || !passes || !parallelism || !salt || !hash) return null;
	const parsed = {
		version: Number(version),
		memoryKiB: Number(memoryKiB),
		passes: Number(passes),
		parallelism: Number(parallelism),
		salt: Buffer.from(salt, 'base64'),
		hash: Buffer.from(hash, 'base64')
	};
	if (
		!Number.isSafeInteger(parsed.memoryKiB) ||
		!Number.isSafeInteger(parsed.passes) ||
		!Number.isSafeInteger(parsed.parallelism) ||
		parsed.version !== 19 ||
		parsed.salt.length < 8 ||
		parsed.hash.length < 5
	) {
		return null;
	}
	return parsed;
}

export function verifyPassword(password: string, encoded: string): boolean {
	const parsed = parseHash(encoded);
	if (!parsed) return false;
	try {
		const actual = derive(password, parsed.salt, {
			version: parsed.version,
			memoryKiB: parsed.memoryKiB,
			passes: parsed.passes,
			parallelism: parsed.parallelism,
			tagLength: parsed.hash.length,
			saltLength: parsed.salt.length
		});
		return actual.length === parsed.hash.length && timingSafeEqual(actual, parsed.hash);
	} catch {
		return false;
	}
}

export function passwordNeedsRehash(encoded: string): boolean {
	const parsed = parseHash(encoded);
	return (
		parsed === null ||
		parsed.memoryKiB !== ARGON2ID_PARAMETERS.memoryKiB ||
		parsed.passes !== ARGON2ID_PARAMETERS.passes ||
		parsed.parallelism !== ARGON2ID_PARAMETERS.parallelism ||
		parsed.hash.length !== ARGON2ID_PARAMETERS.tagLength ||
		parsed.salt.length !== ARGON2ID_PARAMETERS.saltLength
	);
}
