'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './InformationsPersonnelles.module.css'
import type { Step2Data } from '../types'

const STEP        = 2
const TOTAL_STEPS = 6

const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'active',   sub: 'En cours' },
  { num: 3, label: 'Vérification SIRET',           status: 'inactive', sub: null       },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'inactive', sub: null       },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

const ROLES = [
  "Apporteur d'affaires",
  'Agent immobilier',
  'Courtier',
  'Indépendant',
  'Gérant BTP',
  'Autre',
]

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

function isStrongPassword(value: string) {
  return PASSWORD_REGEX.test(value)
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

interface Props {
  initialValues?: Partial<Step2Data>
  onNext: (data: Step2Data) => void
  onPrev: () => void
}

export default function InformationsPersonnelles({ initialValues = {}, onNext, onPrev }: Props) {
  const [form, setForm] = useState<Step2Data>({
    nom:          initialValues.nom          ?? '',
    prenom:       initialValues.prenom       ?? '',
    email:        initialValues.email        ?? '',
    telephone:    initialValues.telephone    ?? '',
    fonction:     initialValues.fonction     ?? '',
    motDePasse:   initialValues.motDePasse   ?? '',
    confirmation: initialValues.confirmation ?? '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [erreur,       setErreur]       = useState('')

  const set = (key: keyof Step2Data) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (form.motDePasse !== form.confirmation) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }
    if (!isStrongPassword(form.motDePasse)) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.')
      return
    }

    setErreur('')
    onNext(form)
  }

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo} aria-label="Accueil Opus">OPUS</Link>
          <button type="button" className={styles.backLink} onClick={onPrev} aria-label="Retour">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </button>
        </div>
        <div className={styles.progressTrack} role="progressbar" aria-valuenow={STEP}
          aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Étape ${STEP} sur ${TOTAL_STEPS}`}>
          <div className={styles.progressFill} style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className={styles.pageTitle}>Informations personnelles</h1>
        <p className={styles.pageSubtitle}>Configurez votre profil utilisateur</p>

        <div className={styles.layout}>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGrid}>

              <div className={styles.field}>
                <label htmlFor="nom" className={styles.label}>
                  Nom <span className={styles.required}>*</span>
                </label>
                <input id="nom" type="text" className={styles.input} value={form.nom}
                  onChange={set('nom')} required autoComplete="family-name" />
              </div>

              <div className={styles.field}>
                <label htmlFor="prenom" className={styles.label}>
                  Prénom <span className={styles.required}>*</span>
                </label>
                <input id="prenom" type="text" className={styles.input} value={form.prenom}
                  onChange={set('prenom')} required autoComplete="given-name" />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label htmlFor="email" className={styles.label}>
                  Email professionnel <span className={styles.required}>*</span>
                </label>
                <input id="email" type="email" className={styles.input} value={form.email}
                  onChange={set('email')} required autoComplete="email" />
              </div>

              <div className={styles.field}>
                <label htmlFor="telephone" className={styles.label}>
                  Numéro de téléphone <span className={styles.required}>*</span>
                </label>
                <input id="telephone" type="tel" className={styles.input} value={form.telephone}
                  onChange={set('telephone')} required autoComplete="tel" />
              </div>

              <div className={styles.field}>
                <label htmlFor="fonction" className={styles.label}>Fonction (Optionnel)</label>
                <select id="fonction" className={styles.select} value={form.fonction}
                  onChange={set('fonction')}>
                  <option value="" disabled>Sélectionnez un rôle</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="motDePasse" className={styles.label}>
                  Mot de passe <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input id="motDePasse" type={showPassword ? 'text' : 'password'}
                    className={styles.input} value={form.motDePasse} onChange={set('motDePasse')}
                    required autoComplete="new-password" />
                  <button type="button" className={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmation" className={styles.label}>
                  Confirmation Mot de passe <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input id="confirmation" type={showConfirm ? 'text' : 'password'}
                    className={styles.input} value={form.confirmation} onChange={set('confirmation')}
                    required autoComplete="new-password" />
                  <button type="button" className={styles.eyeBtn}
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
              </div>

            </div>

            {erreur && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{erreur}</p>
            )}

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev} onClick={onPrev}>
                Précédent
              </button>
              <button type="submit" className={styles.btnNext}>
                Continuer
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>

          <aside className={styles.sidebar} aria-label="Progression de l'inscription">
            <p className={styles.sidebarTitle}>Étapes de l'inscription</p>
            <ol className={styles.stepsList}>
              {STEPS_LIST.map(s => (
                <li key={s.num} className={`${styles.stepItem} ${styles[s.status]}`}>
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
