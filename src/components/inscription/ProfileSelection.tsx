'use client'

/**
 * ProfileSelection.tsx — FICHIER 2 : Template
 *
 * Composant racine de l'étape 1/6.
 * Consomme le hook useProfileSelection pour toute la logique d'état.
 * Rendu : Header (progression) + Grille de profils + Bouton Continuer.
 */

import Link from 'next/link'
import { useProfileSelection, PROFILES } from './useProfileSelection'
import type { ProfileOption } from './useProfileSelection'
import styles from '@/styles/inscription/ProfileSelection.module.css'

/* ── Constantes de l'étape ──────────────────────────────────────── */
const STEP        = 1
const TOTAL_STEPS = 6

/* ================================================================
   Sous-composant : ProfileCard
   Reçoit uniquement les props nécessaires à son rendu.
   ================================================================ */
interface ProfileCardProps {
  profile:    ProfileOption
  isSelected: boolean
  onSelect:   () => void
}

function ProfileCard({ profile, isSelected, onSelect }: ProfileCardProps) {
  /* Combine la classe de base avec la classe d'état sélectionné */
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
      onKeyDown={e => {
        /* Accessibilité clavier : Entrée ou Espace activent la sélection */
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {/* Avatar placeholder */}
      <div className={styles.cardAvatar} aria-hidden="true" />

      {/* Titre */}
      <h2 className={styles.cardTitle}>{profile.title}</h2>

      {/* Description */}
      <p className={styles.cardDesc}>{profile.description}</p>

      {/* Liste des caractéristiques */}
      <ul className={styles.cardFeatures} aria-label="Caractéristiques">
        {profile.features.map(feature => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {/* Bouton d'action de la carte */}
      <button
        type="button"
        className={styles.cardBtn}
        aria-label={`Choisir le profil ${profile.title}`}
        onClick={e => {
          /* Empêche la remontée vers l'article qui déclencherait onSelect deux fois */
          e.stopPropagation()
          onSelect()
        }}
      >
        {isSelected ? 'Profil sélectionné ✓' : 'Choisir ce profil'}
      </button>
    </article>
  )
}

/* ================================================================
   Composant principal : ProfileSelection
   ================================================================ */
export default function ProfileSelection() {
  const {
    isSelected,
    canContinue,
    selectProfile,
    handleContinue,
  } = useProfileSelection()

  return (
    <div className={styles.page}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header className={styles.header}>

        {/* Barre logo + navigation retour */}
        <div className={styles.headerBar}>
          <Link
            href="/"
            className={styles.logo}
            aria-label="Retour à l'accueil Opus"
          >
            OPUS
          </Link>

          <Link
            href="/"
            className={styles.backLink}
            aria-label="Retour à l'accueil"
          >
            {/* Icône chevron gauche */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Retour
          </Link>
        </div>

        {/* Barre de progression ARIA-friendly */}
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={STEP}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Étape ${STEP} sur ${TOTAL_STEPS}`}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }}
          />
        </div>

      </header>
      {/* /HEADER */}


      {/* ── CONTENU PRINCIPAL ────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Indicateur d'étape */}
        <p className={styles.stepLabel}>
          Étape {STEP} sur {TOTAL_STEPS}
        </p>

        {/* Titre de la page */}
        <h1 className={styles.pageTitle}>
          Quel est votre profil&nbsp;?
        </h1>

        {/* Sous-titre */}
        <p className={styles.pageSubtitle}>
          Vous pourrez modifier ces informations plus tard.
        </p>

        {/* Grille des cartes de profil */}
        <div
          className={styles.cardsGrid}
          role="group"
          aria-label="Choisissez votre profil"
        >
          {PROFILES.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={isSelected(profile.id)}
              onSelect={() => selectProfile(profile.id)}
            />
          ))}
        </div>

        {/* Pied de page — bouton de validation */}
        <div className={styles.stepFooter}>
          <button
            type="button"
            className={styles.continueBtn}
            disabled={!canContinue}
            aria-disabled={!canContinue}
            onClick={handleContinue}
          >
            Continuer
            {/* Icône chevron droit */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

      </main>
      {/* /CONTENU PRINCIPAL */}

    </div>
  )
}
