import type { Metadata } from 'next'
import Connexion from '@/components/connexion/Connexion'

export const metadata: Metadata = {
  title: 'Opus — Connexion',
  description: 'Accédez à votre espace Opus.',
}

export default function ConnexionPage() {
  return <Connexion />
}
