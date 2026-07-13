import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export const DEVELOPMENT_PREVIEW_TRUSTED_ORIGINS = Object.freeze([
	'http://127.0.0.1:5173',
	'http://localhost:5173',
	'null'
]);

/** @param {string | undefined} appEnvironment */
export function trustedOriginsForAppEnvironment(appEnvironment) {
	return appEnvironment === 'development' ? [...DEVELOPMENT_PREVIEW_TRUSTED_ORIGINS] : [];
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter({ out: 'build' }),
		csrf: {
			trustedOrigins: trustedOriginsForAppEnvironment(process.env.APP_ENV)
		}
	}
};

export default config;
