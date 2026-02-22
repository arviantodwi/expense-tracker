import type { Metadata } from "next"

import './globals.css'
import { Rubik } from "next/font/google";

const rubik = Rubik({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={rubik.variable}>
      <body>{children}</body>
    </html>
  )
}
