export class DatabaseInitializationError extends Error {
	constructor() {
		super('Database initialization failed.');
		this.name = 'DatabaseInitializationError';
	}
}

export class DatabaseVerificationError extends Error {
	constructor(reason: string) {
		super(`Database verification failed: ${reason}.`);
		this.name = 'DatabaseVerificationError';
	}
}
