import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getCurrentEntrepriseId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('Non authentifié');

  const entreprise = await prisma.entreprise.findUnique({
    where: { utilisateur: { clerkId: userId } },
    select: { id: true },
  });

  if (!entreprise) throw new Error('Aucune entreprise associée à ce compte');
  return entreprise.id;
}
