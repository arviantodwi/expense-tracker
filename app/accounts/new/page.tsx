/**
 * Account Create page - Form to create a new account
 */

import { redirect } from 'next/navigation';
import { createAccount } from '@/db/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NewAccount } from '@/db/schema';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Handle account creation form submission
 */
async function handleCreateAccount(formData: FormData): Promise<void> {
	'use server';

	const name = formData.get('name') as string;
	const type = formData.get('type') as string;
	const balance = parseFloat(formData.get('balance') as string);
	const currency = formData.get('currency') as string;

	// Validate inputs
	if (!name || !type || isNaN(balance) || !currency) {
		throw new Error('All fields are required');
	}

	const accountData: NewAccount = {
		name,
		type,
		balance,
		currency,
	};

	const result = await createAccount(accountData);

	if (!result.success) {
		throw new Error(result.error || 'Failed to create account');
	}

	redirect('/accounts');
}

export default async function NewAccountPage() {
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
					<h1 className="text-3xl font-bold">Create Account</h1>
					<p className="text-muted-foreground">
						Add a new account to track your finances
					</p>
				</header>

				{/* Create Form */}
				<Card>
					<CardHeader>
						<CardTitle>Account Details</CardTitle>
						<CardDescription>
							Enter the information for your new account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={handleCreateAccount} className="space-y-6">
							{/* Name */}
							<div className="space-y-2">
								<Label htmlFor="name">Account Name</Label>
								<Input
									id="name"
									name="name"
									placeholder="e.g., My Checking Account"
									required
								/>
							</div>

							{/* Type */}
							<div className="space-y-2">
								<Label htmlFor="type">Account Type</Label>
								<Select name="type" required>
									<SelectTrigger>
										<SelectValue placeholder="Select account type" />
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
									placeholder="0.00"
									defaultValue="0.00"
									required
								/>
							</div>

							{/* Currency */}
							<div className="space-y-2">
								<Label htmlFor="currency">Currency</Label>
								<Select name="currency" defaultValue="USD" required>
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

							{/* Submit Button */}
							<div className="flex gap-4 pt-4">
								<Button type="submit" className="flex-1">
									Create Account
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
