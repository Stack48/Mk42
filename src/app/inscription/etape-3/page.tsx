import type { Metadata } from 'next'
import VerificationSiret from './VerificationSiret'

export const metadata: Metadata = {
  title: 'Opus — Vérification de votre entreprise',
}

export default function EtapeTroisPage() {
  return <VerificationSiret />
}
