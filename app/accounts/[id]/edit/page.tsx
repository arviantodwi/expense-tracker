/**
 * Account Edit page - Form to edit an existing account
 */

import { notFound, redirect } from 'next/navigation';
import { getAccountById, updateAccount } from '@/db/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EditAccountPageProps {
	params: Promise<{ id: string }>;
}

/**
 * Handle account update form submission
 */
async function handleUpdateAccount(formData: FormData): Promise<void> {
	'use server';

	const id = parseInt(formData.get('id') as string, 10);
	const name = formData.get('name') as string;
	const type = formData.get('type') as string;
	const balance = parseFloat(formData.get('balance') as string);
	const currency = formData.get('currency') as string;

	// Validate inputs
	if (isNaN(id) || !name || !type || isNaN(balance) || !currency) {
		throw new Error('All fields are required');
	}

	const result = await updateAccount(id, {
		name,
		type,
		balance,
		currency,
	});

	if (!result.success || !result.data) {
		throw new Error('Failed to update account');
	}

	redirect('/accounts');
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
	const { id } = await params;
	const accountId = parseInt(id, 10);

	const result = await getAccountById(accountId);

	if (!result.success || !result.data) {
		notFound();
	}

	const account = result.data;

	return (
		<main className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				{/* Header */}
				<header className="mb-8">
					<Link
						href="/accounts"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Accounts
					</Link>
					<h1 className="text-3xl font-bold">Edit Account</h1>
					<p className="text-muted-foreground">
						Update account information
					</p>
				</header>

				{/* Edit Form */}
				<Card>
					<CardHeader>
						<CardTitle>Account Details</CardTitle>
						<CardDescription>
							Make changes to your account information
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={handleUpdateAccount} className="space-y-6">
							<input type="hidden" name="id" value={account.id} />

							{/* Name */}
							<div className="space-y-2">
								<Label htmlFor="name">Account Name</Label>
								<Input
									id="name"
									name="name"
									defaultValue={account.name}
									placeholder="e.g., My Checking Account"
									required
								/>
							</div>

							{/* Type */}
							<div className="space-y-2">
								<Label htmlFor="type">Account Type</Label>
								<Select name="type" defaultValue={account.type} required>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="checking">Checking</SelectItem>
										<SelectItem value="savings">Savings</SelectItem>
										<SelectItem value="credit">Credit Card</SelectItem>
										<SelectItem value="cash">Cash</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Balance */}
							<div className="space-y-2">
								<Label htmlFor="balance">Balance</Label>
								<Input
									id="balance"
									name="balance"
									type="number"
									step="0.01"
									defaultValue={account.balance.toString()}
									required
								/>
							</div>

							{/* Currency */}
							<div className="space-y-2">
								<Label htmlFor="currency">Currency</Label>
								<Select name="currency" defaultValue={account.currency} required>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="USD">USD - US Dollar</SelectItem>
										<SelectItem value="EUR">EUR - Euro</SelectItem>
										<SelectItem value="GBP">GBP - British Pound</SelectItem>
										<SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
										<SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
										<SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Submit Buttons */}
							<div className="flex gap-4 pt-4">
								<Button type="submit" className="flex-1">
									Save Changes
								</Button>
								<Link href="/accounts" className="flex-1">
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
