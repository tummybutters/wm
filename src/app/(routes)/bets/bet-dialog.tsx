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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createBet, updateBet } from './actions'

type Bet = {
  id: string
  statement: string
  probability: number
}

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; bet: Bet }

export function BetDialog(props: Props) {
  const [open, setOpen] = useState(false)
  const [statement, setStatement] = useState(
    props.mode === 'edit' ? props.bet.statement : ''
  )
  const [probability, setProbability] = useState(
    props.mode === 'edit' ? props.bet.probability : 0.5
  )
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('statement', statement)
    formData.append('probability', probability.toString())

    try {
      const result =
        props.mode === 'create'
          ? await createBet(formData)
          : await updateBet(props.bet.id, formData)

      if ('error' in result) {
        setError(
          typeof result.error === 'string'
            ? result.error
            : JSON.stringify(result.error)
        )
      } else {
        setOpen(false)
        if (props.mode === 'create') {
          setStatement('')
          setProbability(0.5)
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
          {props.mode === 'create' ? 'New Bet' : 'Edit'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {props.mode === 'create' ? 'Create Bet' : 'Edit Bet'}
            </DialogTitle>
            <DialogDescription>
              {props.mode === 'create'
                ? 'Make a new prediction with your estimated probability.'
                : 'Update your bet details.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="statement">Statement</Label>
              <Textarea
                id="statement"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">
                Probability: {(probability * 100).toFixed(0)}%
              </Label>
              <Input
                id="probability"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={probability}
                onChange={(e) => setProbability(parseFloat(e.target.value))}
              />
              <Input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={probability}
                onChange={(e) => setProbability(parseFloat(e.target.value))}
                className="mt-2"
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


