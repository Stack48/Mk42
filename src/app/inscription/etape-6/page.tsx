import type { Metadata } from 'next'
import ValidationEmailCGU from '@/components/inscription/ValidationEmailCGU'

export const metadata: Metadata = {
  title: 'Opus — Validation Email & CGU',
}

export default function EtapeSixPage() {
  return <ValidationEmailCGU />
}
