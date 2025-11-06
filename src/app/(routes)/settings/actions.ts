'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateUserSettings(data: {
  userId: string
  name: string | null
  polymarketWallet: string | null
}) {
  await prisma.user.update({
    where: { id: data.userId },
    data: {
      name: data.name,
      polymarketWallet: data.polymarketWallet,
    },
  })

  revalidatePath('/settings')
  return { success: true }
}

