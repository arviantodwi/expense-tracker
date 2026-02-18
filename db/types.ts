/**
 * Shared types for database query results
 */

/**
 * Result type for operations that can fail
 */
export type Result<T> =
	| { success: true; data: T }
	| { success: false; error: string };
