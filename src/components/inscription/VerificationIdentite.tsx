'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './VerificationIdentite.module.css'

/* ── Icône check ────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

/* ── Icône upload ────────────────────────────────────────────────── */
function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={styles.uploadIcon}>
      <rect x="4" y="4" width="28" height="28" rx="6" />
      <path d="M18 24V14M13 19l5-5 5 5" />
    </svg>
  )
}

/* ── Steps selon le profil (sans "Choix du profil") ────────────── */
const STEPS_PARTICULIER = [
  { num: 1, label: 'Informations personnelles',     status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Coordonnées bancaires (IBAN)',  status: 'done',     sub: 'Validé'   },
  { num: 3, label: "Vérification d'identité (KYC)", status: 'active',   sub: 'En cours' },
  { num: 4, label: 'Validation email & CGU',        status: 'inactive', sub: null       },
] as const

const STEPS_PRO = [
  { num: 1, label: 'Informations personnelles',     status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Vérification SIRET',            status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Coordonnées bancaires (IBAN)',  status: 'done',     sub: 'Validé'   },
  { num: 4, label: "Vérification d'identité (KYC)", status: 'active',   sub: 'En cours' },
  { num: 5, label: 'Validation email & CGU',        status: 'inactive', sub: null       },
] as const

const DOC_TYPES = [
  "Carte d'identité",
  'Passeport',
  'Titre de séjour',
  'Permis de conduire',
]

/* ── Composant principal ────────────────────────────────────────── */
export default function VerificationIdentite() {
  const router = useRouter()
  const [profile, setProfile] = useState<string | null>(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    setProfile(sessionStorage.getItem('opus_profile'))
    setReady(true)
  }, [])

  const isParticulier = profile === 'particulier'
  const step      = isParticulier ? 3 : 4
  const total     = isParticulier ? 4 : 5
  const stepsList = isParticulier ? STEPS_PARTICULIER : STEPS_PRO
  const prevHref  = '/inscription/etape-4'

  /* ── Formulaire ─────────────────────────────────────────────────── */
  const [docType, setDocType] = useState(DOC_TYPES[0])
  const [docNum,  setDocNum]  = useState('')

  /* ── Upload pièce d'identité ─────────────────────────────────────── */
  const [idFile,   setIdFile]   = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => { if (file) setIdFile(file) }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  /* ── Navigation ──────────────────────────────────────────────────── */
  const handleContinue = () => router.push('/inscription/etape-6')

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo}>OPUS</Link>
          <Link href={prevHref} className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </Link>
        </div>
        <div className={styles.progressTrack}
          role="progressbar" aria-valuenow={step}
          aria-valuemin={1} aria-valuemax={total}>
          <div className={styles.progressFill} style={{ width: ready ? `${(step / total) * 100}%` : '0%' }} />
        </div>
      </header>

      {/* CONTENU */}
      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {step} sur {total}</p>
        <h1 className={styles.pageTitle}>Vérification d'identité</h1>
        <p className={styles.pageSubtitle}>Veuillez télécharger vos documents justificatifs</p>

        <div className={styles.layout}>

          {/* FORMULAIRE */}
          <div className={styles.card}>
            <div className={styles.fieldStack}>

              {/* Type de document */}
              <div className={styles.field}>
                <label htmlFor="docType" className={styles.label}>
                  Type de document <span className={styles.required}>*</span>
                </label>
                <select
                  id="docType"
                  className={styles.select}
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                >
                  {DOC_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Numéro du document */}
              <div className={styles.field}>
                <label htmlFor="docNum" className={styles.label}>
                  Numéro du document <span className={styles.required}>*</span>
                </label>
                <input
                  id="docNum"
                  type="text"
                  className={styles.input}
                  value={docNum}
                  onChange={e => setDocNum(e.target.value)}
                  placeholder="Entrez le numéro"
                  autoComplete="off"
                />
              </div>

              {/* Upload pièce d'identité */}
              <div className={styles.field}>
                <span className={styles.label}>Pièce d'identité (Recto / Verso)</span>
                <div
                  className={`${styles.uploadZone} ${dragging ? styles.dragging : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                  aria-label="Zone de dépôt de la pièce d'identité"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => handleFile(e.target.files?.[0] ?? null)}
                  />
                  <UploadIcon />
                  <p className={styles.uploadTitle}>
                    Cliquez ou glissez votre pièce d'identité ici
                  </p>
                  <p className={styles.uploadSub}>
                    (Recto / Verso) — PDF, PNG ou JPEG (max 5 Mo)
                  </p>
                  {idFile && (
                    <p className={styles.uploadFileName}>{idFile.name}</p>
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
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* SIDEBAR STEPPER */}
          <aside className={styles.sidebar} aria-label="Progression">
            <p className={styles.sidebarTitle}>Étapes de l'inscription</p>
            <ol className={styles.stepsList}>
              {stepsList.map(s => (
                <li key={s.num}
                  className={`${styles.stepItem} ${styles[s.status]}`}>
                  <div className={styles.stepBadge}>
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
