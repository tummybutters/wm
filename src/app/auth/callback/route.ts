import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Create or update user in Prisma database
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
        },
        create: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
        },
      })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
