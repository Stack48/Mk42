import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import ActionButtons from './_components/ActionButtons'

export const metadata: Metadata = { title: 'Opus — Opportunité' }

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(date)
}

const DELAI_LABELS: Record<string, string> = {
  urgent: 'Urgent (< 1 mois)',
  '1-3':  '1 à 3 mois',
  '3-6':  '3 à 6 mois',
  '6+':   'Plus de 6 mois',
}

const STATUT_BADGE: Record<string, { label: string; className: string }> = {
  SOUMISE:        { label: 'En attente',  className: 'bg-[#FEF9C3] text-[#92400E]' },
  ACCEPTEE:       { label: 'Acceptée',    className: 'bg-[#D8F0E6] text-[#15724A]' },
  REFUSEE:        { label: 'Refusée',     className: 'bg-[#FEE2E2] text-[#B91C1C]' },
  EN_NEGOCIATION: { label: 'Négociation', className: 'bg-[#EDE9FE] text-[#5B21B6]' },
}

export default async function OpportuniteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/connexion')

  const user = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
    include: { entreprise: { select: { id: true } } },
  })
  if (!user?.entreprise) notFound()

  const opp = await prisma.opportunite.findUnique({
    where: { id },
    include: {
      client: true,
      apporteur: { select: { nom: true, prenom: true, telephone: true } },
    },
  })

  if (!opp || opp.entrepriseId !== user.entreprise.id) notFound()

  const clientLabel = opp.client.estProfessionnel
    ? (opp.client.raisonSociale ?? '—')
    : `${opp.client.prenom ?? ''} ${opp.client.nom ?? ''}`.trim() || '—'

  const badge = STATUT_BADGE[opp.statut] ?? STATUT_BADGE.SOUMISE

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Détail de l'opportunité</h1>
          <p className="text-sm text-[#64748B] mt-1">Soumise le {formatDate(opp.createdAt)}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Card client */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-4">Le client</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Nom</p>
            <p className="text-sm font-medium text-[#0F172A]">{clientLabel}</p>
          </div>
          {opp.client.estProfessionnel && opp.client.siret && (
            <div>
              <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">SIRET</p>
              <p className="text-sm font-mono text-[#0F172A]">{opp.client.siret}</p>
            </div>
          )}
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Téléphone</p>
            <p className="text-sm text-[#0F172A]">{opp.client.telephone || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Email</p>
            <p className="text-sm text-[#0F172A]">{opp.client.email || '—'}</p>
          </div>
          {opp.client.adresseChantier && (
            <div className="col-span-2">
              <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Adresse chantier</p>
              <p className="text-sm text-[#0F172A]">{opp.client.adresseChantier}</p>
            </div>
          )}
        </div>
      </div>

      {/* Card chantier */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-4">Le chantier</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Type de travaux</p>
            <p className="text-sm font-semibold text-[#0F172A]">{opp.typeTravaux}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Délai souhaité</p>
            <p className="text-sm text-[#0F172A]">{DELAI_LABELS[opp.delaiSouhaite ?? ''] ?? opp.delaiSouhaite ?? 'Non défini'}</p>
          </div>
          {opp.description && (
            <div className="col-span-2">
              <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Description</p>
              <p className="text-sm text-[#0F172A] leading-relaxed">{opp.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Card apporteur */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-4">L'apporteur</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Nom</p>
            <p className="text-sm font-medium text-[#0F172A]">{opp.apporteur.prenom} {opp.apporteur.nom}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide mb-0.5">Téléphone</p>
            <p className="text-sm text-[#0F172A]">{opp.apporteur.telephone || '—'}</p>
          </div>
        </div>
      </div>

      {opp.statut === 'SOUMISE' && <ActionButtons opportuniteId={opp.id} />}
    </div>
  )
}
