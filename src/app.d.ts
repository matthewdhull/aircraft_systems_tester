import type { AuthenticatedPrincipal } from '$lib/server/authorization';
import type { DatabaseHandle } from '$lib/server/db';

declare global {
	namespace App {
		interface Locals {
			database: DatabaseHandle;
			principal: AuthenticatedPrincipal | null;
		}
	}
}

export {};
