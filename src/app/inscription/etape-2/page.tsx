import type { Metadata } from 'next'
import InformationsPersonnelles from './InformationsPersonnelles'

export const metadata: Metadata = {
  title: 'Opus — Informations personnelles',
}

export default function EtapeDeuxPage() {
  return <InformationsPersonnelles />
}
