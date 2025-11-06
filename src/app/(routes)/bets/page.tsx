import { prisma } from '@/lib/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BetDialog } from './bet-dialog'
import { ResolveBetDialog } from './resolve-bet-dialog'
import { DeleteBetButton } from './delete-bet-button'

async function getBets() {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  })

  if (!user) {
    throw new Error('Demo user not found')
  }

  const bets = await prisma.bet.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return bets
}

export default async function BetsPage() {
  const bets = await getBets()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bets</h1>
        <BetDialog mode="create" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Statement</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No bets yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              bets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(bet.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-md">{bet.statement}</TableCell>
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
                  <TableCell className="text-right space-x-2">
                    <BetDialog mode="edit" bet={bet} />
                    {bet.status === 'open' && (
                      <ResolveBetDialog id={bet.id} />
                    )}
                    <DeleteBetButton id={bet.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


