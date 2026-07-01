'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE = 9

export type EntrepriseDiscoveryCard = {
  id: string
  raisonSociale: string
  siret: string
  adresseSiege: string
  codeApe: string | null
  tauxCommissionDefaut: number | null
  montantFixeDefaut: number | null
  logoUrl: string | null
  bannerUrl: string | null
}

export type EntrepriseDiscoveryDetail = EntrepriseDiscoveryCard & {
  email: string
  telephone: string
  representantLegal: string | null
  numeroTVA: string | null
  createdAt: Date
}

export type DiscoveryParams = {
  search?: string
  secteur?: string
  localisation?: string
  page?: number
}

async function getApporteurId(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { apporteur: { select: { id: true } } },
  })

  return utilisateur?.apporteur?.id ?? null
}

export async function getEntreprisesForDiscovery(params: DiscoveryParams = {}): Promise<{
  entreprises: EntrepriseDiscoveryCard[]
  total: number
  page: number
  totalPages: number
}> {
  const page = Math.max(1, params.page ?? 1)
  const skip = (page - 1) * PAGE_SIZE

  const where = {
    ...(params.search
      ? {
          OR: [
            { raisonSociale: { contains: params.search, mode: 'insensitive' as const } },
            { siret: { contains: params.search } },
          ],
        }
      : {}),
    ...(params.secteur ? { codeApe: { startsWith: params.secteur } } : {}),
    ...(params.localisation
      ? { adresseSiege: { contains: params.localisation, mode: 'insensitive' as const } }
      : {}),
  }

  const [entreprises, total] = await Promise.all([
    prisma.entreprise.findMany({
      where,
      select: {
        id: true,
        raisonSociale: true,
        siret: true,
        adresseSiege: true,
        codeApe: true,
        tauxCommissionDefaut: true,
        montantFixeDefaut: true,
        logoUrl: true,
        bannerUrl: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.entreprise.count({ where }),
  ])

  return {
    entreprises,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
}

export async function getEntreprisesRecentlyViewed(): Promise<EntrepriseDiscoveryCard[]> {
  const apporteurId = await getApporteurId()
  if (!apporteurId) return []

  const views = await prisma.entrepriseView.findMany({
    where: { apporteurId },
    orderBy: { viewedAt: 'desc' },
    take: 3,
    select: {
      entreprise: {
        select: {
          id: true,
          raisonSociale: true,
          siret: true,
          adresseSiege: true,
          codeApe: true,
          tauxCommissionDefaut: true,
          montantFixeDefaut: true,
          logoUrl: true,
          bannerUrl: true,
        },
      },
    },
  })

  return views.map((v) => v.entreprise)
}

export async function recordEntrepriseView(entrepriseId: string): Promise<void> {
  const apporteurId = await getApporteurId()
  if (!apporteurId) return

  await prisma.entrepriseView.upsert({
    where: { apporteurId_entrepriseId: { apporteurId, entrepriseId } },
    create: { apporteurId, entrepriseId },
    update: { viewedAt: new Date() },
  })
}

export async function getEntrepriseDiscoveryDetail(
  id: string
): Promise<EntrepriseDiscoveryDetail | null> {
  const apporteurId = await getApporteurId()
  if (!apporteurId) return null

  return prisma.entreprise.findUnique({
    where: { id },
    select: {
      id: true,
      raisonSociale: true,
      siret: true,
      adresseSiege: true,
      codeApe: true,
      tauxCommissionDefaut: true,
      montantFixeDefaut: true,
      logoUrl: true,
      bannerUrl: true,
      email: true,
      telephone: true,
      representantLegal: true,
      numeroTVA: true,
      createdAt: true,
    },
  })
}

export async function getSecteursList(): Promise<string[]> {
  const results = await prisma.entreprise.findMany({
    where: { codeApe: { not: null } },
    select: { codeApe: true },
    distinct: ['codeApe'],
    orderBy: { codeApe: 'asc' },
  })
  return results.map((r) => r.codeApe as string)
}
