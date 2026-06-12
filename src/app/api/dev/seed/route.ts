// @ts-nocheck - incompatible avec le schema doc-fiscaux (refs prisma.user)
/**
 * Dev only — crée Utilisateur + Apporteur pour l'utilisateur Clerk connecté.
 * À supprimer avant la mise en production.
 */
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Interdit en production' }, { status: 403 })
  }

  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    return Response.json({ error: 'Utilisateur Clerk introuvable' }, { status: 404 })
  }

  const email = clerkUser.emailAddresses.find(
    e => e.id === clerkUser.primaryEmailAddressId
  )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    return Response.json({ error: 'Aucun email sur ce compte Clerk' }, { status: 400 })
  }

<<<<<<< HEAD
  const user = await prisma.utilisateur.upsert({
=======
  const user = await prisma.user.upsert({
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
    where: { clerkId: userId },
    update: { email },
    create: {
      clerkId: userId,
      email,
      apporteur: {
        create: {
<<<<<<< HEAD
          nom:       clerkUser.lastName  ?? 'Test',
          prenom:    clerkUser.firstName ?? 'Dev',
          type:      'PARTICULIER',
          telephone: '',
=======
          nom:    clerkUser.lastName  ?? 'Test',
          prenom: clerkUser.firstName ?? 'Dev',
          type:   'PARTICULIER',
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
        },
      },
    },
    include: { apporteur: true },
  })

  return Response.json({
    ok: true,
    userId:      user.id,
    apporteurId: user.apporteur?.id ?? null,
    email,
  })
}
