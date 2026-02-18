/**
 * ExpenseCard - Display expense information
 * Pure presentational component
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Expense } from '@/db/schema';

interface ExpenseCardProps {
	expense: Expense & { accountName?: string };
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
 * Format date to readable string
 */
function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

/**
 * Get category color class
 */
function getCategoryColor(category: string): string {
	const colors: Record<string, string> = {
		food: 'bg-orange-100 text-orange-800',
		transport: 'bg-blue-100 text-blue-800',
		utilities: 'bg-purple-100 text-purple-800',
		entertainment: 'bg-pink-100 text-pink-800',
		health: 'bg-green-100 text-green-800',
		shopping: 'bg-yellow-100 text-yellow-800',
		other: 'bg-gray-100 text-gray-800',
	};
	return colors[category.toLowerCase()] || colors.other;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
	const { amount, category, description, date, accountName } = expense;

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<CardTitle className="text-lg font-semibold">
						{formatCurrency(amount)}
					</CardTitle>
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
					>
						{category}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				{description && (
					<p className="text-sm text-muted-foreground mb-2">{description}</p>
				)}
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<time dateTime={date.toISOString()}>{formatDate(date)}</time>
					{accountName && <span>{accountName}</span>}
				</div>
			</CardContent>
		</Card>
	);
}
