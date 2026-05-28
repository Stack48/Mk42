/**
 * src/app/inscription/etape-2/page.tsx — FICHIER 4 : Routage
 *
 * Route : /inscription/etape-2
 * Déclenchée automatiquement par Clerk après la création de compte
 * via la variable d'environnement :
 *   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/inscription/etape-2
 *
 * Liaison Landing Page → cette page :
 *   Le bouton "Commencer gratuitement" (Header.tsx, Hero.tsx, etc.)
 *   pointe vers /inscription (formulaire Clerk).
 *   Clerk redirige ensuite ici après inscription réussie.
 */

import type { Metadata } from 'next'
import ProfileSelection from '@/components/inscription/ProfileSelection'

export const metadata: Metadata = {
  title: 'Opus — Quel est votre profil ?',
  description:
    'Choisissez votre profil pour personnaliser votre expérience Opus.',
}

export default function EtapeDeuxPage() {
  return <ProfileSelection />
}
