/**
 * Accounts List page - Display all accounts with management actions
 * Server-side data fetching with async component
 */

import { AccountCard } from '@/components/account-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllAccounts } from '@/db/queries';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function AccountsListPage() {
	const accountsResult = await getAllAccounts();
	const accounts = accountsResult.success ? accountsResult.data : [];

	return (
		<main className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<header className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold mb-2">Accounts</h1>
							<p className="text-muted-foreground">
								Manage your bank accounts, credit cards, and cash
							</p>
						</div>
						<Link href="/accounts/new">
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Add Account
							</Button>
						</Link>
					</div>
				</header>

				{/* Accounts Grid */}
				{accounts.length === 0 ? (
					<Card>
						<CardContent className="py-16">
							<div className="text-center">
								<p className="text-lg text-muted-foreground mb-4">
									No accounts yet
								</p>
								<p className="text-sm text-muted-foreground mb-6">
									Create your first account to start tracking your finances
								</p>
								<Link href="/accounts/new">
									<Button>
										<Plus className="mr-2 h-4 w-4" />
										Create Account
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{accounts.map((account) => (
							<AccountCard key={account.id} account={account} />
						))}
					</div>
				)}
			</div>
		</main>
	);
}
