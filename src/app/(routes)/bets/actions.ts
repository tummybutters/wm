'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const betCreateSchema = z.object({
  statement: z.string().min(1, 'Statement is required'),
  probability: z.coerce
    .number()
    .min(0, 'Probability must be at least 0')
    .max(1, 'Probability must be at most 1'),
})

const betUpdateSchema = z.object({
  statement: z.string().min(1, 'Statement is required'),
  probability: z.coerce
    .number()
    .min(0, 'Probability must be at least 0')
    .max(1, 'Probability must be at most 1'),
})

const betResolveSchema = z.object({
  outcome: z.enum(['true', 'false']),
})

async function getDemoUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  })
  if (!user) {
    throw new Error('Demo user not found')
  }
  return user
}

export async function createBet(formData: FormData) {
  const user = await getDemoUser()

  const result = betCreateSchema.safeParse({
    statement: formData.get('statement'),
    probability: formData.get('probability'),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  await prisma.bet.create({
    data: {
      userId: user.id,
      source: 'personal',
      statement: result.data.statement,
      probability: result.data.probability,
      status: 'open',
      outcome: null,
    },
  })

  revalidatePath('/bets')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateBet(id: string, formData: FormData) {
  const user = await getDemoUser()

  const result = betUpdateSchema.safeParse({
    statement: formData.get('statement'),
    probability: formData.get('probability'),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // Verify ownership
  const bet = await prisma.bet.findFirst({
    where: { id, userId: user.id },
  })

  if (!bet) {
    return { error: { _form: ['Bet not found'] } }
  }

  await prisma.bet.update({
    where: { id },
    data: {
      statement: result.data.statement,
      probability: result.data.probability,
    },
  })

  revalidatePath('/bets')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function resolveBet(id: string, formData: FormData) {
  const user = await getDemoUser()

  const result = betResolveSchema.safeParse({
    outcome: formData.get('outcome'),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // Verify ownership
  const bet = await prisma.bet.findFirst({
    where: { id, userId: user.id },
  })

  if (!bet) {
    return { error: { _form: ['Bet not found'] } }
  }

  await prisma.bet.update({
    where: { id },
    data: {
      status: 'resolved',
      outcome: result.data.outcome === 'true',
      resolvedAt: new Date(),
    },
  })

  revalidatePath('/bets')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteBet(id: string) {
  const user = await getDemoUser()

  // Verify ownership
  const bet = await prisma.bet.findFirst({
    where: { id, userId: user.id },
  })

  if (!bet) {
    return { error: 'Bet not found' }
  }

  await prisma.bet.delete({
    where: { id },
  })

  revalidatePath('/bets')
  revalidatePath('/dashboard')
  return { success: true }
}


