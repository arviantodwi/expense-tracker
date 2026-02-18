/**
 * Expenses List page - Display all expenses with search and filter
 * Server-side data fetching with async component
 */

import { ExpenseCard } from '@/components/expense-card';
import { QuickAddExpenseButton } from '@/components/quick-add-expense-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllExpenses, searchExpensesByDescription, getExpensesByCategory, getExpensesByDateRange } from '@/db/queries';
import { getAllAccounts } from '@/db/queries/accounts';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Calendar } from 'lucide-react';
import type { Account } from '@/db/schema';

/**
 * Handle search form submission
 */
async function handleSearch(formData: FormData): Promise<void> {
	'use server';

	const query = formData.get('search') as string;
	const category = formData.get('category') as string;
	const startDate = formData.get('startDate') as string;
	const endDate = formData.get('endDate') as string;

	// Build search params
	const params = new URLSearchParams();
	if (query) params.set('search', query);
	if (category) params.set('category', category);
	if (startDate) params.set('startDate', startDate);
	if (endDate) params.set('endDate', endDate);

	redirect(`/expenses?${params.toString()}`);
}

export default async function ExpensesListPage({
	searchParams,
}: {
	searchParams: Promise<{ search?: string; category?: string; startDate?: string; endDate?: string }>;
}) {
	const params = await searchParams;
	const searchTerm = params.search || '';
	const categoryFilter = params.category || '';
	const startDate = params.startDate || '';
	const endDate = params.endDate || '';

	// Fetch data
	let expensesResult;

	// Date range filter takes precedence
	if (startDate || endDate) {
		const start = startDate ? new Date(startDate) : new Date('1970-01-01');
		const end = endDate ? new Date(endDate) : new Date();
		end.setHours(23, 59, 59, 999); // Include entire end date
		expensesResult = await getExpensesByDateRange(start, end);
	} else if (searchTerm) {
		expensesResult = await searchExpensesByDescription(searchTerm);
	} else if (categoryFilter && categoryFilter !== 'all') {
		expensesResult = await getExpensesByCategory(categoryFilter);
	} else {
		expensesResult = await getAllExpenses();
	}

	const expenses = expensesResult.success ? expensesResult.data : [];

	// Fetch all accounts for account names
	const accountsResult = await getAllAccounts();
	const accounts = accountsResult.success ? accountsResult.data : [];

	// Create account lookup map
	const accountsMap = new Map<number, Account>(
		accounts.map((account) => [account.id, account])
	);

	// Attach account names to expenses
	const expensesWithAccountNames = expenses.map((expense) => ({
		...expense,
		accountName: accountsMap.get(expense.accountId)?.name,
	}));

	const hasFilters = searchTerm || categoryFilter || startDate || endDate;

	return (
		<main className="min-h-screen bg-background">
			{/* Quick Add Expense Button */}
			<QuickAddExpenseButton accounts={accounts} />

			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<header className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-4xl font-bold mb-2">Expenses</h1>
							<p className="text-muted-foreground">
								Track and manage your spending
							</p>
						</div>
						<Link href="/expenses/new">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Add Expense
							</Button>
						</Link>
					</div>

					{/* Search and Filter */}
					<Card className="mb-6">
						<CardContent className="pt-6">
							<form action={handleSearch} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Search */}
									<div className="space-y-2">
										<Label htmlFor="search">Search</Label>
										<div className="relative">
											<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="search"
												name="search"
												placeholder="Search expenses..."
												defaultValue={searchTerm}
												className="pl-10"
											/>
										</div>
									</div>

									{/* Category */}
									<div className="space-y-2">
										<Label htmlFor="category">Category</Label>
										<Select name="category" defaultValue={categoryFilter || 'all'}>
											<SelectTrigger>
												<SelectValue placeholder="All categories" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All categories</SelectItem>
												<SelectItem value="food">Food</SelectItem>
												<SelectItem value="transport">Transport</SelectItem>
												<SelectItem value="utilities">Utilities</SelectItem>
												<SelectItem value="entertainment">Entertainment</SelectItem>
												<SelectItem value="health">Health</SelectItem>
												<SelectItem value="shopping">Shopping</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Start Date */}
									<div className="space-y-2">
										<Label htmlFor="startDate">From</Label>
										<div className="relative">
											<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="startDate"
												name="startDate"
												type="date"
												defaultValue={startDate}
												className="pl-10"
											/>
										</div>
									</div>

									{/* End Date */}
									<div className="space-y-2">
										<Label htmlFor="endDate">To</Label>
										<div className="relative">
											<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="endDate"
												name="endDate"
												type="date"
												defaultValue={endDate}
												className="pl-10"
											/>
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-2">
									<Button type="submit">
										<Search className="mr-2 h-4 w-4" />
										Search
									</Button>
									{hasFilters && (
										<Button type="button" variant="outline" asChild>
											<Link href="/expenses">Clear Filters</Link>
										</Button>
									)}
								</div>
							</form>
						</CardContent>
					</Card>
				</header>

				{/* Expenses Grid */}
				{expenses.length === 0 ? (
					<Card>
						<CardContent className="py-16">
							<div className="text-center">
								<p className="text-lg text-muted-foreground mb-4">
									{hasFilters ? 'No expenses found' : 'No expenses yet'}
								</p>
								{!hasFilters && (
									<>
										<p className="text-sm text-muted-foreground mb-6">
											Start tracking your spending by adding your first expense
										</p>
										<Link href="/expenses/new">
											<Button>
												<Plus className="mr-2 h-4 w-4" />
												Add Expense
											</Button>
										</Link>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{expensesWithAccountNames.map((expense) => (
							<ExpenseCard key={expense.id} expense={expense} />
						))}
					</div>
				)}
			</div>
		</main>
	);
}
