import type { Metadata } from 'next'
import CoordonneesBancaires from './CoordonneesBancaires'

export const metadata: Metadata = {
  title: 'Opus — Coordonnées bancaires',
}

export default function EtapeQuatrePage() {
  return <CoordonneesBancaires />
}
