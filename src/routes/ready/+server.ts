import { verifyReadiness } from '$lib/server/config/readiness';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	const ready = verifyReadiness();

	return json(
		{ status: ready ? 'ready' : 'unavailable' },
		{
			status: ready ? 200 : 503,
			headers: {
				'cache-control': 'no-store'
			}
		}
	);
};
