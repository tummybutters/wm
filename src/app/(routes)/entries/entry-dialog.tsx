'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createEntry, updateEntry } from './actions'

type Entry = {
  id: string
  kind: 'journal' | 'belief' | 'note'
  text: string
}

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; entry: Entry }

export function EntryDialog(props: Props) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<'journal' | 'belief' | 'note'>(
    props.mode === 'edit' ? props.entry.kind : 'journal'
  )
  const [text, setText] = useState(
    props.mode === 'edit' ? props.entry.text : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('kind', kind)
    formData.append('text', text)

    try {
      const result =
        props.mode === 'create'
          ? await createEntry(formData)
          : await updateEntry(props.entry.id, formData)

      if ('error' in result) {
        setError(
          typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error)
        )
      } else {
        setOpen(false)
        if (props.mode === 'create') {
          setKind('journal')
          setText('')
        }
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={props.mode === 'create' ? 'default' : 'outline'}>
          {props.mode === 'create' ? 'New Entry' : 'Edit'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {props.mode === 'create' ? 'Create Entry' : 'Edit Entry'}
            </DialogTitle>
            <DialogDescription>
              {props.mode === 'create'
                ? 'Add a new journal entry, belief, or note.'
                : 'Update your entry details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as any)}>
                <SelectTrigger id="kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal">Journal</SelectItem>
                  <SelectItem value="belief">Belief</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


