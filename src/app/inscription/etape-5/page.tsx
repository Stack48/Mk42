import type { Metadata } from 'next'
import VerificationIdentite from './VerificationIdentite'

export const metadata: Metadata = {
  title: "Opus — Vérification d'identité",
}

export default function EtapeCinqPage() {
  return <VerificationIdentite />
}
