import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from './sign-out-button'

export async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              WM
            </Link>
            {user && (
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/entries"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Entries
                </Link>
                <Link
                  href="/bets"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Bets
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/settings"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Settings
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

