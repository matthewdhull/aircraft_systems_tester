import type { AuditEventInput } from '$lib/server/audit';
import type { FoundationDatabase } from '$lib/server/db';

export interface Clock {
	now(): Date;
}

export const systemClock: Clock = Object.freeze({ now: () => new Date() });

export type AuthenticationFailure =
	| { ok: false; error: 'authentication_failed' }
	| { ok: false; error: 'rate_limited'; retryAfterSeconds: number };

export type AuditRecorder = (tx: FoundationDatabase, event: AuditEventInput) => void;

export interface LoginRateLimit {
	consume(input: {
		networkKey: string;
		accountKey: string;
	}): { allowed: true } | { allowed: false; retryAfterSeconds: number };
}
