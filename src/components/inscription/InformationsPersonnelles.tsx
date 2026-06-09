'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/styles/inscription/InformationsPersonnelles.module.css'

/* ── Étapes selon le profil (sans "Choix du profil") ──────────── */
type Step = { num: number; label: string; status: 'active' | 'inactive' | 'done'; sub: string | null }

const STEPS_PARTICULIER: Step[] = [
  { num: 1, label: 'Informations personnelles',       status: 'active',   sub: 'En cours' },
  { num: 2, label: 'Coordonnées bancaires (IBAN)',    status: 'inactive', sub: null },
  { num: 3, label: "Vérification d'identité (KYC)",  status: 'inactive', sub: null },
  { num: 4, label: 'Validation email & CGU',          status: 'inactive', sub: null },
]

const STEPS_PRO: Step[] = [
  { num: 1, label: 'Informations personnelles',       status: 'active',   sub: 'En cours' },
  { num: 2, label: 'Vérification SIRET',              status: 'inactive', sub: null },
  { num: 3, label: 'Coordonnées bancaires (IBAN)',    status: 'inactive', sub: null },
  { num: 4, label: "Vérification d'identité (KYC)",  status: 'inactive', sub: null },
  { num: 5, label: 'Validation email & CGU',          status: 'inactive', sub: null },
]

const ROLES = [
  'Apporteur d\'affaires',
  'Agent immobilier',
  'Courtier',
  'Indépendant',
  'Gérant BTP',
  'Autre',
]

/* ── Icône œil ──────────────────────────────────────────────────── */
function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

/* ── Icône check ────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

/* ── Composant principal ────────────────────────────────────────── */
export default function InformationsPersonnelles() {
  const router = useRouter()

  const [profile, setProfile] = useState<string | null>(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    setProfile(sessionStorage.getItem('opus_profile'))
    setReady(true)
  }, [])

  const isParticulier = profile === 'particulier'
  const step      = 1
  const total     = isParticulier ? 4 : 5
  const stepsList = isParticulier ? STEPS_PARTICULIER : STEPS_PRO

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    fonction: '',
    motDePasse: '',
    confirmation: '',
  })

  const [showPassword, setShowPassword]     = useState(false)
  const [showConfirm,  setShowConfirm]      = useState(false)

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /* Routage conditionnel : Rapporteur particulier → saute l'étape 3 (SIRET) */
    const profile = typeof window !== 'undefined'
      ? sessionStorage.getItem('opus_profile')
      : null
    if (profile === 'particulier') {
      router.push('/inscription/etape-4')
    } else {
      router.push('/inscription/etape-3')
    }
  }

  return (
    <div className={styles.page}>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo} aria-label="Accueil Opus">
            OPUS
          </Link>
          <Link href="/inscription" className={styles.backLink} aria-label="Retour">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </Link>
        </div>

        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Étape ${step} sur ${total}`}
        >
          <div className={styles.progressFill} style={{ width: ready ? `${(step / total) * 100}%` : '0%' }} />
        </div>
      </header>

      {/* ── CONTENU ────────────────────────────────────────────── */}
      <main className={styles.main}>

        <p className={styles.stepLabel}>Étape {step} sur {total}</p>
        <h1 className={styles.pageTitle}>Informations personnelles</h1>
        <p className={styles.pageSubtitle}>Configurez votre profil utilisateur</p>

        <div className={styles.layout}>

          {/* ── FORMULAIRE ───────────────────────────────────── */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGrid}>

              {/* Nom */}
              <div className={styles.field}>
                <label htmlFor="nom" className={styles.label}>
                  Nom <span className={styles.required}>*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  className={styles.input}
                  value={form.nom}
                  onChange={set('nom')}
                  required
                  autoComplete="family-name"
                />
              </div>

              {/* Prénom */}
              <div className={styles.field}>
                <label htmlFor="prenom" className={styles.label}>
                  Prénom <span className={styles.required}>*</span>
                </label>
                <input
                  id="prenom"
                  type="text"
                  className={styles.input}
                  value={form.prenom}
                  onChange={set('prenom')}
                  required
                  autoComplete="given-name"
                />
              </div>

              {/* Email */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label htmlFor="email" className={styles.label}>
                  Email professionnel <span className={styles.required}>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={form.email}
                  onChange={set('email')}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Téléphone */}
              <div className={styles.field}>
                <label htmlFor="telephone" className={styles.label}>
                  Numéro de téléphone <span className={styles.required}>*</span>
                </label>
                <input
                  id="telephone"
                  type="tel"
                  className={styles.input}
                  value={form.telephone}
                  onChange={set('telephone')}
                  required
                  autoComplete="tel"
                />
              </div>

              {/* Fonction */}
              <div className={styles.field}>
                <label htmlFor="fonction" className={styles.label}>
                  Fonction (Optionnel)
                </label>
                <select
                  id="fonction"
                  className={styles.select}
                  value={form.fonction}
                  onChange={set('fonction')}
                >
                  <option value="" disabled>Sélectionnez un rôle</option>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Mot de passe */}
              <div className={styles.field}>
                <label htmlFor="motDePasse" className={styles.label}>
                  Mot de passe <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="motDePasse"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    value={form.motDePasse}
                    onChange={set('motDePasse')}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              <div className={styles.field}>
                <label htmlFor="confirmation" className={styles.label}>
                  Confirmation Mot de passe <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmation"
                    type={showConfirm ? 'text' : 'password'}
                    className={styles.input}
                    value={form.confirmation}
                    onChange={set('confirmation')}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
              </div>

            </div>

            {/* Boutons */}
            <div className={styles.formFooter}>
              <button
                type="button"
                className={styles.btnPrev}
                onClick={() => router.push('/inscription')}
              >
                Précédent
              </button>
              <button type="submit" className={styles.btnNext}>
                Continuer
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>

          {/* ── SIDEBAR ÉTAPES ────────────────────────────────── */}
          <aside className={styles.sidebar} aria-label="Progression de l'inscription">
            <p className={styles.sidebarTitle}>Étapes de l&apos;inscription</p>

            <ol className={styles.stepsList}>
              {stepsList.map(s => (
                <li
                  key={s.num}
                  className={`${styles.stepItem} ${styles[s.status]}`}
                >
                  <div className={styles.stepBadge} aria-hidden="true">
                    {s.status === 'done' ? <CheckIcon /> : s.num}
                  </div>

                  <div className={styles.stepContent}>
                    <span className={styles.stepName}>{s.label}</span>
                    {s.sub && (
                      <span className={`${styles.stepSubLabel} ${
                        s.status === 'done'   ? styles.validated  :
                        s.status === 'active' ? styles.inProgress : ''
                      }`}>
                        {s.sub}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </aside>

        </div>
      </main>
    </div>
  )
}
