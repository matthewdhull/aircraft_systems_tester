import { resolve } from 'node:path';

import { openDatabase } from '../../src/lib/server/db/index.js';
import {
	importLegacyDump,
	LegacyImportError,
	profileLegacyDump,
	type ApprovedSource
} from '../../src/lib/server/migration/importer/index.js';

const SOURCES: Readonly<Record<string, ApprovedSource>> = {
	fixture: {
		path: resolve('fixtures/phase-1/legacy-source/data.sql'),
		sha256: 'a8e02025608f7ca1cbd3020fed7863dba9128938b303a97643a59e746b169eec',
		byteSize: 3_610
	},
	authoritative: {
		path: resolve('backups/xjtest_production_backup.11.22.14.sql'),
		sha256: 'ba80e79c842c79c51fc4cb1dce6661dbfbcc2fbe10d7e8c8b040b813428e3d70',
		byteSize: 15_472_302
	}
};

function option(name: string): string | undefined {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
	const sourceName = option('--source');
	const source = sourceName ? SOURCES[sourceName] : undefined;
	if (!source) throw new LegacyImportError();
	if (process.argv.includes('--profile')) {
		process.stdout.write(`${JSON.stringify(await profileLegacyDump(source))}\n`);
		return;
	}
	const dryRun = process.argv.includes('--dry-run');
	const target = dryRun ? ':memory:' : option('--target');
	if (!target) throw new LegacyImportError();
	const handle = openDatabase({ path: target });
	try {
		const result = await importLegacyDump(handle, source);
		process.stdout.write(`${JSON.stringify(result)}\n`);
	} finally {
		handle.close();
	}
}

main().catch(() => {
	process.stderr.write('Legacy migration command failed.\n');
	process.exitCode = 1;
});
