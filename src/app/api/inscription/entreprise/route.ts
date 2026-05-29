import { auth, clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

const schema = z.object({
  raisonSociale: z.string().min(1),
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres').regex(/^\d{14}$/, 'Le SIRET ne doit contenir que des chiffres'),
  adresseSiege: z.string().min(1),
  codeApe: z.string().optional(),
  representantLegal: z.string().min(1),
  telephone: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { raisonSociale, siret, adresseSiege, codeApe, representantLegal, telephone } = parsed.data;

    let utilisateur = await prisma.utilisateur.findUnique({ where: { clerkId: userId } });

    if (!utilisateur) {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) return Response.json({ error: 'Email introuvable sur le compte Clerk.' }, { status: 400 });

      utilisateur = await prisma.utilisateur.create({
        data: { clerkId: userId, email },
      });
    }

    const existant = await prisma.entreprise.findUnique({ where: { utilisateurId: utilisateur.id } });
    if (existant) return Response.json({ error: 'Entreprise déjà créée' }, { status: 409 });

    const entreprise = await prisma.entreprise.create({
      data: {
        utilisateurId: utilisateur.id,
        raisonSociale,
        siret,
        adresseSiege,
        codeApe,
        representantLegal,
        telephone,
      },
    });

    try {
      const client = await clerkClient();
      const org = await client.organizations.createOrganization({
        name: raisonSociale,
        createdBy: userId,
      });
      await prisma.entreprise.update({
        where: { id: entreprise.id },
        data: { clerkOrgId: org.id },
      });
    } catch {
      // La création d'org Clerk est optionnelle — on continue sans bloquer
    }

    return Response.json({ entrepriseId: entreprise.id }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return Response.json({ error: 'Ce SIRET est déjà enregistré. Utilisez un autre SIRET pour les tests.' }, { status: 409 });
    }
    console.error('[POST /api/inscription/entreprise]', err);
    return Response.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
