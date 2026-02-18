/**
 * API route for creating expenses
 * POST /api/expenses
 */

import { createExpense } from '@/db/queries/expenses';
import { NextResponse } from 'next/server';
import type { NewExpense } from '@/db/schema';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { accountId, amount, category, description, date } = body;

		// Validate inputs
		if (!accountId || isNaN(accountId)) {
			return NextResponse.json(
				{ success: false, error: 'Account ID is required' },
				{ status: 400 }
			);
		}

		if (!amount || isNaN(amount)) {
			return NextResponse.json(
				{ success: false, error: 'Amount is required' },
				{ status: 400 }
			);
		}

		if (!category) {
			return NextResponse.json(
				{ success: false, error: 'Category is required' },
				{ status: 400 }
			);
		}

		if (!date) {
			return NextResponse.json(
				{ success: false, error: 'Date is required' },
				{ status: 400 }
			);
		}

		// Create expense
		const expenseData: NewExpense = {
			accountId,
			amount,
			category,
			description: description || null,
			date: new Date(date),
		};

		const result = await createExpense(expenseData);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: result.error || 'Failed to create expense' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			data: result.data,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 }
		);
	}
}
