import { Suspense } from 'react'
import type { Metadata } from 'next'
import InscriptionWizard from './InscriptionWizard'

export const metadata: Metadata = {
  title: 'Opus — Inscription',
  description: 'Créez votre compte Opus.',
}

export default function InscriptionPage() {
  return (
    <Suspense>
      <InscriptionWizard />
    </Suspense>
  )
}
