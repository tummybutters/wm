import dynamic from 'next/dynamic'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { tokenize, getWordFrequencies } from '@/lib/text'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const WordFrequencyChart = dynamic(
  () => import('@/components/dashboard/word-frequency-chart'),
  { ssr: false }
)

async function getDashboardData(userId: string) {
  // Get the authenticated user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get all resolved bets for Brier score calculation
  const resolvedBets = await prisma.bet.findMany({
    where: {
      userId: user.id,
      status: 'resolved',
      outcome: { not: null },
    },
  })

  // Calculate Brier score: mean((p - y)^2)
  let brierScore = 0
  if (resolvedBets.length > 0) {
    const sum = resolvedBets.reduce((acc, bet) => {
      const y = bet.outcome ? 1 : 0
      return acc + Math.pow(bet.probability - y, 2)
    }, 0)
    brierScore = sum / resolvedBets.length
  }

  // Get open vs resolved counts
  const openCount = await prisma.bet.count({
    where: { userId: user.id, status: 'open' },
  })
  const resolvedCount = await prisma.bet.count({
    where: { userId: user.id, status: 'resolved' },
  })

  // Get entries from last 7 days for word frequency
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentEntries = await prisma.entry.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: sevenDaysAgo },
    },
    select: { text: true },
  })

  // Tokenize and calculate word frequencies
  const allTokens = recentEntries.flatMap((entry) => tokenize(entry.text))
  const wordFrequencies = getWordFrequencies(allTokens, 15)

  // Get recent bets for table
  const recentBets = await prisma.bet.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return {
    brierScore,
    openCount,
    resolvedCount,
    resolvedBetsCount: resolvedBets.length,
    wordFrequencies,
    recentBets,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const data = await getDashboardData(user.id)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Brier Score</CardTitle>
            <CardDescription>Resolved bets calibration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.resolvedBetsCount > 0
                ? data.brierScore.toFixed(3)
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {data.resolvedBetsCount} resolved bet
              {data.resolvedBetsCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Bets</CardTitle>
            <CardDescription>Awaiting resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.openCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolved Bets</CardTitle>
            <CardDescription>Outcomes determined</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Words (Last 7 Days)</CardTitle>
          <CardDescription>
            Most frequent words in your entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.wordFrequencies.length > 0 ? (
            <WordFrequencyChart data={data.wordFrequencies} />
          ) : (
            <p className="text-muted-foreground">
              No entries from the last 7 days
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
          <CardDescription>Your latest predictions</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentBets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statement</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentBets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell className="max-w-md">
                      {bet.statement}
                    </TableCell>
                    <TableCell>
                      {(bet.probability * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          bet.status === 'open'
                            ? 'text-blue-600'
                            : 'text-green-600'
                        }
                      >
                        {bet.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {bet.outcome === null
                        ? '-'
                        : bet.outcome
                        ? '✓ True'
                        : '✗ False'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No bets yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


