import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WM Dashboard',
  description: 'Personal wisdom management dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center gap-6">
                <Link href="/dashboard" className="font-semibold text-lg">
                  WM
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href="/entries"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Entries
                </Link>
                <Link
                  href="/bets"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Bets
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}


