<<<<<<< HEAD
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';
import { RoleOrganisation } from '@/generated/prisma/client/client';

function clerkRoleToDb(role: string): RoleOrganisation {
  if (role === 'org:admin') return RoleOrganisation.ADMIN;
  if (role === 'org:referrer') return RoleOrganisation.REFERRER_INTERNE;
  return RoleOrganisation.MEMBRE;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return Response.json({ error: 'CLERK_WEBHOOK_SECRET manquant' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: 'Headers Svix manquants' }, { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.log('Signature invalide:', String(err));
    return Response.json({ error: 'Signature invalide' }, { status: 400 });
  }

  // ─── Utilisateur créé ─────────────────────────────────────────────────────
  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses } = event.data;
    const email = email_addresses[0]?.email_address;
    if (!email) return Response.json({ received: true, skipped: 'no email' });

    await prisma.utilisateur.create({ data: { clerkId, email } });
  }

  // ─── Utilisateur supprimé ─────────────────────────────────────────────────
  if (event.type === 'user.deleted') {
    const { id: clerkId } = event.data;
    if (clerkId) {
      await prisma.utilisateur.deleteMany({ where: { clerkId } });
    }
  }

  // ─── Organisation créée → lier clerkOrgId à l'Entreprise de l'admin ──────
  if (event.type === 'organization.created') {
    const { id: clerkOrgId, created_by } = event.data;
    if (created_by) {
      await prisma.entreprise.updateMany({
        where: { utilisateur: { clerkId: created_by } },
        data: { clerkOrgId },
      });
    }
  }

  // ─── Membre ajouté à l'organisation ──────────────────────────────────────
  if (event.type === 'organizationMembership.created') {
    const { organization, public_user_data, role } = event.data;
    const clerkOrgId = organization.id;
    const clerkUserId = public_user_data.user_id;

    const [utilisateur, entreprise] = await Promise.all([
      prisma.utilisateur.findUnique({ where: { clerkId: clerkUserId } }),
      prisma.entreprise.findUnique({ where: { clerkOrgId } }),
    ]);

    if (utilisateur && entreprise) {
      await prisma.membreEntreprise.upsert({
        where: { utilisateurId_entrepriseId: { utilisateurId: utilisateur.id, entrepriseId: entreprise.id } },
        create: {
          utilisateurId: utilisateur.id,
          entrepriseId: entreprise.id,
          role: clerkRoleToDb(role),
          clerkMembershipId: `${clerkOrgId}_${clerkUserId}`,
        },
        update: { role: clerkRoleToDb(role) },
      });
    }
  }

  // ─── Membre retiré de l'organisation ─────────────────────────────────────
  if (event.type === 'organizationMembership.deleted') {
    const { organization, public_user_data } = event.data;
    const clerkOrgId = organization.id;
    const clerkUserId = public_user_data.user_id;

    const [utilisateur, entreprise] = await Promise.all([
      prisma.utilisateur.findUnique({ where: { clerkId: clerkUserId } }),
      prisma.entreprise.findUnique({ where: { clerkOrgId } }),
    ]);

    if (utilisateur && entreprise) {
      await prisma.membreEntreprise.deleteMany({
        where: { utilisateurId: utilisateur.id, entrepriseId: entreprise.id },
      });
    }
  }

  return Response.json({ received: true });
=======
// @ts-nocheck - incompatible avec le schema doc-fiscaux (refs prisma.utilisateur)
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
            telephone: data.unsafe_metadata?.telephone ?? '',
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
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
}
