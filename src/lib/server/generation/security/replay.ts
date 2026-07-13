import type { ReplaySeedDecryptor, SeedContext, SeedEnvelope } from './types.js';

export class ReplayAuthorizationError extends Error {
	constructor() {
		super('Replay is not authorized.');
		this.name = 'ReplayAuthorizationError';
	}
}

export function decryptReplaySeed(input: {
	authorized: boolean;
	decryptor: ReplaySeedDecryptor;
	envelope: SeedEnvelope;
	context: SeedContext;
}): Uint8Array {
	if (!input.authorized) throw new ReplayAuthorizationError();
	return input.decryptor.decrypt(input.envelope, input.context);
}
