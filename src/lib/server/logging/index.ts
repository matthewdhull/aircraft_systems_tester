import type { LogLevel } from '$lib/server/config';

export interface LogContext {
	requestId?: string;
	route?: string;
	method?: string;
	status?: number;
	durationMs?: number;
	errorCode?: string;
	signal?: string;
}

interface LogRecord extends LogContext {
	timestamp: string;
	level: LogLevel;
	event: string;
}

const TOKEN = /[^a-zA-Z0-9_.:-]/g;

function safeToken(value: string, maximumLength = 80): string {
	return value.replace(TOKEN, '_').slice(0, maximumLength);
}

function safeRoute(value: string): string {
	return (value.split('?', 1)[0] ?? '').slice(0, 160);
}

export function createLogRecord(
	level: LogLevel,
	event: string,
	context: LogContext = {}
): LogRecord {
	return {
		timestamp: new Date().toISOString(),
		level,
		event: safeToken(event),
		...(context.requestId === undefined ? {} : { requestId: safeToken(context.requestId) }),
		...(context.route === undefined ? {} : { route: safeRoute(context.route) }),
		...(context.method === undefined ? {} : { method: safeToken(context.method, 16) }),
		...(context.status === undefined ? {} : { status: context.status }),
		...(context.durationMs === undefined ? {} : { durationMs: context.durationMs }),
		...(context.errorCode === undefined ? {} : { errorCode: safeToken(context.errorCode) }),
		...(context.signal === undefined ? {} : { signal: safeToken(context.signal, 16) })
	};
}

export function writeLog(level: LogLevel, event: string, context: LogContext = {}): void {
	const line = JSON.stringify(createLogRecord(level, event, context));

	if (level === 'error') {
		console.error(line);
	} else if (level === 'warn') {
		console.warn(line);
	} else {
		console.log(line);
	}
}
