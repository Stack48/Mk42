'use client'

import { useUser } from '@clerk/nextjs'
import styles from './css/StepVosInfos.module.css'
import IconEmail from '@/components/icons/IconEmail'
import IconPhone from '@/components/icons/IconPhone'
import IconBuilding from '@/components/icons/IconBuilding'
import IconArrowRight from '@/components/icons/IconArrowRight'

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
          <div className={styles.fieldIcon} aria-hidden="true"><IconEmail /></div>
          <div className={styles.fieldContent}>
            <span className={styles.fieldLabel}>Email</span>
            <span className={styles.fieldValue}>{email}</span>
          </div>
        </div>

        {phone && (
          <div className={styles.fieldRow}>
            <div className={styles.fieldIcon} aria-hidden="true"><IconPhone /></div>
            <div className={styles.fieldContent}>
              <span className={styles.fieldLabel}>Téléphone</span>
              <span className={styles.fieldValue}>{phone}</span>
            </div>
          </div>
        )}

        {isPro && siret && (
          <div className={styles.fieldRow}>
            <div className={styles.fieldIcon} aria-hidden="true"><IconBuilding /></div>
            <div className={styles.fieldContent}>
              <span className={styles.fieldLabel}>SIRET</span>
              <span className={styles.fieldValueMono}>{siret}</span>
            </div>
          </div>
        )}

        {isPro && raison && (
          <div className={styles.fieldRow}>
            <div className={styles.fieldIcon} aria-hidden="true"><IconBuilding /></div>
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
          <IconArrowRight />
        </button>
      </div>
    </div>
  )
}
