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
}
