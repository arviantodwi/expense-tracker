/**
 * Expense Edit page - Form to edit an existing expense
 */

import { notFound, redirect } from 'next/navigation';
import { getExpenseById, updateExpense, deleteExpense } from '@/db/queries/expenses';
import { getAllAccounts } from '@/db/queries/accounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import type { Account } from '@/db/schema';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface EditExpensePageProps {
	params: Promise<{ id: string }>;
}

/**
 * Handle expense update form submission
 */
async function handleUpdateExpense(formData: FormData): Promise<void> {
	'use server';

	const id = parseInt(formData.get('id') as string, 10);
	const accountId = parseInt(formData.get('accountId') as string, 10);
	const amount = parseFloat(formData.get('amount') as string);
	const category = formData.get('category') as string;
	const description = formData.get('description') as string;
	const date = formData.get('date') as string;

	// Validate inputs
	if (
		isNaN(id) ||
		isNaN(accountId) ||
		isNaN(amount) ||
		!category ||
		!date
	) {
		throw new Error('All required fields must be filled');
	}

	const result = await updateExpense(id, {
		accountId,
		amount,
		category,
		description: description || null,
		date: new Date(date),
	});

	if (!result.success || !result.data) {
		throw new Error('Failed to update expense');
	}

	redirect('/expenses');
}

/**
 * Handle expense deletion
 */
async function handleDeleteExpense(formData: FormData): Promise<void> {
	'use server';

	const id = parseInt(formData.get('id') as string, 10);

	if (isNaN(id)) {
		throw new Error('Invalid expense ID');
	}

	const result = await deleteExpense(id);

	if (!result.success) {
		throw new Error('Failed to delete expense');
	}

	redirect('/expenses');
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
	const { id } = await params;
	const expenseId = parseInt(id, 10);

	// Fetch expense and accounts
	const [expenseResult, accountsResult] = await Promise.all([
		getExpenseById(expenseId),
		getAllAccounts(),
	]);

	if (!expenseResult.success || !expenseResult.data) {
		notFound();
	}

	const expense = expenseResult.data;
	const accounts = accountsResult.success ? accountsResult.data : [];

	// Format date for input
	const dateStr = new Date(expense.date).toISOString().split('T')[0];

	return (
		<main className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				{/* Header */}
				<header className="mb-8">
					<Link
						href="/expenses"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Expenses
					</Link>
					<h1 className="text-3xl font-bold">Edit Expense</h1>
					<p className="text-muted-foreground">
						Update expense details
					</p>
				</header>

				{/* Edit Form */}
				<Card>
					<CardHeader>
						<CardTitle>Expense Details</CardTitle>
						<CardDescription>
							Make changes to your expense information
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={handleUpdateExpense} className="space-y-6">
							<input type="hidden" name="id" value={expense.id} />

							{/* Account */}
							<div className="space-y-2">
								<Label htmlFor="accountId">Account</Label>
								<Select name="accountId" defaultValue={expense.accountId.toString()} required>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{accounts.length === 0 ? (
											<SelectItem value="" disabled>
												No accounts available
											</SelectItem>
										) : (
											accounts.map((account: Account) => (
												<SelectItem key={account.id} value={account.id.toString()}>
													{account.name} ({account.currency})
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							</div>

							{/* Amount */}
							<div className="space-y-2">
								<Label htmlFor="amount">Amount</Label>
								<Input
									id="amount"
									name="amount"
									type="number"
									step="0.01"
									defaultValue={expense.amount.toString()}
									required
								/>
							</div>

							{/* Category */}
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select name="category" defaultValue={expense.category} required>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
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

							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									name="description"
									placeholder="Optional description..."
									rows={3}
									defaultValue={expense.description || ''}
								/>
							</div>

							{/* Date */}
							<div className="space-y-2">
								<Label htmlFor="date">Date</Label>
								<Input
									id="date"
									name="date"
									type="date"
									defaultValue={dateStr}
									required
								/>
							</div>

							{/* Submit Buttons */}
							<div className="flex gap-4 pt-4">
								<Button type="submit" className="flex-1">
									Save Changes
								</Button>
								<Link href="/expenses" className="flex-1">
									<Button type="button" variant="outline" className="w-full">
										Cancel
									</Button>
								</Link>
							</div>

							{/* Delete Button */}
							<div className="pt-4 border-t">
								<form action={handleDeleteExpense}>
									<input type="hidden" name="id" value={expense.id} />
									<Dialog>
										<DialogTrigger asChild>
											<Button type="button" variant="destructive" className="w-full">
												<Trash2 className="mr-2 h-4 w-4" />
												Delete Expense
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Delete Expense</DialogTitle>
												<DialogDescription>
													Are you sure you want to delete this expense? This action cannot be undone.
												</DialogDescription>
											</DialogHeader>
											<DialogFooter>
												<Button type="button" variant="outline" asChild>
													<Link href={`/expenses/${expense.id}/edit`}>Cancel</Link>
												</Button>
												<Button type="submit" variant="destructive">
													Delete
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</form>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
