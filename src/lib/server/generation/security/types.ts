export interface SeedContext {
	examId: string;
	templateVersionId: string;
	algorithmVersion: string;
}

export interface SeedEnvelope {
	envelopeVersion: string;
	keyId: string;
	ciphertext: string;
}

export interface SeedProtector {
	encrypt(seed: Uint8Array, context: SeedContext): SeedEnvelope;
}

export interface ReplaySeedDecryptor {
	decrypt(envelope: SeedEnvelope, context: SeedContext): Uint8Array;
}

export interface ProtectedAccessCode {
	rawCode: string;
	protectedDigest: string;
	protectionVersion: string;
}

export interface AccessCodeProtector {
	createAndProtect(): ProtectedAccessCode;
	verify(rawCode: string, protectedDigest: string, protectionVersion: string): boolean;
}
