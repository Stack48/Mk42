'use server'

import { prisma } from '@/lib/prisma'

export type EntrepriseResult = {
  id: string
  raisonSociale: string
  siret: string
}

export async function searchEntreprises(query: string): Promise<EntrepriseResult[]> {
  if (query.length < 2) return []
  return prisma.entreprise.findMany({
    where: {
      OR: [
        { raisonSociale: { contains: query, mode: 'insensitive' } },
        { siret: { contains: query } },
      ],
    },
    select: { id: true, raisonSociale: true, siret: true },
    take: 10,
  })
}
