'use client'

import Link from 'next/link'
import { useProfileSelection, PROFILES } from './useProfileSelection'
import type { ProfileOption, ProfileId } from './useProfileSelection'
import styles from './ProfileSelection.module.css'

const STEP        = 1
const TOTAL_STEPS = 6

interface ProfileCardProps {
  profile:    ProfileOption
  isSelected: boolean
  onSelect:   () => void
  onChoose:   () => void
}

function ProfileCard({ profile, isSelected, onSelect, onChoose }: ProfileCardProps) {
  const cardClass = [styles.card, isSelected ? styles.selected : '']
    .filter(Boolean)
    .join(' ')

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={profile.title}
      className={cardClass}
      onClick={onSelect}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className={styles.cardAvatar} aria-hidden="true" />
      <h2 className={styles.cardTitle}>{profile.title}</h2>
      <p className={styles.cardDesc}>{profile.description}</p>
      <ul className={styles.cardFeatures} aria-label="Caractéristiques">
        {profile.features.map(feature => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.cardBtn}
        aria-label={`Choisir le profil ${profile.title}`}
        onClick={e => {
          e.stopPropagation()
          onChoose()
        }}
      >
        Choisir ce profil
      </button>
    </article>
  )
}

interface ProfileSelectionProps {
  onSelectProfil: (profil: ProfileId) => void
}

export default function ProfileSelection({ onSelectProfil }: ProfileSelectionProps) {
  const { isSelected, selectProfile } = useProfileSelection()

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo} aria-label="Retour à l'accueil Opus">
            OPUS
          </Link>
          <Link href="/" className={styles.backLink} aria-label="Retour à l'accueil">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </Link>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={STEP}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Étape ${STEP} sur ${TOTAL_STEPS}`}
        >
          <div className={styles.progressFill} style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className={styles.pageTitle}>Quel est votre profil&nbsp;?</h1>
        <p className={styles.pageSubtitle}>Vous pourrez modifier ces informations plus tard.</p>

        <div className={styles.cardsGrid} role="group" aria-label="Choisissez votre profil">
          {PROFILES.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={isSelected(profile.id)}
              onSelect={() => selectProfile(profile.id)}
              onChoose={() => onSelectProfil(profile.id)}
            />
          ))}
        </div>
      </main>

    </div>
  )
}
