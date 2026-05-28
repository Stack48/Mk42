'use client'

/**
 * useProfileSelection.ts — FICHIER 1 : Logique
 *
 * Centralise :
 *  - Les données statiques des profils
 *  - L'état de sélection unique
 *  - La navigation vers l'étape suivante
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/* ── Types ──────────────────────────────────────────────────────── */

export type ProfileId = 'particulier' | 'professionnel' | 'entreprise'

export interface ProfileOption {
  id: ProfileId
  title: string
  description: string
  features: readonly string[]
}

/* ── Données statiques des profils ──────────────────────────────── */

export const PROFILES: ProfileOption[] = [
  {
    id: 'particulier',
    title: 'Rapporteur particulier',
    description:
      "Vous recommandez occasionnellement des artisans à votre entourage.",
    features: [
      "Pas besoin de SIRET",
      "Régime fiscal simplifié",
      "Reçu d'honoraires",
    ],
  },
  {
    id: 'professionnel',
    title: 'Rapporteur professionnel',
    description:
      "Agent immobilier, courtier, indépendant avec activité régulière.",
    features: [
      'SIRET requis',
      'Facturation pro',
      'Tableau de bord avancé',
    ],
  },
  {
    id: 'entreprise',
    title: 'Entreprise BTP',
    description:
      "Vous recevez des opportunités et payez des commissions.",
    features: [
      'SIRET requis',
      'Multi-utilisateurs',
      'Export DAS2 / FEC',
    ],
  },
]

/* ── Hook ───────────────────────────────────────────────────────── */

export interface UseProfileSelectionReturn {
  /** Identifiant du profil actuellement sélectionné (null si aucun) */
  selectedId: ProfileId | null
  /** Retourne true si le profil donné est sélectionné */
  isSelected: (id: ProfileId) => boolean
  /** true dès qu'au moins un profil est sélectionné */
  canContinue: boolean
  /** Sélectionne un profil (sélection unique, idempotente) */
  selectProfile: (id: ProfileId) => void
  /** Navigue vers l'étape suivante si un profil est sélectionné */
  handleContinue: () => void
}

export function useProfileSelection(): UseProfileSelectionReturn {
  const [selectedId, setSelectedId] = useState<ProfileId | null>(null)
  const router = useRouter()

  const selectProfile = useCallback((id: ProfileId) => {
    setSelectedId(id)
  }, [])

  const handleContinue = useCallback(() => {
    if (!selectedId) return
    router.push('/inscription/etape-2')
  }, [selectedId, router])

  return {
    selectedId,
    isSelected: (id: ProfileId) => selectedId === id,
    canContinue: selectedId !== null,
    selectProfile,
    handleContinue,
  }
}
