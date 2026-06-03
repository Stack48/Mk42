import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Opus — Mes opportunités',
}

const STATUT_LABELS: Record<string, string> = {
  SOUMISE:        'En attente',
  ACCEPTEE:       'Acceptée',
  REFUSEE:        'Refusée',
  EN_NEGOCIATION: 'En négociation',
}

const STATUT_CLASS: Record<string, string> = {
  SOUMISE:        'soumise',
  ACCEPTEE:       'acceptee',
  REFUSEE:        'refusee',
  EN_NEGOCIATION: 'negociation',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10L16 4z" />
      <path d="M16 4v6h6M11 14h6M11 18h4" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

export default async function OpportunitesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/connexion')

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
  })

  const apporteur = utilisateur
    ? await prisma.apporteur.findUnique({ where: { utilisateurId: utilisateur.id } })
    : null

  const opportunites = apporteur
    ? await prisma.opportunite.findMany({
        where:   { apporteurId: apporteur.id },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  const isEmpty = opportunites.length === 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mes opportunités</h1>
        {!isEmpty && (
          <Link href="/opportunites/nouvelle" className={styles.btnNew}>
            <PlusIcon />
            Nouvelle opportunité
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <FileIcon />
          </div>
          <p className={styles.emptyTitle}>Aucune opportunité pour l'instant</p>
          <p className={styles.emptyText}>
            Soumettez votre première opportunité client.<br />
            L'entreprise vous répondra sous 48h.
          </p>
          <Link href="/opportunites/nouvelle" className={styles.btnCta}>
            <PlusIcon />
            Proposer une opportunité
          </Link>
        </div>
      ) : (
        <ol className={styles.list} aria-label="Liste de vos opportunités">
          {opportunites.map(opp => {
            const clientLabel = opp.client
              ? opp.client.estProfessionnel
                ? (opp.client.raisonSociale ?? '—')
                : `${opp.client.prenom ?? ''} ${opp.client.nom ?? ''}`.trim() || '—'
              : '—'

            const statutClass = styles[STATUT_CLASS[opp.statut] ?? 'soumise']

            return (
              <li key={opp.id}>
                <Link
                  href={`/opportunites/${opp.id}`}
                  className={styles.card}
                  aria-label={`Opportunité ${clientLabel} — ${STATUT_LABELS[opp.statut]}`}
                >
                  <div className={styles.cardMain}>
                    <span className={styles.cardClient}>{clientLabel}</span>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardTravaux}>{opp.typeTravaux}</span>
                      <span className={styles.cardDate}>Soumise le {formatDate(opp.createdAt)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`${styles.badge} ${statutClass}`}>
                      {STATUT_LABELS[opp.statut]}
                    </span>
                    <ChevronRightIcon />
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
