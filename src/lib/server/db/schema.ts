import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Infrastructure-only marker proving that versioned migrations can initialize an
 * empty database. Phase 3 owns every application/domain table.
 */
export const foundationMetadata = sqliteTable('_foundation_metadata', {
	id: integer('id').primaryKey(),
	foundationVersion: text('foundation_version').notNull(),
	appliedAt: text('applied_at').notNull()
});

export const foundationSchema = { foundationMetadata };
