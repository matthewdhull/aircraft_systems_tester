export * from './schema/index.js';

import * as canonicalSchema from './schema/index.js';

/** Complete server-only schema consumed by the Drizzle runtime. */
export const foundationSchema = canonicalSchema;
