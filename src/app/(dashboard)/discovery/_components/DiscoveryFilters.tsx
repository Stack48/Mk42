'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'

type Props = {
  secteurs: string[]
  currentSearch: string
  currentSecteur: string
  currentLocalisation: string
}

export function DiscoveryFilters({
  secteurs,
  currentSearch,
  currentSecteur,
  currentLocalisation,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset page à 1 lors d'un changement de filtre
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Recherche */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M13.2 13.2A6.5 6.5 0 1 0 3 3a6.5 6.5 0 0 0 10.2 10.2zm0 0L17 17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Rechercher par nom d'entreprise ou SIRET..."
          defaultValue={currentSearch}
          onChange={(e) => updateParam('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648D4] focus:border-transparent bg-white placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Localisation */}
      <input
        type="text"
        placeholder="Localisation"
        defaultValue={currentLocalisation}
        onChange={(e) => updateParam('localisation', e.target.value)}
        className="w-full sm:w-44 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648D4] focus:border-transparent bg-white placeholder:text-[#9CA3AF]"
      />

      {/* Secteur */}
      <select
        defaultValue={currentSecteur}
        onChange={(e) => updateParam('secteur', e.target.value)}
        className="w-full sm:w-44 px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4648D4] focus:border-transparent bg-white text-[#374151]"
      >
        <option value="">Secteur (tous)</option>
        {secteurs.map((s) => (
          <option key={s} value={s}>
            APE {s}
          </option>
        ))}
      </select>
    </div>
  )
}
