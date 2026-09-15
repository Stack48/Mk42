import Link from 'next/link'
import type { EntrepriseDiscoveryCard } from '@/lib/actions/discovery.actions'

function extractCity(adresse: string): string {
  const parts = adresse.split(/[,\n]/)
  const last = parts[parts.length - 1]?.trim()
  // Supprime le code postal si présent (ex: "75001 Paris" → "Paris")
  return last?.replace(/^\d{5}\s*/, '') || adresse
}

function CommissionBadge({
  taux,
  fixe,
}: {
  taux: number | null
  fixe: number | null
}) {
  if (taux) return <span>{taux}%</span>
  if (fixe) return <span>{fixe.toLocaleString('fr-FR')} €</span>
  return <span className="text-[#9CA3AF]">Non renseignée</span>
}

function Initiales({ nom }: { nom: string }) {
  return nom
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function EntrepriseCard({ entreprise }: { entreprise: EntrepriseDiscoveryCard }) {
  return (
    <article className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Bannière */}
      <div className="relative h-32 bg-gradient-to-br from-[#4648D4] to-[#7C7FE8] shrink-0">
        {entreprise.bannerUrl && (
          <img
            src={entreprise.bannerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {/* Logo circulaire */}
        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-full border-2 border-white bg-white shadow flex items-center justify-center overflow-hidden shrink-0">
          {entreprise.logoUrl ? (
            <img
              src={entreprise.logoUrl}
              alt={`Logo ${entreprise.raisonSociale}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-[#4648D4]">
              <Initiales nom={entreprise.raisonSociale} />
            </span>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="pt-7 px-4 pb-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold text-[#0F1117] truncate">
          {entreprise.raisonSociale}
        </h3>

        <div className="flex flex-col gap-1.5 text-xs text-[#6B7280]">
          {entreprise.codeApe && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 16 16">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" opacity=".5" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".5" />
              </svg>
              <span>APE {entreprise.codeApe}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 16 16">
              <path
                d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3 4.5 8.5 4.5 8.5S12.5 9 12.5 6A4.5 4.5 0 0 0 8 1.5zm0 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
                fill="currentColor"
              />
            </svg>
            <span className="truncate">{extractCity(entreprise.adresseSiege)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 16 16">
              <path
                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-4.5h1.5v4.5zm0-6h-1.5V4h1.5v1.5z"
                fill="currentColor"
              />
            </svg>
            <span>
              Commission :{' '}
              <CommissionBadge
                taux={entreprise.tauxCommissionDefaut}
                fixe={entreprise.montantFixeDefaut}
              />
            </span>
          </div>
        </div>

        <div className="mt-auto pt-2">
          <Link
            href={`/discovery/${entreprise.id}`}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-xs font-semibold text-[#0F1117] border border-[#D1D5DB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            Découvrir
          </Link>
        </div>
      </div>
    </article>
  )
}
