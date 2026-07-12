import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
	globalIgnores([
		'.svelte-kit/**',
		'build/**',
		'node_modules/**',
		'CSS/**',
		'Classes/**',
		'PHPScripts/**',
		'backups/**',
		'downloadables/**',
		'images/**',
		'js/**',
		'Task Analysis Planning/**',
		'*.js',
		'!eslint.config.js',
		'!prettier.config.js',
		'!svelte.config.js'
	]),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		files: ['src/**/*.{js,ts,svelte}', 'tests/**/*.{js,ts}', '*.{js,ts}'],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	}
);
