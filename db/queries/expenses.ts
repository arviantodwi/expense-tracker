/**
 * Expense CRUD operations
 * Pure functions with error handling for expense management
 */

import { eq, desc, asc, and, gte, lte, like } from 'drizzle-orm';
import {
	db,
	expenses,
	accounts,
	type Expense,
	type NewExpense,
	type Account,
} from '../index';

/**
 * Result type for operations that can fail
 */
export type Result<T> =
	| { success: true; data: T }
	| { success: false; error: string };

/**
 * Expense with related account information
 */
export type ExpenseWithAccount = Expense & { account: Account | null };

/**
 * Create a new expense
 */
export async function createExpense(data: NewExpense): Promise<Result<Expense>> {
	try {
		const [expense] = await db.insert(expenses).values(data).returning();
		return { success: true, data: expense };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to create expense';
		return { success: false, error: message };
	}
}

/**
 * Get all expenses ordered by date (newest first)
 */
export async function getAllExpenses(): Promise<Result<Expense[]>> {
	try {
		const allExpenses = await db
			.select()
			.from(expenses)
			.orderBy(desc(expenses.date));
		return { success: true, data: allExpenses };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expenses';
		return { success: false, error: message };
	}
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: number): Promise<Result<Expense | null>> {
	try {
		const [expense] = await db
			.select()
			.from(expenses)
			.where(eq(expenses.id, id));
		return { success: true, data: expense ?? null };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expense';
		return { success: false, error: message };
	}
}

/**
 * Get expenses by account ID
 */
export async function getExpensesByAccountId(
	accountId: number,
): Promise<Result<Expense[]>> {
	try {
		const accountExpenses = await db
			.select()
			.from(expenses)
			.where(eq(expenses.accountId, accountId))
			.orderBy(desc(expenses.date));
		return { success: true, data: accountExpenses };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expenses';
		return { success: false, error: message };
	}
}

/**
 * Get expenses by category
 */
export async function getExpensesByCategory(
	category: string,
): Promise<Result<Expense[]>> {
	try {
		const categoryExpenses = await db
			.select()
			.from(expenses)
			.where(eq(expenses.category, category))
			.orderBy(desc(expenses.date));
		return { success: true, data: categoryExpenses };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expenses';
		return { success: false, error: message };
	}
}

/**
 * Get expenses within a date range
 */
export async function getExpensesByDateRange(
	startDate: Date,
	endDate: Date,
): Promise<Result<Expense[]>> {
	try {
		const rangeExpenses = await db
			.select()
			.from(expenses)
			.where(
				and(gte(expenses.date, startDate), lte(expenses.date, endDate)),
			)
			.orderBy(desc(expenses.date));
		return { success: true, data: rangeExpenses };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expenses';
		return { success: false, error: message };
	}
}

/**
 * Search expenses by description
 */
export async function searchExpensesByDescription(
	query: string,
): Promise<Result<Expense[]>> {
	try {
		const searchResults = await db
			.select()
			.from(expenses)
			.where(like(expenses.description, `%${query}%`))
			.orderBy(desc(expenses.date));
		return { success: true, data: searchResults };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to search expenses';
		return { success: false, error: message };
	}
}

/**
 * Update an expense by ID
 */
export async function updateExpense(
	id: number,
	data: Partial<Omit<NewExpense, 'id'>>,
): Promise<Result<Expense | null>> {
	try {
		const [updated] = await db
			.update(expenses)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(expenses.id, id))
			.returning();
		return { success: true, data: updated ?? null };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to update expense';
		return { success: false, error: message };
	}
}

/**
 * Delete an expense by ID
 */
export async function deleteExpense(id: number): Promise<Result<boolean>> {
	try {
		const [deleted] = await db
			.delete(expenses)
			.where(eq(expenses.id, id))
			.returning();
		return { success: true, data: deleted !== undefined };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to delete expense';
		return { success: false, error: message };
	}
}

/**
 * Get total expenses amount
 */
export async function getTotalExpenses(): Promise<Result<number>> {
	try {
		const allExpenses = await db.select().from(expenses);
		const total = allExpenses.reduce(
			(sum, expense) => sum + expense.amount,
			0,
		);
		return { success: true, data: total };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to calculate total';
		return { success: false, error: message };
	}
}

/**
 * Get total expenses for a specific account
 */
export async function getTotalExpensesByAccount(
	accountId: number,
): Promise<Result<number>> {
	try {
		const accountExpenses = await db
			.select()
			.from(expenses)
			.where(eq(expenses.accountId, accountId));
		const total = accountExpenses.reduce(
			(sum, expense) => sum + expense.amount,
			0,
		);
		return { success: true, data: total };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to calculate total';
		return { success: false, error: message };
	}
}

/**
 * Get recent expenses with limit
 */
export async function getRecentExpenses(
	limit: number,
): Promise<Result<Expense[]>> {
	try {
		const recentExpenses = await db
			.select()
			.from(expenses)
			.orderBy(desc(expenses.date))
			.limit(limit);
		return { success: true, data: recentExpenses };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expenses';
		return { success: false, error: message };
	}
}

/**
 * Get expenses with pagination
 */
export async function getExpensesPaginated(
	page: number,
	pageSize: number,
): Promise<Result<Expense[]>> {
	try {
		const offset = (page - 1) * pageSize;
		const paginatedExpenses = await db
			.select()
			.from(expenses)
			.orderBy(desc(expenses.date))
			.limit(pageSize)
			.offset(offset);
		return { success: true, data: paginatedExpenses };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expenses';
		return { success: false, error: message };
	}
}

/**
 * Get expense with account information
 */
export async function getExpenseWithAccount(
	id: number,
): Promise<Result<ExpenseWithAccount | null>> {
	try {
		const [expense] = await db
			.select()
			.from(expenses)
			.where(eq(expenses.id, id));

		if (!expense) {
			return { success: true, data: null };
		}

		const [account] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.id, expense.accountId));

		return {
			success: true,
			data: {
				...expense,
				account: account ?? null,
			},
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch expense';
		return { success: false, error: message };
	}
}
