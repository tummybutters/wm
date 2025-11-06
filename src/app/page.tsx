import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold mb-6">WM - Worldview Monitor</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Track your worldview through journal entries, beliefs, and notes.
        <br />
        Make predictions, track your calibration, and analyze patterns over time.
      </p>
      <div className="flex gap-4">
        <Link href="/auth/signup">
          <Button size="lg">Get Started</Button>
        </Link>
        <Link href="/auth/signin">
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  )
}


