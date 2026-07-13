import { createHash } from 'node:crypto';

export interface RateLimitClock {
	now(): Date;
}

export interface LoginRateLimitInput {
	networkKey: string;
	accountKey: string;
}

export type LoginRateLimitResult =
	{ allowed: true } | { allowed: false; retryAfterSeconds: number };

export interface LoginRateLimiterOptions {
	clock?: RateLimitClock;
	windowMs?: number;
	maxAttemptsPerAccount?: number;
	maxAttemptsPerNetwork?: number;
	maxTrackedKeys?: number;
}

interface AttemptBucket {
	attempts: number[];
	lastTouchedAt: number;
}

const DEFAULT_WINDOW_MS = 15 * 60 * 1_000;
const DEFAULT_MAX_ATTEMPTS_PER_ACCOUNT = 5;
const DEFAULT_MAX_ATTEMPTS_PER_NETWORK = 20;
const DEFAULT_MAX_TRACKED_KEYS = 10_000;

const systemClock: RateLimitClock = { now: () => new Date() };

function positiveInteger(value: number, name: string): number {
	if (!Number.isSafeInteger(value) || value <= 0) {
		throw new TypeError(`${name} must be a positive safe integer.`);
	}
	return value;
}

function digestKey(namespace: 'account' | 'network', value: string): string {
	const normalized = value.trim().toLowerCase();
	if (normalized.length === 0) throw new TypeError('Rate-limit keys must not be empty.');
	return createHash('sha256').update(namespace).update('\0').update(normalized).digest('hex');
}

/**
 * Process-local login limiter for a single application instance.
 *
 * Keys are SHA-256 digests, storage is bounded, and new keys fail closed while
 * capacity is exhausted. Multi-instance deployments must provide equivalent
 * shared enforcement at the ingress tier; see Phase 4 security documentation.
 */
export class LoginRateLimiter {
	readonly #clock: RateLimitClock;
	readonly #windowMs: number;
	readonly #maxAttemptsPerAccount: number;
	readonly #maxAttemptsPerNetwork: number;
	readonly #maxTrackedKeys: number;
	readonly #buckets = new Map<string, AttemptBucket>();

	constructor(options: LoginRateLimiterOptions = {}) {
		this.#clock = options.clock ?? systemClock;
		this.#windowMs = positiveInteger(options.windowMs ?? DEFAULT_WINDOW_MS, 'windowMs');
		this.#maxAttemptsPerAccount = positiveInteger(
			options.maxAttemptsPerAccount ?? DEFAULT_MAX_ATTEMPTS_PER_ACCOUNT,
			'maxAttemptsPerAccount'
		);
		this.#maxAttemptsPerNetwork = positiveInteger(
			options.maxAttemptsPerNetwork ?? DEFAULT_MAX_ATTEMPTS_PER_NETWORK,
			'maxAttemptsPerNetwork'
		);
		this.#maxTrackedKeys = positiveInteger(
			options.maxTrackedKeys ?? DEFAULT_MAX_TRACKED_KEYS,
			'maxTrackedKeys'
		);
	}

	consume(input: LoginRateLimitInput): LoginRateLimitResult {
		const now = this.#clock.now().getTime();
		if (!Number.isFinite(now)) throw new TypeError('Rate-limit clock returned an invalid date.');

		const keys = [
			{ key: digestKey('account', input.accountKey), limit: this.#maxAttemptsPerAccount },
			{ key: digestKey('network', input.networkKey), limit: this.#maxAttemptsPerNetwork }
		];
		this.#prune(now);

		for (const entry of keys) {
			const bucket = this.#buckets.get(entry.key);
			if (bucket !== undefined && bucket.attempts.length >= entry.limit) {
				return {
					allowed: false,
					retryAfterSeconds: Math.max(
						1,
						Math.ceil((bucket.attempts[0]! + this.#windowMs - now) / 1_000)
					)
				};
			}
		}

		const newKeyCount = keys.filter((entry) => !this.#buckets.has(entry.key)).length;
		if (this.#buckets.size + newKeyCount > this.#maxTrackedKeys) {
			return { allowed: false, retryAfterSeconds: Math.ceil(this.#windowMs / 1_000) };
		}

		for (const entry of keys) {
			const bucket = this.#buckets.get(entry.key) ?? { attempts: [], lastTouchedAt: now };
			bucket.attempts.push(now);
			bucket.lastTouchedAt = now;
			this.#buckets.set(entry.key, bucket);
		}
		return { allowed: true };
	}

	get trackedKeyCount(): number {
		return this.#buckets.size;
	}

	#prune(now: number): void {
		const cutoff = now - this.#windowMs;
		for (const [key, bucket] of this.#buckets) {
			bucket.attempts = bucket.attempts.filter((attempt) => attempt > cutoff);
			if (bucket.attempts.length === 0 && bucket.lastTouchedAt <= cutoff) {
				this.#buckets.delete(key);
			}
		}
	}
}

export function createLoginRateLimiter(options: LoginRateLimiterOptions = {}): LoginRateLimiter {
	return new LoginRateLimiter(options);
}
