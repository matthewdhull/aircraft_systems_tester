import { createHash } from 'node:crypto';

export const IMPORT_NAMESPACE = 'e1777bf5-7f78-5d25-9ca4-b5241031263f';
export const IMPORTER_VERSION = 'phase-3-v1';
export const IMPORTED_AT = '2014-01-01T00:00:00.000Z';

function uuidBytes(uuid: string): Buffer {
	return Buffer.from(uuid.replaceAll('-', ''), 'hex');
}

export function uuidV5(name: string, namespace = IMPORT_NAMESPACE): string {
	const bytes = createHash('sha1')
		.update(uuidBytes(namespace))
		.update(name, 'utf8')
		.digest()
		.subarray(0, 16);
	bytes[6] = (bytes[6]! & 0x0f) | 0x50;
	bytes[8] = (bytes[8]! & 0x3f) | 0x80;
	const hex = bytes.toString('hex');
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function importedId(
	sourceTable: string,
	sourceId: string,
	targetTable: string,
	targetVersion = 1
): string {
	return uuidV5(`ast:legacy-2014:${sourceTable}:${sourceId}:${targetTable}:${targetVersion}`);
}

export function fingerprint(parts: readonly unknown[]): string {
	return createHash('sha256').update(JSON.stringify(parts), 'utf8').digest('hex');
}
