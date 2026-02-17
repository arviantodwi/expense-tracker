import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Personal expense tracker web application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
