import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

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

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch {
    return Response.json({ error: 'Signature invalide' }, { status: 400 });
  }

  if (event.type === 'user.created') {
    const { id: clerkId, email_addresses } = event.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return Response.json({ error: 'Email manquant' }, { status: 400 });
    }

    await prisma.utilisateur.create({
      data: { clerkId, email },
    });
  }

  if (event.type === 'user.deleted') {
    const { id: clerkId } = event.data;
    if (clerkId) {
      await prisma.utilisateur.deleteMany({ where: { clerkId } });
    }
  }

  return Response.json({ received: true });
}
