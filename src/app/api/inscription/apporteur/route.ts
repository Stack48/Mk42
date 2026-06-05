import { clerkClient } from '@clerk/nextjs/server';
import { getInscriptionUserId } from '@/lib/auth-inscription';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TypeApporteur, Prisma } from '@/generated/prisma/client/client';

const schema = z.object({
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres').regex(/^\d{14}$/, 'SIRET invalide'),
  raisonSociale: z.string().min(1),
  adresseSiege: z.string().min(1),
  representantLegal: z.string().min(1),
  telephone: z.string().min(1),
  codeApe: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getInscriptionUserId(req);
    if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    let utilisateur = await prisma.utilisateur.findUnique({ where: { clerkId: userId } });
    if (!utilisateur) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) return Response.json({ error: 'Email introuvable.' }, { status: 400 });
      utilisateur = await prisma.utilisateur.create({ data: { clerkId: userId, email } });
    }

    const existant = await prisma.apporteur.findUnique({ where: { utilisateurId: utilisateur.id } });
    if (existant) return Response.json({ apporteurId: existant.id }, { status: 200 });

    const apporteur = await prisma.apporteur.create({
      data: {
        utilisateurId: utilisateur.id,
        type: TypeApporteur.PROFESSIONNEL,
        nom: clerkUser.lastName ?? '',
        prenom: clerkUser.firstName ?? '',
        telephone: (clerkUser.unsafeMetadata?.telephone as string) ?? parsed.data.telephone,
        raisonSociale: parsed.data.raisonSociale,
        siret: parsed.data.siret,
        adresse: parsed.data.adresseSiege,
      },
    });

    return Response.json({ apporteurId: apporteur.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return Response.json({ error: 'Ce SIRET est déjà enregistré.' }, { status: 409 });
    }
    console.error('[POST /api/inscription/apporteur]', err);
    return Response.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
