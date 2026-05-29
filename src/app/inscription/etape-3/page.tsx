/**
 * /inscription/etape-3 — Vérification SIRET
 *
 * Accessible uniquement pour les profils :
 *   - Rapporteur professionnel
 *   - Entreprise BTP
 *
 * Les "Rapporteur particulier" sont redirigés directement vers
 * /inscription/etape-4 depuis InformationsPersonnelles.tsx
 * (contrôle via sessionStorage.opus_profile)
 */
import type { Metadata } from 'next'
import VerificationSiret from '@/components/inscription/VerificationSiret'

export const metadata: Metadata = {
  title: 'Opus — Vérification de votre entreprise',
}

export default function EtapeTroisPage() {
  return <VerificationSiret />
}
