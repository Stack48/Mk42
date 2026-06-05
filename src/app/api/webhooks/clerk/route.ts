import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

// ── Types Clerk webhook payload ────────────────────────────────────────────────

type ClerkEmailAddress = {
  id: string
  email_address: string
}

type ClerkUnsafeMetadata = {
  typeApporteur?: 'particulier' | 'professionnel' | 'entreprise'
  telephone?: string
}

type ClerkUserData = {
  id: string
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
  unsafe_metadata: ClerkUnsafeMetadata
}

type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserData }
  | { type: 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: { id?: string } }

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/clerk] CLERK_WEBHOOK_SECRET manquant')
    return new Response('Configuration manquante', { status: 500 })
  }

  const headerStore = await headers()
  const svixId        = headerStore.get('svix-id')
  const svixTimestamp = headerStore.get('svix-timestamp')
  const svixSignature = headerStore.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('En-têtes svix manquants', { status: 400 })
  }

  const body = await req.text()

  let event: ClerkWebhookEvent
  try {
    event = new Webhook(secret).verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return new Response('Signature invalide', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data)
        break
      case 'user.updated':
        await handleUserUpdated(event.data)
        break
      case 'user.deleted':
        await handleUserDeleted(event.data)
        break
    }
  } catch (err) {
    console.error(`[webhook/clerk] Erreur sur ${event.type}:`, err)
    return new Response('Erreur interne', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}

// ── Handlers ───────────────────────────────────────────────────────────────────

async function handleUserCreated(data: ClerkUserData) {
  const email = getPrimaryEmail(data)
  if (!email) {
    console.warn('[webhook/clerk] user.created sans email principal, clerkId:', data.id)
    return
  }

  const typeApporteur = data.unsafe_metadata?.typeApporteur
  const isEntreprise  = typeApporteur === 'entreprise'

  await prisma.utilisateur.upsert({
    where:  { clerkId: data.id },
    update: { email },
    create: {
      clerkId: data.id,
      email,
      ...(!isEntreprise && {
        apporteur: {
          create: {
            nom:       data.last_name  ?? '',
            prenom:    data.first_name ?? '',
            type:      typeApporteur === 'professionnel' ? 'PROFESSIONNEL' : 'PARTICULIER',
            telephone: data.unsafe_metadata?.telephone ?? null,
          },
        },
      }),
    },
  })

  console.log(`[webhook/clerk] Utilisateur créé — clerkId: ${data.id}, type: ${typeApporteur ?? 'particulier (défaut)'}`)
}

async function handleUserUpdated(data: ClerkUserData) {
  const email = getPrimaryEmail(data)
  if (!email) return

  await prisma.utilisateur.update({
    where: { clerkId: data.id },
    data:  { email },
  }).catch(() => {
    // L'utilisateur n'existe pas encore en DB (inscription antérieure au webhook)
    console.warn('[webhook/clerk] user.updated — utilisateur introuvable, clerkId:', data.id)
  })
}

async function handleUserDeleted(data: { id?: string }) {
  if (!data.id) return

  await prisma.utilisateur.delete({
    where: { clerkId: data.id },
  }).catch(() => {
    console.warn('[webhook/clerk] user.deleted — utilisateur introuvable, clerkId:', data.id)
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getPrimaryEmail(data: ClerkUserData): string | null {
  return (
    data.email_addresses.find(e => e.id === data.primary_email_address_id)
      ?.email_address ?? null
  )
}
