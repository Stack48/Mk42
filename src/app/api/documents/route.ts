import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { TypeDocument } from '@/generated/prisma/client/client';

const schema = z.object({
  type: z.nativeEnum(TypeDocument),
  urlS3: z.string().min(1),
  nomFichier: z.string().min(1),
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

    const document = await prisma.document.create({
      data: {
        type: parsed.data.type,
        urlS3: parsed.data.urlS3,
        nomFichier: parsed.data.nomFichier,
        entrepriseId: entreprise?.id ?? null,
      },
    });

    return Response.json({ documentId: document.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/documents]', err);
    return Response.json({ error: 'Erreur serveur interne' }, { status: 500 });
  }
}
