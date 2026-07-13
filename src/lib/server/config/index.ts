export type AppEnvironment = 'development' | 'test' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ServerConfig {
	appEnvironment: AppEnvironment;
	databasePath: string;
	logLevel: LogLevel;
	publicOrigin: string | null;
	seedEncryptionKey: Uint8Array | null;
	seedEncryptionKeyId: string | null;
	accessCodeHmacKey: Uint8Array | null;
}

function parseKey(value: string | undefined, field: string, minimumBytes = 32): Uint8Array | null {
	if (value === undefined || value.trim() === '') return null;
	if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value.trim())) throw new ConfigurationError(field);
	const decoded = Buffer.from(value.trim(), 'base64');
	if (
		decoded.byteLength < minimumBytes ||
		(field === 'GENERATION_SEED_KEY_BASE64' && decoded.byteLength !== 32)
	)
		throw new ConfigurationError(field);
	return new Uint8Array(decoded);
}

function parseKeyId(value: string | undefined): string | null {
	if (value === undefined || value.trim() === '') return null;
	if (!/^[A-Za-z0-9._-]{1,64}$/.test(value.trim())) {
		throw new ConfigurationError('GENERATION_SEED_KEY_ID');
	}
	return value.trim();
}

export class ConfigurationError extends Error {
	readonly code = 'invalid_configuration';

	constructor(public readonly field: string) {
		super(`Invalid server configuration: ${field}`);
		this.name = 'ConfigurationError';
	}
}

const APP_ENVIRONMENTS = new Set<AppEnvironment>(['development', 'test', 'production']);
const LOG_LEVELS = new Set<LogLevel>(['debug', 'info', 'warn', 'error']);

function parseEnum<T extends string>(value: string, field: string, allowed: Set<T>): T {
	if (!allowed.has(value as T)) {
		throw new ConfigurationError(field);
	}

	return value as T;
}

function requireNonEmpty(value: string | undefined, field: string): string {
	if (value === undefined || value.trim() === '') {
		throw new ConfigurationError(field);
	}

	return value.trim();
}

function parsePublicOrigin(value: string | undefined, environment: AppEnvironment): string | null {
	if (value === undefined || value.trim() === '') {
		if (environment === 'production') throw new ConfigurationError('ORIGIN');
		return null;
	}
	try {
		const parsed = new URL(value);
		if (
			!['http:', 'https:'].includes(parsed.protocol) ||
			parsed.username ||
			parsed.password ||
			parsed.pathname !== '/' ||
			parsed.search ||
			parsed.hash ||
			(environment === 'production' && parsed.protocol !== 'https:')
		) {
			throw new ConfigurationError('ORIGIN');
		}
		return parsed.origin;
	} catch (error) {
		if (error instanceof ConfigurationError) throw error;
		throw new ConfigurationError('ORIGIN');
	}
}

export function loadServerConfig(
	environment: NodeJS.ProcessEnv = process.env
): Readonly<ServerConfig> {
	const appEnvironment = parseEnum(
		environment.APP_ENV ?? environment.NODE_ENV ?? 'development',
		'APP_ENV',
		APP_ENVIRONMENTS
	);
	const databasePath = requireNonEmpty(environment.DATABASE_PATH, 'DATABASE_PATH');
	const logLevel = parseEnum(environment.LOG_LEVEL ?? 'info', 'LOG_LEVEL', LOG_LEVELS);
	const publicOrigin = parsePublicOrigin(environment.ORIGIN, appEnvironment);
	const seedEncryptionKey = parseKey(
		environment.GENERATION_SEED_KEY_BASE64,
		'GENERATION_SEED_KEY_BASE64'
	);
	const seedEncryptionKeyId = parseKeyId(environment.GENERATION_SEED_KEY_ID);
	const accessCodeHmacKey = parseKey(
		environment.GENERATION_CODE_HMAC_KEY_BASE64,
		'GENERATION_CODE_HMAC_KEY_BASE64'
	);

	if (appEnvironment === 'production' && databasePath === ':memory:') {
		throw new ConfigurationError('DATABASE_PATH');
	}
	if (
		appEnvironment === 'production' &&
		(seedEncryptionKey === null || seedEncryptionKeyId === null || accessCodeHmacKey === null)
	) {
		throw new ConfigurationError('GENERATION_SECURITY_KEYS');
	}
	if ((seedEncryptionKey === null) !== (seedEncryptionKeyId === null)) {
		throw new ConfigurationError('GENERATION_SEED_KEY_ID');
	}

	return Object.freeze({
		appEnvironment,
		databasePath,
		logLevel,
		publicOrigin,
		seedEncryptionKey,
		seedEncryptionKeyId,
		accessCodeHmacKey
	});
}
