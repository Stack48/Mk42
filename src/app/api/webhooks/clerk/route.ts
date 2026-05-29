import { WebhookEvent } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'
import { RoleOrganisation } from '@/generated/prisma/client'

type UserUnsafeMetadata = {
  typeApporteur?: 'particulier' | 'professionnel' | 'entreprise'
  telephone?: string
}

function clerkRoleToDb(role: string): RoleOrganisation {
  if (role === 'org:admin') return RoleOrganisation.ADMIN
  if (role === 'org:referrer') return RoleOrganisation.REFERRER_INTERNE
  return RoleOrganisation.MEMBRE
}

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

  let event: WebhookEvent
  try {
    event = new Webhook(secret).verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Signature invalide', { status: 400 })
  }

  try {
    // ─── Utilisateur créé ─────────────────────────────────────────────────────
    if (event.type === 'user.created') {
      const { id: clerkId, email_addresses, primary_email_address_id, first_name, last_name, unsafe_metadata } = event.data
      const email = email_addresses.find(e => e.id === primary_email_address_id)?.email_address
      if (!email) {
        console.warn('[webhook/clerk] user.created sans email principal, clerkId:', clerkId)
        return new Response('OK', { status: 200 })
      }

      const meta        = unsafe_metadata as UserUnsafeMetadata
      const typeApporteur = meta?.typeApporteur
      const isEntreprise  = typeApporteur === 'entreprise'

      await prisma.utilisateur.upsert({
        where:  { clerkId },
        update: { email },
        create: {
          clerkId,
          email,
          ...(!isEntreprise && {
            apporteur: {
              create: {
                nom:       last_name  ?? '',
                prenom:    first_name ?? '',
                type:      typeApporteur === 'professionnel' ? 'PROFESSIONNEL' : 'PARTICULIER',
                telephone: meta?.telephone ?? '',
              },
            },
          }),
        },
      })

      console.log(`[webhook/clerk] Utilisateur créé — clerkId: ${clerkId}, type: ${typeApporteur ?? 'particulier (défaut)'}`)
    }

    // ─── Utilisateur mis à jour ───────────────────────────────────────────────
    if (event.type === 'user.updated') {
      const { id: clerkId, email_addresses, primary_email_address_id } = event.data
      const email = email_addresses.find(e => e.id === primary_email_address_id)?.email_address
      if (!email) return new Response('OK', { status: 200 })

      await prisma.utilisateur.update({
        where: { clerkId },
        data:  { email },
      }).catch(() => {
        console.warn('[webhook/clerk] user.updated — utilisateur introuvable, clerkId:', clerkId)
      })
    }

    // ─── Utilisateur supprimé ─────────────────────────────────────────────────
    if (event.type === 'user.deleted') {
      const { id: clerkId } = event.data
      if (clerkId) {
        await prisma.utilisateur.delete({
          where: { clerkId },
        }).catch(() => {
          console.warn('[webhook/clerk] user.deleted — utilisateur introuvable, clerkId:', clerkId)
        })
      }
    }

    // ─── Organisation créée → lier clerkOrgId à l'Entreprise de l'admin ──────
    if (event.type === 'organization.created') {
      const { id: clerkOrgId, created_by } = event.data
      if (created_by) {
        await prisma.entreprise.updateMany({
          where: { utilisateur: { clerkId: created_by } },
          data:  { clerkOrgId },
        })
      }
    }

    // ─── Membre ajouté à l'organisation ──────────────────────────────────────
    if (event.type === 'organizationMembership.created') {
      const { organization, public_user_data, role } = event.data
      const clerkOrgId  = organization.id
      const clerkUserId = public_user_data.user_id

      const [utilisateur, entreprise] = await Promise.all([
        prisma.utilisateur.findUnique({ where: { clerkId: clerkUserId } }),
        prisma.entreprise.findUnique({ where: { clerkOrgId } }),
      ])

      if (utilisateur && entreprise) {
        await prisma.membreEntreprise.upsert({
          where:  { utilisateurId_entrepriseId: { utilisateurId: utilisateur.id, entrepriseId: entreprise.id } },
          create: {
            utilisateurId:     utilisateur.id,
            entrepriseId:      entreprise.id,
            role:              clerkRoleToDb(role),
            clerkMembershipId: `${clerkOrgId}_${clerkUserId}`,
          },
          update: { role: clerkRoleToDb(role) },
        })
      }
    }

    // ─── Membre retiré de l'organisation ─────────────────────────────────────
    if (event.type === 'organizationMembership.deleted') {
      const { organization, public_user_data } = event.data
      const clerkOrgId  = organization.id
      const clerkUserId = public_user_data.user_id

      const [utilisateur, entreprise] = await Promise.all([
        prisma.utilisateur.findUnique({ where: { clerkId: clerkUserId } }),
        prisma.entreprise.findUnique({ where: { clerkOrgId } }),
      ])

      if (utilisateur && entreprise) {
        await prisma.membreEntreprise.deleteMany({
          where: { utilisateurId: utilisateur.id, entrepriseId: entreprise.id },
        })
      }
    }
  } catch (err) {
    console.error('[webhook/clerk] Erreur:', err)
    return new Response('Erreur interne', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
