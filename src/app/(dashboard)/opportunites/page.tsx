import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import styles from './page.module.css'
import IconPlus from '@/components/icons/IconPlus'
import IconFile from '@/components/icons/IconFile'
import IconChevronRight from '@/components/icons/IconChevronRight'
import OpportunitesEntreprise, { type OppEntrepriseItem } from './_components/OpportunitesEntreprise'

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


export default async function OpportunitesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/connexion')

  const user = await prisma.utilisateur.findUnique({
    where: { clerkId: userId },
  })

  const entreprise = user
    ? await prisma.entreprise.findUnique({ where: { utilisateurId: user.id } })
    : null

  if (entreprise) {
    const opps = await prisma.opportunite.findMany({
      where: { entrepriseId: entreprise.id },
      include: {
        client: {
          select: {
            nom: true,
            prenom: true,
            raisonSociale: true,
            estProfessionnel: true,
            adresseChantier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const items: OppEntrepriseItem[] = opps.map(o => ({
      id: o.id,
      statut: o.statut,
      typeTravaux: o.typeTravaux,
      createdAt: o.createdAt,
      client: o.client,
    }))

    return (
      <div className="flex-1 p-12">
        <OpportunitesEntreprise opportunites={items} />
      </div>
    )
  }

  const apporteur = user
    ? await prisma.apporteur.findUnique({ where: { utilisateurId: user.id } })
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
            <IconPlus />
            Nouvelle opportunité
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <IconFile />
          </div>
          <p className={styles.emptyTitle}>Aucune opportunité pour l'instant</p>
          <p className={styles.emptyText}>
            Soumettez votre première opportunité client.<br />
            L'entreprise vous répondra sous 48h.
          </p>
          <Link href="/opportunites/nouvelle" className={styles.btnCta}>
            <IconPlus />
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

                  <div className="flex items-center gap-3">
                    <span className={`${styles.badge} ${statutClass}`}>
                      {STATUT_LABELS[opp.statut]}
                    </span>
                    <IconChevronRight />
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
