import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  getEntrepriseDiscoveryDetail,
  recordEntrepriseView,
} from '@/lib/actions/discovery.actions'

export const dynamic = 'force-dynamic'

function extractCity(adresse: string): string {
  const parts = adresse.split(/[,\n]/)
  const last = parts[parts.length - 1]?.trim()
  return last?.replace(/^\d{5}\s*/, '') || adresse
}

function Initiales({ nom }: { nom: string }) {
  return (
    <>
      {nom
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')}
    </>
  )
}

export default async function EntrepriseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/connexion')

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    select: { profil: true },
  })

  if (utilisateur?.profil === 'entreprise') redirect('/dashboard')

  const { id } = await params
  const entreprise = await getEntrepriseDiscoveryDetail(id)
  if (!entreprise) notFound()

  // Enregistre la vue (upsert, pas critique si ça échoue)
  await recordEntrepriseView(id).catch(() => null)

  const ville = extractCity(entreprise.adresseSiege)

  return (
    <div className="max-w-3xl">
      {/* Retour */}
      <Link
        href="/discovery"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0F1117] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour à Discovery
      </Link>

      {/* Bannière + logo */}
      <div className="relative h-44 rounded-xl bg-gradient-to-br from-[#4648D4] to-[#7C7FE8] overflow-hidden mb-8">
        {entreprise.bannerUrl && (
          <img
            src={entreprise.bannerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
          {entreprise.logoUrl ? (
            <img
              src={entreprise.logoUrl}
              alt={`Logo ${entreprise.raisonSociale}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-[#4648D4]">
              <Initiales nom={entreprise.raisonSociale} />
            </span>
          )}
        </div>
      </div>

      {/* Nom + bouton principal */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F1117]">{entreprise.raisonSociale}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">SIRET : {entreprise.siret}</p>
        </div>
        <Link
          href={`/opportunites/nouvelle?entrepriseId=${entreprise.id}`}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#4648D4] hover:bg-[#3533B0] rounded-lg transition-colors"
        >
          Proposer une opportunité
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#0F1117]">Informations générales</h2>
          <InfoRow label="Localisation" value={entreprise.adresseSiege} />
          <InfoRow label="Ville" value={ville} />
          {entreprise.codeApe && <InfoRow label="Code APE" value={entreprise.codeApe} />}
          {entreprise.representantLegal && (
            <InfoRow label="Représentant légal" value={entreprise.representantLegal} />
          )}
          {entreprise.numeroTVA && (
            <InfoRow label="N° TVA intracommunautaire" value={entreprise.numeroTVA} />
          )}
        </section>

        <section className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#0F1117]">Commission & contact</h2>
          {entreprise.tauxCommissionDefaut !== null && (
            <InfoRow
              label="Taux de commission"
              value={`${entreprise.tauxCommissionDefaut}%`}
            />
          )}
          {entreprise.montantFixeDefaut !== null && (
            <InfoRow
              label="Commission fixe"
              value={`${entreprise.montantFixeDefaut.toLocaleString('fr-FR')} €`}
            />
          )}
          {!entreprise.tauxCommissionDefaut && !entreprise.montantFixeDefaut && (
            <InfoRow label="Commission" value="Non renseignée" />
          )}
          <InfoRow label="Email" value={entreprise.email} />
          <InfoRow label="Téléphone" value={entreprise.telephone} />
          <InfoRow
            label="Membre depuis"
            value={new Date(entreprise.createdAt).toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          />
        </section>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#9CA3AF]">{label}</span>
      <span className="text-sm text-[#374151]">{value}</span>
    </div>
  )
}
