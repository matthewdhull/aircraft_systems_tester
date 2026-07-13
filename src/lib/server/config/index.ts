export type AppEnvironment = 'development' | 'test' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ServerConfig {
	appEnvironment: AppEnvironment;
	databasePath: string;
	logLevel: LogLevel;
	publicOrigin: string | null;
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

	if (appEnvironment === 'production' && databasePath === ':memory:') {
		throw new ConfigurationError('DATABASE_PATH');
	}

	return Object.freeze({ appEnvironment, databasePath, logLevel, publicOrigin });
}
