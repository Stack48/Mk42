import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  getEntreprisesForDiscovery,
  getEntreprisesRecentlyViewed,
  getSecteursList,
} from '@/lib/actions/discovery.actions'
import { EntrepriseCard } from './_components/EntrepriseCard'
import { DiscoveryFilters } from './_components/DiscoveryFilters'
import { DiscoveryPagination } from './_components/DiscoveryPagination'

export const metadata = { title: 'Discovery — Opus' }

type SearchParams = {
  search?: string
  secteur?: string
  localisation?: string
  page?: string
}

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/connexion')

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { profil: true },
  })

  if (utilisateur?.profil === 'entreprise') redirect('/dashboard')

  const params = await searchParams
  const search = params.search ?? ''
  const secteur = params.secteur ?? ''
  const localisation = params.localisation ?? ''
  const page = parseInt(params.page ?? '1', 10)

  const [{ entreprises, totalPages }, recentlyViewed, secteurs] = await Promise.all([
    getEntreprisesForDiscovery({ search, secteur, localisation, page }),
    getEntreprisesRecentlyViewed(),
    getSecteursList(),
  ])

  const currentSearchParams: Record<string, string> = {}
  if (search) currentSearchParams.search = search
  if (secteur) currentSearchParams.secteur = secteur
  if (localisation) currentSearchParams.localisation = localisation

  return (
    <div className="max-w-5xl">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1117]">Discovery</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Découvrez de nouvelles entreprises avec qui collaborer
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-8">
        <DiscoveryFilters
          secteurs={secteurs}
          currentSearch={search}
          currentSecteur={secteur}
          currentLocalisation={localisation}
        />
      </div>

      {/* Section récemment consultés */}
      {recentlyViewed.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0F1117]">
              Entreprises récemment consultées
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyViewed.map((e) => (
              <EntrepriseCard key={e.id} entreprise={e} />
            ))}
          </div>
        </section>
      )}

      {/* Section principale */}
      <section>
        <h2 className="text-base font-semibold text-[#0F1117] mb-4">
          {search || secteur || localisation
            ? 'Résultats de recherche'
            : 'Nouvelles entreprises à explorer'}
        </h2>

        {entreprises.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#6B7280]">
            Aucune entreprise trouvée.
            {(search || secteur || localisation) && (
              <span> Essayez d&apos;élargir vos critères.</span>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entreprises.map((e) => (
              <EntrepriseCard key={e.id} entreprise={e} />
            ))}
          </div>
        )}

        <DiscoveryPagination
          page={page}
          totalPages={totalPages}
          searchParams={currentSearchParams}
        />
      </section>
    </div>
  )
}
