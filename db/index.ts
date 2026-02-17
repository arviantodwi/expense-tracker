/**
 * Database client export with singleton pattern
 * Re-exports schema types for convenience
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { getConnection } from './connection';
import * as schema from './schema';

// Singleton database client using the shared connection
export const db = drizzle(getConnection(), { schema });

// Re-export schema and types
export * from './schema';
export { getConnection, closeConnection, resetConnection } from './connection';
