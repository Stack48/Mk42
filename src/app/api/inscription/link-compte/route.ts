import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 })

  const { profil } = await req.json()
  if (!profil) return Response.json({ error: 'Profil manquant' }, { status: 400 })

  const existing = await prisma.utilisateur.findUnique({ where: { clerkId: userId } })
  if (existing) return Response.json({ success: true }, { status: 200 })

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const email =
    clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? ''

  await prisma.utilisateur.create({ data: { clerkId: userId, email, profil } })

  return Response.json({ success: true }, { status: 201 })
}
