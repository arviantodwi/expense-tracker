/**
 * Dashboard page - Main view with overview statistics
 * Server-side data fetching with async component
 */

import { ExpenseCard } from '@/components/expense-card';
import { AccountCard } from '@/components/account-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllAccounts, getRecentExpenses, getTotalBalance, getTotalExpenses, getAccountById } from '@/db/queries';
import Link from 'next/link';
import type { Account } from '@/db/schema';

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount);
}

export default async function DashboardPage() {
	// Fetch data in parallel for better performance
	const [accountsResult, expensesResult, totalBalanceResult, totalExpensesResult] =
		await Promise.all([
			getAllAccounts(),
			getRecentExpenses(5),
			getTotalBalance(),
			getTotalExpenses(),
		]);

	// Extract data or use empty arrays/zeros on error
	const accounts = accountsResult.success ? accountsResult.data : [];
	const expenses = expensesResult.success ? expensesResult.data : [];
	const totalBalance = totalBalanceResult.success ? totalBalanceResult.data : 0;
	const totalExpenses = totalExpensesResult.success ? totalExpensesResult.data : 0;

	// Fetch account names for expenses in a single query for efficiency
	const accountIds = [...new Set(expenses.map((e) => e.accountId))];
	const accountsMap = new Map<number, Account>();

	if (accountIds.length > 0) {
		const accountsData = await Promise.all(
			accountIds.map((id) => getAccountById(id))
		);

		accountsData.forEach((result) => {
			if (result.success && result.data) {
				accountsMap.set(result.data.id, result.data);
			}
		});
	}

	// Attach account names to expenses
	const expensesWithAccountNames = expenses.map((expense) => ({
		...expense,
		accountName: accountsMap.get(expense.accountId)?.name,
	}));

	return (
		<main className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<header className="mb-8">
					<h1 className="text-4xl font-bold mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Overview of your accounts and expenses
					</p>
				</header>

				{/* Summary Statistics */}
				<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Balance
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">
								{formatCurrency(totalBalance)}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Expenses
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">
								{formatCurrency(totalExpenses)}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Accounts
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{accounts.length}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Recent Expenses
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">{expenses.length}</p>
						</CardContent>
					</Card>
				</section>

				{/* Accounts Section */}
				<section className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-bold">Accounts</h2>
						<Link
							href="/accounts"
							className="text-sm text-primary hover:underline"
						>
							View all
						</Link>
					</div>

					{accounts.length === 0 ? (
						<Card>
							<CardContent className="py-8">
								<p className="text-center text-muted-foreground">
									No accounts yet. Create your first account to get started.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{accounts.map((account) => (
								<AccountCard key={account.id} account={account} />
							))}
						</div>
					)}
				</section>

				{/* Recent Expenses Section */}
				<section className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-bold">Recent Expenses</h2>
						<Link
							href="/expenses"
							className="text-sm text-primary hover:underline"
						>
							View all
						</Link>
					</div>

					{expenses.length === 0 ? (
						<Card>
							<CardContent className="py-8">
								<p className="text-center text-muted-foreground">
									No expenses yet. Start tracking your spending.
								</p>
							</CardContent>
						</Card>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{expensesWithAccountNames.map((expense) => (
								<ExpenseCard key={expense.id} expense={expense} />
							))}
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
