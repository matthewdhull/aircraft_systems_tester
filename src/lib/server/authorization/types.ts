import type { DatabaseHandle, FoundationDatabase } from '$lib/server/db';

export interface AuthenticatedPrincipal {
	userId: string;
	employeeNumber: string;
	displayName: string;
	roles: readonly string[];
	permissions: ReadonlySet<string>;
	sessionIdHash: string;
}

export interface Clock {
	now(): Date;
}

export interface AuthorizationLocals {
	principal: AuthenticatedPrincipal | null;
	database: DatabaseHandle;
}

export type AuthorizationDatabase = FoundationDatabase;

export const systemClock: Clock = Object.freeze({
	now: () => new Date()
});
