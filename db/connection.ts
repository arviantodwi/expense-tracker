/**
 * Database connection utilities
 * Provides singleton pattern for SQLite connection management
 */

import Database from 'better-sqlite3';

let databaseInstance: Database.Database | null = null;

/**
 * Get the database file path from environment
 */
export function getDatabasePath(): string {
	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) {
		throw new Error('DATABASE_URL environment variable is not set');
	}
	// Handle file: prefix if present
	return dbUrl.replace('file:', '');
}

/**
 * Create a new database connection
 * @param filePath - Path to the SQLite database file
 */
export function createConnection(filePath?: string): Database.Database {
	const path = filePath ?? getDatabasePath();
	return new Database(path);
}

/**
 * Get the singleton database instance
 * Creates a new connection if one doesn't exist
 */
export function getConnection(): Database.Database {
	if (!databaseInstance) {
		databaseInstance = createConnection();
	}
	return databaseInstance;
}

/**
 * Close the database connection
 * Useful for testing and cleanup
 */
export function closeConnection(): void {
	if (databaseInstance) {
		databaseInstance.close();
		databaseInstance = null;
	}
}

/**
 * Reset the connection (for testing purposes)
 */
export function resetConnection(): void {
	closeConnection();
}
