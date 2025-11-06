import { prisma } from '@/lib/db'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { EntryDialog } from './entry-dialog'
import { DeleteEntryButton } from './delete-entry-button'

async function getEntries(page: number = 1, pageSize: number = 20) {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  })

  if (!user) {
    throw new Error('Demo user not found')
  }

  const skip = (page - 1) * pageSize

  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.entry.count({
      where: { userId: user.id },
    }),
  ])

  return { entries, total, page, pageSize }
}

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1', 10)
  const data = await getEntries(page)
  const totalPages = Math.ceil(data.total / data.pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Entries</h1>
        <EntryDialog mode="create" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Text</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No entries yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              data.entries.map((entry) => {
                const snippet =
                  entry.text.length > 80
                    ? entry.text.slice(0, 80) + '...'
                    : entry.text
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{entry.kind}</span>
                    </TableCell>
                    <TableCell className="max-w-lg">{snippet}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <EntryDialog mode="edit" entry={entry} />
                      <DeleteEntryButton id={entry.id} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <a href={`/entries?page=${page - 1}`}>Previous</a>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <a href={`/entries?page=${page + 1}`}>Next</a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}


