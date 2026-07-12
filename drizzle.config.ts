import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DATABASE_PATH ?? './.runtime/aircraft-systems-tester.sqlite'
	},
	strict: true,
	verbose: false
});
