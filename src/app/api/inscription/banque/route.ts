import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  iban: z.string().min(14, 'IBAN invalide').max(34),
  bic: z.string().min(8, 'BIC invalide').max(11),
  nomTitulaireIban: z.string().min(1, 'Nom du titulaire requis'),
  tauxCommissionDefaut: z.coerce.number().min(0).max(100).optional(),
  montantFixeDefaut: z.coerce.number().min(0).optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const utilisateur = await prisma.utilisateur.findUnique({ where: { clerkId: userId } });
    if (!utilisateur) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    const entreprise = await prisma.entreprise.findUnique({ where: { utilisateurId: utilisateur.id } });
    if (!entreprise) return Response.json({ error: 'Entreprise introuvable' }, { status: 404 });

    await prisma.entreprise.update({
      where: { id: entreprise.id },
      data: parsed.data,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/inscription/banque]', err);
    return Response.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
