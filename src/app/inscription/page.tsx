import type { Metadata } from 'next'
import ProfileSelection from './ProfileSelection'

export const metadata: Metadata = {
  title: 'Opus — Quel est votre profil ?',
  description: 'Choisissez votre profil pour personnaliser votre expérience Opus.',
}

export default function InscriptionPage() {
  return <ProfileSelection />
}
