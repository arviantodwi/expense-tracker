/**
 * Dashboard page - Main view with overview statistics
 * Server-side data fetching with async component
 */

import { ExpenseCard } from '@/components/expense-card';
import { AccountCard } from '@/components/account-card';
import { QuickAddExpenseButton } from '@/components/quick-add-expense-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllAccounts, getRecentExpenses, getTotalBalance, getTotalExpenses, getAccountById } from '@/db/queries';
import Link from 'next/link';
import type { Account } from '@/db/schema';
import {
	LayoutDashboard,
	ReceiptText,
	TrendingUpDown,
	CreditCard,
	Landmark,
	Wallet,
	Plus,
} from 'lucide-react';

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount);
}

const menuItems = [
	{ icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
	{ icon: ReceiptText, label: 'Expenses', href: '/expenses', active: false },
	{ icon: TrendingUpDown, label: 'Analysis', href: '/analysis', active: false },
];

const accountItems = [
	{ icon: CreditCard, label: 'BRI Tokopedia Card', href: '/accounts', active: false },
	{ icon: Landmark, label: 'Jago', href: '/accounts', active: false },
	{ icon: Wallet, label: 'Cash', href: '/accounts', active: false },
	{ icon: Plus, label: 'Add new account', href: '/accounts/new', active: false, addNew: true },
];

function Sidebar() {
	return (
		<aside className="w-[250px] h-[800px] bg-white rounded-[24px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.02),0px_4px_20px_-2px_rgba(0,0,0,0.05)] border border-black/[0.08] flex flex-col py-5 px-0">
			{/* Header */}
			<div className="flex items-center justify-between px-4 mb-6">
				<span className="text-xl font-semibold text-gray-800">Expense Tracker</span>
			</div>

			{/* Menu Section - MENU */}
			<nav className="flex flex-col gap-2 px-4 mb-6">
				<span className="text-[11px] text-[#7A7A7A] font-normal uppercase tracking-wide px-2.5 mb-1">
					Menu
				</span>
				{menuItems.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.label}
							href={item.href}
							className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg transition-colors ${
								item.active
									? 'bg-[#7C896F] text-white'
									: 'text-[#334155] hover:bg-gray-100'
							}`}
						>
							<Icon size={16} />
							<span className={`text-sm ${item.active ? 'font-semibold' : 'font-medium'}`}>
								{item.label}
							</span>
						</Link>
					);
				})}
			</nav>

			{/* Menu Section - ACCOUNTS */}
			<nav className="flex flex-col gap-2 px-4">
				<span className="text-[11px] text-[#7A7A7A] font-normal uppercase tracking-wide px-2.5 mb-1">
					Accounts
				</span>
				{accountItems.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.label}
							href={item.href}
							className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg transition-colors ${
								item.addNew
									? 'text-[#7C896F] hover:bg-gray-100 font-medium text-[13px]'
									: 'text-[#334155] hover:bg-gray-100'
							}`}
						>
							<Icon size={16} />
							<span className="text-sm font-medium">{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
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
		<main className="min-h-screen bg-[#F1F3F2] flex gap-4 p-4">
			{/* Sidebar Navigation */}
			<Sidebar />

			{/* Page Content */}
			<div className="flex-1 bg-white rounded-[24px] p-6 overflow-auto">
				{/* Quick Add Expense Button */}
				<QuickAddExpenseButton accounts={accounts} />

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
			</div>
		</main>
	);
}
