'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import IconChevronRight from '@/components/icons/IconChevronRight'

const STATUT_BADGE: Record<string, { label: string; className: string }> = {
  SOUMISE:        { label: 'Nouveau',   className: 'bg-[#FEF9C3] text-[#92400E]' },
  ACCEPTEE:       { label: 'Acceptée',  className: 'bg-[#D8F0E6] text-[#15724A]' },
  REFUSEE:        { label: 'Refusée',   className: 'bg-[#FEE2E2] text-[#B91C1C]' },
  EN_NEGOCIATION: { label: 'Négociation', className: 'bg-[#EDE9FE] text-[#5B21B6]' },
}

function dateRelative(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

export type OppEntrepriseItem = {
  id: string
  statut: string
  typeTravaux: string
  createdAt: Date | string
  client: {
    nom: string | null
    prenom: string | null
    raisonSociale: string | null
    estProfessionnel: boolean
    adresseChantier: string | null
  }
}

const PAGE_SIZE = 5

export default function OpportunitesEntreprise({ opportunites }: { opportunites: OppEntrepriseItem[] }) {
  const [query, setQuery] = useState('')
  const [filtreType, setFiltreType] = useState('Tous')
  const [pageRecues, setPageRecues] = useState(PAGE_SIZE)

  const typesUniques = useMemo(() => {
    const set = new Set(opportunites.map(o => o.typeTravaux))
    return ['Tous', ...Array.from(set)]
  }, [opportunites])

  const recues = useMemo(() => opportunites.filter(o => o.statut === 'SOUMISE'), [opportunites])
  const acceptees = useMemo(() => opportunites.filter(o => o.statut === 'ACCEPTEE'), [opportunites])

  const recuesFiltrees = useMemo(() => {
    return recues.filter(o => {
      const label = o.client.estProfessionnel
        ? (o.client.raisonSociale ?? '')
        : `${o.client.prenom ?? ''} ${o.client.nom ?? ''}`.trim()
      const matchQuery =
        query === '' ||
        label.toLowerCase().includes(query.toLowerCase()) ||
        o.typeTravaux.toLowerCase().includes(query.toLowerCase())
      const matchType = filtreType === 'Tous' || o.typeTravaux === filtreType
      return matchQuery && matchType
    })
  }, [recues, query, filtreType])

  const clientLabel = (o: OppEntrepriseItem) =>
    o.client.estProfessionnel
      ? (o.client.raisonSociale ?? '—')
      : `${o.client.prenom ?? ''} ${o.client.nom ?? ''}`.trim() || '—'

  return (
    <div className="space-y-10">
      {/* Opportunités reçues */}
      <section>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Opportunités reçues</h1>
        <p className="text-sm text-[#64748B] mb-6">Gérez vos prospects et convertissez vos dossiers</p>

        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full max-w-sm pl-9 pr-4 h-9 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] outline-none focus:border-[#4648D4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] transition-[border-color,box-shadow]"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {typesUniques.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFiltreType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtreType === type
                  ? 'bg-[#4648D4] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#374151] hover:bg-[#F3F4F6]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {recuesFiltrees.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#E2E8F0] rounded-2xl bg-white">
            <p className="text-sm text-[#64748B]">Aucune opportunité reçue pour l'instant.</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl divide-y divide-[#E2E8F0]">
              {recuesFiltrees.slice(0, pageRecues).map(o => {
                const badge = STATUT_BADGE[o.statut] ?? STATUT_BADGE.SOUMISE
                return (
                  <Link
                    key={o.id}
                    href={`/opportunites/${o.id}`}
                    className="flex items-center gap-6 px-6 py-4 hover:bg-[#F8F9FF] transition-colors no-underline"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-0.5">Client</p>
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{clientLabel(o)}</p>
                      <p className="text-xs text-[#64748B]">{dateRelative(o.createdAt)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-0.5">Type de travaux</p>
                      <p className="text-sm font-semibold text-[#0F172A]">{o.typeTravaux}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-0.5">Lieu</p>
                      <p className="text-sm text-[#0F172A] truncate">{o.client.adresseChantier || '—'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${badge.className}`}>
                      {badge.label}
                    </span>
                  </Link>
                )
              })}
            </div>
            {recuesFiltrees.length > pageRecues && (
              <button
                type="button"
                onClick={() => setPageRecues(p => p + PAGE_SIZE)}
                className="mt-4 w-full py-2.5 text-sm font-medium text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F3F4F6] transition-colors"
              >
                Voir plus ↓
              </button>
            )}
          </>
        )}
      </section>

      {/* Opportunités acceptées */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#0F172A]">Opportunités Acceptées</h2>
          {acceptees.length > 0 && (
            <span className="px-3 py-1 bg-[#4648D4] text-white rounded-full text-xs font-semibold">
              {acceptees.length} Actives
            </span>
          )}
        </div>

        {acceptees.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-[#E2E8F0] rounded-2xl bg-white">
            <p className="text-sm text-[#64748B]">Aucune opportunité acceptée.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl divide-y divide-[#E2E8F0]">
            {acceptees.map(o => (
              <Link
                key={o.id}
                href={`/opportunites/${o.id}`}
                className="flex items-center gap-6 px-6 py-4 hover:bg-[#F8F9FF] transition-colors no-underline"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-0.5">Lieu</p>
                  <p className="text-sm text-[#0F172A] truncate">{o.client.adresseChantier || '—'}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-0.5">Client</p>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{clientLabel(o)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-0.5">Type</p>
                  <p className="text-sm font-semibold text-[#0F172A]">{o.typeTravaux}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold shrink-0 bg-[#D8F0E6] text-[#15724A]">
                  Acceptée
                </span>
                <IconChevronRight />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
