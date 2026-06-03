import { clerkClient } from '@clerk/nextjs/server';
import { getInscriptionUserId } from '@/lib/auth-inscription';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TypeApporteur } from '@/generated/prisma/client';

const schema = z.object({
  iban: z.string().min(14, 'IBAN invalide').max(34),
  bic: z.string().min(8, 'BIC invalide').max(11),
  nomTitulaireIban: z.string().min(1, 'Nom du titulaire requis'),
  tauxCommissionDefaut: z.coerce.number().min(0).max(100).optional(),
  montantFixeDefaut: z.coerce.number().min(0).optional(),
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
    const profil = (clerkUser.unsafeMetadata?.profil as string) ?? 'entreprise';

    const utilisateur = await prisma.utilisateur.findUnique({ where: { clerkId: userId } });
    if (!utilisateur) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    if (profil === 'entreprise') {
      const entreprise = await prisma.entreprise.findUnique({ where: { utilisateurId: utilisateur.id } });
      if (!entreprise) return Response.json({ error: 'Entreprise introuvable' }, { status: 404 });

      await prisma.entreprise.update({
        where: { id: entreprise.id },
        data: {
          iban: parsed.data.iban,
          bic: parsed.data.bic,
          nomTitulaireIban: parsed.data.nomTitulaireIban,
          tauxCommissionDefaut: parsed.data.tauxCommissionDefaut,
          montantFixeDefaut: parsed.data.montantFixeDefaut,
        },
      });

      return Response.json({ success: true }, { status: 200 });
    }

    // professionnel : l'Apporteur a été créé à l'étape 3
    // particulier : l'Apporteur n'existe pas encore, on le crée ici depuis les données Clerk
    let apporteur = await prisma.apporteur.findUnique({ where: { utilisateurId: utilisateur.id } });

    if (!apporteur) {
      if (profil !== 'particulier') {
        return Response.json({ error: 'Apporteur introuvable. Veuillez compléter l\'étape précédente.' }, { status: 404 });
      }

      apporteur = await prisma.apporteur.create({
        data: {
          utilisateurId: utilisateur.id,
          type: TypeApporteur.PARTICULIER,
          nom: clerkUser.lastName ?? '',
          prenom: clerkUser.firstName ?? '',
          telephone: (clerkUser.unsafeMetadata?.telephone as string) ?? '',
        },
      });
    }

    await prisma.apporteur.update({
      where: { id: apporteur.id },
      data: {
        iban: parsed.data.iban,
        bic: parsed.data.bic,
      },
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/inscription/banque]', err);
    return Response.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
