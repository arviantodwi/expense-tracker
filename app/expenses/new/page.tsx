/**
 * Expense Create page - Form to create a new expense
 */

import { redirect } from 'next/navigation';
import { createExpense } from '@/db/queries/expenses';
import { getAllAccounts } from '@/db/queries/accounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { NewExpense } from '@/db/schema';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Handle expense creation form submission
 */
async function handleCreateExpense(formData: FormData): Promise<void> {
	'use server';

	const accountId = parseInt(formData.get('accountId') as string, 10);
	const amount = parseFloat(formData.get('amount') as string);
	const category = formData.get('category') as string;
	const description = formData.get('description') as string;
	const date = formData.get('date') as string;

	// Validate inputs
	if (
		isNaN(accountId) ||
		isNaN(amount) ||
		!category ||
		!date
	) {
		throw new Error('All required fields must be filled');
	}

	const expenseData: NewExpense = {
		accountId,
		amount,
		category,
		description: description || null,
		date: new Date(date),
	};

	const result = await createExpense(expenseData);

	if (!result.success) {
		throw new Error(result.error || 'Failed to create expense');
	}

	redirect('/expenses');
}

export default async function NewExpensePage() {
	// Fetch accounts for the dropdown
	const accountsResult = await getAllAccounts();
	const accounts = accountsResult.success ? accountsResult.data : [];

	// Default date to today
	const today = new Date().toISOString().split('T')[0];

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
					<h1 className="text-3xl font-bold">Add Expense</h1>
					<p className="text-muted-foreground">
						Record a new expense to track your spending
					</p>
				</header>

				{/* Create Form */}
				<Card>
					<CardHeader>
						<CardTitle>Expense Details</CardTitle>
						<CardDescription>
							Enter the details of your expense
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={handleCreateExpense} className="space-y-6">
							{/* Account */}
							<div className="space-y-2">
								<Label htmlFor="accountId">Account</Label>
								<Select name="accountId" required>
									<SelectTrigger>
										<SelectValue placeholder="Select account" />
									</SelectTrigger>
									<SelectContent>
										{accounts.length === 0 ? (
											<SelectItem value="" disabled>
												No accounts available
											</SelectItem>
										) : (
											accounts.map((account) => (
												<SelectItem key={account.id} value={account.id.toString()}>
													{account.name} ({account.currency})
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								{accounts.length === 0 && (
									<p className="text-sm text-muted-foreground">
										<Link href="/accounts/new" className="text-primary hover:underline">
											Create an account first
										</Link>
									</p>
								)}
							</div>

							{/* Amount */}
							<div className="space-y-2">
								<Label htmlFor="amount">Amount</Label>
								<Input
									id="amount"
									name="amount"
									type="number"
									step="0.01"
									placeholder="0.00"
									required
								/>
							</div>

							{/* Category */}
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Select name="category" required>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
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
								/>
							</div>

							{/* Date */}
							<div className="space-y-2">
								<Label htmlFor="date">Date</Label>
								<Input
									id="date"
									name="date"
									type="date"
									defaultValue={today}
									required
								/>
							</div>

							{/* Submit Button */}
							<div className="flex gap-4 pt-4">
								<Button type="submit" className="flex-1">
									Add Expense
								</Button>
								<Link href="/expenses" className="flex-1">
									<Button type="button" variant="outline" className="w-full">
										Cancel
									</Button>
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
