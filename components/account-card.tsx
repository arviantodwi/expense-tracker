/**
 * AccountCard - Display account information
 * Pure presentational component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Account } from '@/db/schema';

interface AccountCardProps {
	account: Account;
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount);
}

/**
 * Get account type display text and color
 */
function getAccountTypeInfo(type: string): { label: string; colorClass: string } {
	const typeMap: Record<
		string,
		{ label: string; colorClass: string }
	> = {
		checking: { label: 'Checking', colorClass: 'bg-blue-100 text-blue-800' },
		savings: { label: 'Savings', colorClass: 'bg-green-100 text-green-800' },
		credit: { label: 'Credit Card', colorClass: 'bg-purple-100 text-purple-800' },
		cash: { label: 'Cash', colorClass: 'bg-yellow-100 text-yellow-800' },
		other: { label: 'Other', colorClass: 'bg-gray-100 text-gray-800' },
	};
	return typeMap[type.toLowerCase()] || typeMap.other;
}

/**
 * Format account type for display
 */
function formatAccountType(type: string): string {
	const typeInfo = getAccountTypeInfo(type);
	return typeInfo.label;
}

/**
 * Get account type badge color class
 */
function getAccountTypeColor(type: string): string {
	const typeInfo = getAccountTypeInfo(type);
	return typeInfo.colorClass;
}

export function AccountCard({ account }: AccountCardProps) {
	const { name, type, balance, currency } = account;

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<CardTitle className="text-lg font-semibold">{name}</CardTitle>
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(type)}`}
					>
						{formatAccountType(type)}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-bold mb-2">
					{formatCurrency(balance, currency)}
				</p>
				<p className="text-xs text-muted-foreground">{currency}</p>
			</CardContent>
		</Card>
	);
}
