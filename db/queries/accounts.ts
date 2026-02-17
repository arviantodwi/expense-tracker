/**
 * Account CRUD operations
 * Pure functions with error handling for account management
 */

import { eq, desc, asc } from 'drizzle-orm';
import { db, accounts, type Account, type NewAccount } from '../index';

/**
 * Result type for operations that can fail
 */
export type Result<T> =
	| { success: true; data: T }
	| { success: false; error: string };

/**
 * Create a new account
 */
export async function createAccount(
	data: NewAccount,
): Promise<Result<Account>> {
	try {
		const [account] = await db.insert(accounts).values(data).returning();
		return { success: true, data: account };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to create account';
		return { success: false, error: message };
	}
}

/**
 * Get all accounts ordered by creation date (newest first)
 */
export async function getAllAccounts(): Promise<Result<Account[]>> {
	try {
		const allAccounts = await db
			.select()
			.from(accounts)
			.orderBy(desc(accounts.createdAt));
		return { success: true, data: allAccounts };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch accounts';
		return { success: false, error: message };
	}
}

/**
 * Get a single account by ID
 */
export async function getAccountById(id: number): Promise<Result<Account | null>> {
	try {
		const [account] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.id, id));
		return { success: true, data: account ?? null };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch account';
		return { success: false, error: message };
	}
}

/**
 * Get accounts by type
 */
export async function getAccountsByType(
	type: string,
): Promise<Result<Account[]>> {
	try {
		const filteredAccounts = await db
			.select()
			.from(accounts)
			.where(eq(accounts.type, type))
			.orderBy(desc(accounts.createdAt));
		return { success: true, data: filteredAccounts };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch accounts';
		return { success: false, error: message };
	}
}

/**
 * Update an account by ID
 */
export async function updateAccount(
	id: number,
	data: Partial<Omit<NewAccount, 'id'>>,
): Promise<Result<Account | null>> {
	try {
		const [updated] = await db
			.update(accounts)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(accounts.id, id))
			.returning();
		return { success: true, data: updated ?? null };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to update account';
		return { success: false, error: message };
	}
}

/**
 * Delete an account by ID
 */
export async function deleteAccount(id: number): Promise<Result<boolean>> {
	try {
		const [deleted] = await db
			.delete(accounts)
			.where(eq(accounts.id, id))
			.returning();
		return { success: true, data: deleted !== undefined };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to delete account';
		return { success: false, error: message };
	}
}

/**
 * Get total balance across all accounts
 */
export async function getTotalBalance(): Promise<Result<number>> {
	try {
		const allAccounts = await db.select().from(accounts);
		const total = allAccounts.reduce(
			(sum, account) => sum + account.balance,
			0,
		);
		return { success: true, data: total };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to calculate balance';
		return { success: false, error: message };
	}
}

/**
 * Get accounts sorted by balance (highest first)
 */
export async function getAccountsByBalance(): Promise<Result<Account[]>> {
	try {
		const sortedAccounts = await db
			.select()
			.from(accounts)
			.orderBy(desc(accounts.balance));
		return { success: true, data: sortedAccounts };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch accounts';
		return { success: false, error: message };
	}
}
