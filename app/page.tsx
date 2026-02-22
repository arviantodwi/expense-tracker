import Link from "next/link";
import { ComponentExample } from "@/components/component-example";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">Expense Tracker</h1>
            <p className="text-lg text-muted-foreground">
              Personal expense tracking application built with Next.js 16,
              TypeScript, and App Router.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
            <Link href="/accounts">
              <Button variant="outline" size="lg">
                Manage Accounts
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <br />
      <ComponentExample />
    </>
  );
}
