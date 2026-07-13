function valueAfter(args: readonly string[], option: string): string | undefined {
	const index = args.indexOf(option);
	return index >= 0 ? args[index + 1] : undefined;
}

function loopbackOrigins(baseUrl: URL): string[] {
	const alternate = new URL(baseUrl);
	alternate.hostname = baseUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
	return [...new Set([baseUrl.origin, alternate.origin])];
}

async function loginPost(baseUrl: URL, origin: string): Promise<Response> {
	return fetch(new URL('/login', baseUrl), {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			origin
		},
		body: new URLSearchParams({
			employeeNumber: `preview-origin-smoke-${Date.now()}`,
			password: 'synthetic-invalid-password'
		})
	});
}

async function main(): Promise<void> {
	const rawUrl = valueAfter(process.argv.slice(2), '--url') ?? 'http://127.0.0.1:5173';
	const baseUrl = new URL(rawUrl);
	if (baseUrl.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(baseUrl.hostname)) {
		throw new Error('Preview smoke URL must be an HTTP loopback origin.');
	}

	for (const origin of [...loopbackOrigins(baseUrl), 'null']) {
		const response = await loginPost(baseUrl, origin);
		const body = await response.text();
		if (
			response.status === 403 ||
			body.includes('Cross-site POST form submissions are forbidden')
		) {
			throw new Error(`Loopback login POST was rejected for ${origin}.`);
		}
	}

	const blocked = await loginPost(baseUrl, 'https://cross-site.invalid');
	const blockedBody = await blocked.text();
	if (
		blocked.status !== 403 ||
		!blockedBody.includes('Cross-site POST form submissions are forbidden')
	) {
		throw new Error('Untrusted cross-site login POST was not rejected.');
	}

	process.stdout.write(
		'Preview origin smoke passed for loopback and opaque local origins; cross-site blocked.\n'
	);
}

main().catch(() => {
	process.stderr.write('Preview origin smoke failed.\n');
	process.exitCode = 1;
});
