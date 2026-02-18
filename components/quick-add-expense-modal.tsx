'use client';

/**
 * QuickAddExpenseModal - Modal for quickly adding an expense
 * Client component for interactive modal
 */

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuickAddExpenseModalProps {
	accounts: Array<{ id: number; name: string; currency: string }>;
	isOpen: boolean;
	onClose: () => void;
}

export function QuickAddExpenseModal({
	accounts,
	isOpen,
	onClose,
}: QuickAddExpenseModalProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [accountId, setAccountId] = useState<string>('');
	const [amount, setAmount] = useState<string>('');
	const [category, setCategory] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

	/**
	 * Handle form submission
	 */
	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		// Validate inputs
		if (!accountId || !amount || !category || !date) {
			alert('Please fill in all required fields');
			return;
		}

		startTransition(async () => {
			try {
				const response = await fetch('/api/expenses', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						accountId: parseInt(accountId, 10),
						amount: parseFloat(amount),
						category,
						description: description || null,
						date: new Date(date),
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to create expense');
				}

				// Reset form
				setAccountId('');
				setAmount('');
				setCategory('');
				setDescription('');
				setDate(new Date().toISOString().split('T')[0]);

				// Close modal and refresh
				onClose();
				router.refresh();
			} catch (error) {
				alert(error instanceof Error ? error.message : 'Failed to create expense');
			}
		});
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Quick Add Expense</DialogTitle>
					<DialogDescription>
						Quickly add an expense to track your spending
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Account */}
					<div className="space-y-2">
						<Label htmlFor="account">Account</Label>
						<Select
							value={accountId}
							onValueChange={setAccountId}
							required
						>
							<SelectTrigger id="account">
								<SelectValue placeholder="Select account" />
							</SelectTrigger>
							<SelectContent>
								{accounts.length === 0 ? (
									<SelectItem value="none" disabled>
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
								<Link
									href="/accounts/new"
									className="text-primary hover:underline"
									onClick={onClose}
								>
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
							type="number"
							step="0.01"
							placeholder="0.00"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							required
						/>
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select
							value={category}
							onValueChange={setCategory}
							required
						>
							<SelectTrigger id="category">
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
							placeholder="Optional description..."
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					{/* Date */}
					<div className="space-y-2">
						<Label htmlFor="date">Date</Label>
						<Input
							id="date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							required
						/>
					</div>

					{/* Submit Button */}
					<div className="flex gap-3 pt-2">
						<Button
							type="submit"
							className="flex-1"
							disabled={isPending}
						>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<Plus className="mr-2 h-4 w-4" />
									Add Expense
								</>
							)}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Cancel
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

/**
 * QuickAddExpenseButton - Floating button to open the quick add modal
 */
export function QuickAddExpenseButton({
	accounts,
}: {
	accounts: Array<{ id: number; name: string; currency: string }>;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Floating Button */}
			<button
				onClick={() => setIsOpen(true)}
				className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				aria-label="Add expense"
			>
				<Plus className="h-6 w-6" />
			</button>

			{/* Modal */}
			<QuickAddExpenseModal
				accounts={accounts}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}
