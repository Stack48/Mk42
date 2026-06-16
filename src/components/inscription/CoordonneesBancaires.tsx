'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './CoordonneesBancaires.module.css'

/* ── Icône check ────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7l3 3 6-6"/>
    </svg>
  )
}

/* ── Icône upload ────────────────────────────────────────────────── */
function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={styles.uploadIcon}>
      <rect x="4" y="4" width="28" height="28" rx="6"/>
      <path d="M18 24V14M13 19l5-5 5 5"/>
    </svg>
  )
}

/* ── Steps selon le profil (sans "Choix du profil") ────────────── */
const STEPS_PARTICULIER = [
  { num: 1, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Coordonnées bancaires (IBAN)', status: 'active',   sub: 'En cours' },
  { num: 3, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 4, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

const STEPS_PRO = [
  { num: 1, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Vérification SIRET',           status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Coordonnées bancaires (IBAN)', status: 'active',   sub: 'En cours' },
  { num: 4, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 5, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

/* ── Composant principal ────────────────────────────────────────── */
export default function CoordonneesBancaires() {
  const router = useRouter()

  const [profile, setProfile] = useState<string | null>(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    setProfile(sessionStorage.getItem('opus_profile'))
    setReady(true)
  }, [])

  const isParticulier = profile === 'particulier'
  const step      = isParticulier ? 2 : 3
  const total     = isParticulier ? 4 : 5
  const stepsList = isParticulier ? STEPS_PARTICULIER : STEPS_PRO
  const prevHref  = isParticulier ? '/inscription/etape-2' : '/inscription/etape-3'

  /* ── Formulaire ───────────────────────────────────────────────── */
  const [form, setForm] = useState({ titulaire: '', iban: '', ibanConfirm: '', bic: '' })
  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  /* ── Upload RIB ───────────────────────────────────────────────── */
  const [ribFile,   setRibFile]   = useState<File | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    if (!file) return
    setRibFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  /* ── Navigation ───────────────────────────────────────────────── */
  const handleContinue = () => {
    router.push('/inscription/etape-5')
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo}>OPUS</Link>
          <Link href={prevHref} className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour
          </Link>
        </div>

        <div className={styles.progressTrack}
          role="progressbar" aria-valuenow={step}
          aria-valuemin={1} aria-valuemax={total}>
          <div className={styles.progressFill}
            style={{ width: ready ? `${(step / total) * 100}%` : '0%' }}/>
        </div>
      </header>

      {/* ── CONTENU ──────────────────────────────────────────────── */}
      <main className={styles.main}>

        <p className={styles.stepLabel}>Étape {step} sur {total}</p>
        <h1 className={styles.pageTitle}>Coordonnées bancaires</h1>
        <p className={styles.pageSubtitle}>Renseigner vos informations bancaire</p>

        <div className={styles.layout}>

          {/* ── FORMULAIRE ─────────────────────────────────────── */}
          <div className={styles.card}>

            <div className={styles.fieldGrid}>

              {/* Titulaire */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label htmlFor="titulaire" className={styles.label}>
                  Nom du Titulaire du compte <span className={styles.required}>*</span>
                </label>
                <input
                  id="titulaire"
                  type="text"
                  className={styles.input}
                  value={form.titulaire}
                  onChange={set('titulaire')}
                  autoComplete="name"
                />
              </div>

              {/* IBAN */}
              <div className={styles.field}>
                <label htmlFor="iban" className={styles.label}>
                  IBAN <span className={styles.required}>*</span>
                </label>
                <input
                  id="iban"
                  type="text"
                  className={styles.input}
                  value={form.iban}
                  onChange={set('iban')}
                  placeholder="FR76 XXXX XXXX XXXX"
                  autoComplete="off"
                />
              </div>

              {/* Confirmer IBAN */}
              <div className={styles.field}>
                <label htmlFor="ibanConfirm" className={styles.label}>
                  Confirmer l'IBAN <span className={styles.required}>*</span>
                </label>
                <input
                  id="ibanConfirm"
                  type="text"
                  className={styles.input}
                  value={form.ibanConfirm}
                  onChange={set('ibanConfirm')}
                  placeholder="FR76 XXXX XXXX XXXX"
                  autoComplete="off"
                />
              </div>

              {/* BIC / SWIFT */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label htmlFor="bic" className={styles.label}>
                  Code BIC / SWIFT <span className={styles.required}>*</span>
                </label>
                <input
                  id="bic"
                  type="text"
                  className={styles.input}
                  value={form.bic}
                  onChange={set('bic')}
                  placeholder="Ex : BNPAFRPPXXX"
                  autoComplete="off"
                />
              </div>

              {/* Upload RIB */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.label}>Relevé d'Identité Bancaire (RIB)</span>
                <div
                  className={`${styles.uploadZone} ${dragging ? styles.dragging : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Zone de dépôt du RIB"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => handleFile(e.target.files?.[0] ?? null)}
                  />
                  <UploadIcon />
                  <p className={styles.uploadTitle}>Cliquez ou glissez votre fichier ici</p>
                  <p className={styles.uploadSub}>PDF, PNG ou JPEG (max 5 Mo)</p>
                  {ribFile && (
                    <p className={styles.uploadFileName}>{ribFile.name}</p>
                  )}
                </div>
              </div>

            </div>

            {/* Boutons */}
            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev}
                onClick={() => router.push(prevHref)}>
                Précédent
              </button>
              <button type="button" className={styles.btnNext}
                onClick={handleContinue}>
                Continuer
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── SIDEBAR STEPPER ──────────────────────────────── */}
          <aside className={styles.sidebar} aria-label="Progression">
            <p className={styles.sidebarTitle}>Étapes de l'inscription</p>

            <ol className={styles.stepsList}>
              {stepsList.map(s => (
                <li key={s.num}
                  className={`${styles.stepItem} ${styles[s.status]}`}>
                  <div className={styles.stepBadge}>
                    {s.status === 'done' ? <CheckIcon/> : s.num}
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
