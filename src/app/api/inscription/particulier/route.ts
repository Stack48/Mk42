import { clerkClient } from '@clerk/nextjs/server';
import { getInscriptionUserId } from '@/lib/auth-inscription';
import { prisma } from '@/lib/prisma';
import { TypeApporteur } from '@/generated/prisma/client/client';

export async function POST(req: Request) {
  try {
    const userId = await getInscriptionUserId(req);
    if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    const utilisateur = await prisma.utilisateur.findUnique({ where: { clerkId: userId } });
    if (!utilisateur) return Response.json({ error: 'Utilisateur introuvable.' }, { status: 404 });

    const existant = await prisma.apporteur.findUnique({ where: { utilisateurId: utilisateur.id } });
    if (existant) return Response.json({ apporteurId: existant.id }, { status: 200 });

    const telephone = (clerkUser.unsafeMetadata?.telephone as string) ?? '';

    const apporteur = await prisma.apporteur.create({
      data: {
        utilisateurId: utilisateur.id,
        type:          TypeApporteur.PARTICULIER,
        nom:           clerkUser.lastName  ?? '',
        prenom:        clerkUser.firstName ?? '',
        telephone,
      },
    });

    return Response.json({ apporteurId: apporteur.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/inscription/particulier]', err);
    return Response.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
