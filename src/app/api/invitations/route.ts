import { auth, clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['org:admin', 'org:member', 'org:referrer']).default('org:member'),
});

export async function POST(req: Request) {
  const { orgId, orgRole } = await auth();

  if (!orgId) {
    return Response.json({ error: 'Aucune organisation active' }, { status: 403 });
  }

  if (orgRole !== 'org:admin') {
    return Response.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { email, role } = parsed.data;
  const client = await clerkClient();

  const invitation = await client.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role,
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/inscription/rejoindre`,
  });

  return Response.json({ invitationId: invitation.id }, { status: 201 });
}
