'use client'

import { useState, useEffect, useTransition } from 'react'
import type { OpportuniteFormData } from '../page'
import { searchEntreprises, type EntrepriseResult } from '@/lib/actions/entreprise.actions'

interface Props {
  formData: OpportuniteFormData
  setFormData: (data: OpportuniteFormData) => void
  onNext: () => void
  onPrev: () => void
}

export default function StepChoixEntreprise({ formData, setFormData, onNext, onPrev }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EntrepriseResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setHasSearched(false)
      return
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await searchEntreprises(query)
        setResults(res)
        setHasSearched(true)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (entreprise: EntrepriseResult) => {
    setFormData({
      ...formData,
      entrepriseId:    entreprise.id,
      entrepriseNom:   entreprise.raisonSociale,
      entrepriseSiret: entreprise.siret,
    })
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (formData.entrepriseId) {
      setFormData({ ...formData, entrepriseId: '', entrepriseNom: '', entrepriseSiret: '' })
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
      {/* Champ de recherche */}
      <div className="flex flex-col gap-1.5 mb-4">
        <label htmlFor="search-entreprise" className="text-[13px] font-medium text-[#1E293B]">
          Rechercher une entreprise <span className="text-[#4648D4]">*</span>
        </label>
        <input
          id="search-entreprise"
          type="text"
          className="h-9 px-3.5 bg-[#F3F4F6] border border-[#E2E8F0] rounded-lg font-inherit text-sm text-[#0F172A] outline-none w-full transition-[border-color,box-shadow] duration-150 placeholder:text-[#B0B8C1] focus:border-[#4648D4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:bg-white"
          placeholder="Raison sociale ou numéro SIRET"
          value={query}
          onChange={handleQueryChange}
          autoComplete="off"
        />
        <span className="text-xs text-[#64748B]">Saisissez au moins 2 caractères pour rechercher.</span>
      </div>

      {/* État de chargement */}
      {isPending && (
        <p className="text-[13px] text-[#64748B] text-center py-5">Recherche en cours…</p>
      )}

      {/* Aucun résultat */}
      {!isPending && hasSearched && results.length === 0 && (
        <p className="text-[13px] text-[#64748B] text-center py-5">
          Aucune entreprise trouvée pour « {query} ».
        </p>
      )}

      {/* Résultats */}
      {!isPending && results.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {results.map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => handleSelect(e)}
              className={`flex flex-col gap-0.5 px-4 py-3.5 rounded-xl border text-left w-full font-inherit transition-[border-color,background-color] duration-150 ${
                formData.entrepriseId === e.id
                  ? 'border-[#4648D4] bg-[#EEEEFF]'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#4648D4] hover:bg-[#EEEEFF]'
              }`}
            >
              <span className="text-sm font-semibold text-[#0F172A]">{e.raisonSociale}</span>
              <span className="text-xs text-[#64748B] font-mono">SIRET : {e.siret}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex gap-2.5">
        <button
          type="button"
          onClick={onPrev}
          className="px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg text-[13px] font-semibold text-[#0F172A] cursor-pointer transition-[border-color] duration-150 hover:border-[#64748B]"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.entrepriseId}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-[#4648D4] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-[background-color] duration-150 hover:bg-[#3533B0] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}
