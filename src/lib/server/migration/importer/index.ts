export { importLegacyDump, profileLegacyDump } from './importer.js';
export { IMPORTER_VERSION, IMPORT_NAMESPACE, importedId, uuidV5 } from './identifiers.js';
export { parseMysqlDump, scanMysqlTableDeclarations } from './parser.js';
export { SOURCE_COLUMNS, SOURCE_DISPOSITIONS } from './source-shape.js';
export {
	LegacyImportError,
	type ApprovedSource,
	type ImportResult,
	type ParsedInsertRow,
	type SourceProfile
} from './types.js';
