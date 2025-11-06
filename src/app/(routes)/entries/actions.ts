'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const entrySchema = z.object({
  kind: z.enum(['journal', 'belief', 'note']),
  text: z.string().min(1, 'Text is required'),
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

export async function createEntry(formData: FormData) {
  const user = await getDemoUser()

  const result = entrySchema.safeParse({
    kind: formData.get('kind'),
    text: formData.get('text'),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  await prisma.entry.create({
    data: {
      userId: user.id,
      kind: result.data.kind,
      text: result.data.text,
    },
  })

  revalidatePath('/entries')
  return { success: true }
}

export async function updateEntry(id: string, formData: FormData) {
  const user = await getDemoUser()

  const result = entrySchema.safeParse({
    kind: formData.get('kind'),
    text: formData.get('text'),
  })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // Verify ownership
  const entry = await prisma.entry.findFirst({
    where: { id, userId: user.id },
  })

  if (!entry) {
    return { error: { _form: ['Entry not found'] } }
  }

  await prisma.entry.update({
    where: { id },
    data: {
      kind: result.data.kind,
      text: result.data.text,
    },
  })

  revalidatePath('/entries')
  return { success: true }
}

export async function deleteEntry(id: string) {
  const user = await getDemoUser()

  // Verify ownership
  const entry = await prisma.entry.findFirst({
    where: { id, userId: user.id },
  })

  if (!entry) {
    return { error: 'Entry not found' }
  }

  await prisma.entry.delete({
    where: { id },
  })

  revalidatePath('/entries')
  return { success: true }
}


