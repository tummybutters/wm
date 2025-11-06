'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateUserSettings } from './actions'

type SettingsFormProps = {
  user: {
    name: string | null
    email: string
    polymarketWallet: string | null
  }
  userId: string
}

export function SettingsForm({ user, userId }: SettingsFormProps) {
  const [name, setName] = useState(user.name || '')
  const [polymarketWallet, setPolymarketWallet] = useState(user.polymarketWallet || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await updateUserSettings({
        userId,
        name: name || null,
        polymarketWallet: polymarketWallet || null,
      })
      setMessage('Settings updated successfully!')
    } catch (error) {
      setMessage('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your profile information and connected wallets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="polymarketWallet">Polymarket Wallet (Optional)</Label>
            <Input
              id="polymarketWallet"
              type="text"
              placeholder="0x..."
              value={polymarketWallet}
              onChange={(e) => setPolymarketWallet(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Connect your Polymarket wallet to sync your prediction market positions
            </p>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.includes('success')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

