'use client'

import { useUser } from '@clerk/nextjs'
import styles from './StepVosInfos.module.css'

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" rx="2" />
      <path d="M1 5l7 5 7-5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.5 10.5l-2-2a1 1 0 0 0-1.4 0l-.6.6a9.2 9.2 0 0 1-3.1-3.1l.6-.6a1 1 0 0 0 0-1.4L5 2C4.5 1.5 3.5 2 3 2.5 1.5 4 2 7.5 5.5 11S12 14.5 13.5 13c.5-.5 1-1.5.5-2z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <path d="M6 6h.5M9.5 6H10M6 9h.5M9.5 9H10M6 12h.5M9.5 12H10" />
      <path d="M2 5h12" />
    </svg>
  )
}

interface Props {
  onNext: () => void
}

export default function StepVosInfos({ onNext }: Props) {
  const { user, isLoaded } = useUser()

  const firstName = isLoaded && user ? user.firstName ?? '' : 'John'
  const lastName  = isLoaded && user ? user.lastName  ?? '' : 'Doe'
  const email     = isLoaded && user ? user.emailAddresses[0]?.emailAddress ?? '' : 'john@exemple.fr'
  const phone     = isLoaded && user ? user.phoneNumbers[0]?.phoneNumber ?? '' : ''
  const role      = isLoaded && user ? (user.publicMetadata?.role as string) : undefined
  const siret     = isLoaded && user ? (user.publicMetadata?.siret as string) : undefined
  const raison    = isLoaded && user ? (user.publicMetadata?.raisonSociale as string) : undefined

  const isPro   = role === 'apporteur_pro'
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'JD'
  const roleLabel = isPro ? 'Apporteur Pro' : 'Apporteur Particulier'

  return (
    <div className={styles.card}>
      <div className={styles.profileRow}>
        <div className={styles.avatar} aria-hidden="true">{initials}</div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{firstName} {lastName}</span>
          <span className={styles.roleBadge}>{roleLabel}</span>
        </div>
      </div>

      <div className={styles.fieldList}>
        <div className={styles.fieldRow}>
          <div className={styles.fieldIcon} aria-hidden="true"><EmailIcon /></div>
          <div className={styles.fieldContent}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{email}</span>
          </div>
        </div>

        {phone && (
          <div className={styles.fieldRow}>
            <div className={styles.fieldIcon} aria-hidden="true"><PhoneIcon /></div>
            <div className={styles.fieldContent}>
              <span className={styles.fieldLabel}>Téléphone</span>
              <span className={styles.fieldValue}>{phone}</span>
            </div>
          </div>
        )}

        {isPro && siret && (
          <div className={styles.fieldRow}>
            <div className={styles.fieldIcon} aria-hidden="true"><BuildingIcon /></div>
            <div className={styles.fieldContent}>
              <span className={styles.fieldLabel}>SIRET</span>
              <span className={styles.fieldValueMono}>{siret}</span>
            </div>
          </div>
        )}

        {isPro && raison && (
          <div className={styles.fieldRow}>
            <div className={styles.fieldIcon} aria-hidden="true"><BuildingIcon /></div>
            <div className={styles.fieldContent}>
              <span className={styles.fieldLabel}>Raison sociale</span>
              <span className={styles.fieldValue}>{raison}</span>
            </div>
          </div>
        )}
      </div>

      <p className={styles.note}>
        Ces informations proviennent de votre profil. Pour les modifier, rendez-vous dans Paramètres.
      </p>

      <div className={styles.footer}>
        <button type="button" className={styles.btnNext} onClick={onNext}>
          Continuer
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
