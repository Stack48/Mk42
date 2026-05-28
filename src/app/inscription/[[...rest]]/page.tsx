/**
 * /inscription  →  Étape 1 — Sélection du profil (maquette 6.png)
 *
 * Catch-all nécessaire pour que Next.js serve aussi
 * /inscription/anything sans conflits.
 * Les routes plus spécifiques (/inscription/compte, /inscription/etape-2)
 * restent prioritaires sur ce catch-all.
 */
import type { Metadata } from 'next'
import ProfileSelection from '@/components/inscription/ProfileSelection'

export const metadata: Metadata = {
  title: 'Opus — Quel est votre profil ?',
  description: 'Choisissez votre profil pour personnaliser votre expérience Opus.',
}

export default function InscriptionPage() {
  return <ProfileSelection />
}
