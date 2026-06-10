'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import styles from './CoordonneesBancaires.module.css'
import type { Step4Data } from '../types'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

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

const STEPS_AVEC_SIRET = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',           status: 'done',     sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'active',   sub: 'En cours' },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

const STEPS_SANS_SIRET = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',           status: 'inactive', sub: null       },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'active',   sub: 'En cours' },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

const STEP        = 4
const TOTAL_STEPS = 6

interface Props {
  initialValues?: Partial<Step4Data>
  profil: string
  onNext: (data: Step4Data) => void
  onPrev: () => void
}

export default function CoordonneesBancaires({ initialValues = {}, profil, onNext, onPrev }: Props) {
  const stepsList = profil === 'particulier' ? STEPS_SANS_SIRET : STEPS_AVEC_SIRET

  const [form, setForm] = useState({
    titulaire:   initialValues.titulaire   ?? '',
    iban:        initialValues.iban        ?? '',
    ibanConfirm: initialValues.ibanConfirm ?? '',
    bic:         initialValues.bic         ?? '',
  })
  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const [ribFile,    setRibFile]    = useState<File | null>(initialValues.ribFile ?? null)
  const [dragging,   setDragging]   = useState(false)
  const [erreur,     setErreur]     = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => { if (file) setRibFile(file) }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  const handleContinue = () => {
    if (form.iban && form.iban !== form.ibanConfirm) {
      setErreur("Les deux IBAN ne correspondent pas.")
      return
    }
    onNext({ ...form, ribFile })
  }

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo}>OPUS</Link>
          <button type="button" className={styles.backLink} onClick={onPrev} aria-label="Retour">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </button>
        </div>
        <div className={styles.progressTrack} role="progressbar" aria-valuenow={STEP}
          aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <div className={styles.progressFill} style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className={styles.pageTitle}>Coordonnées bancaires</h1>
        <p className={styles.pageSubtitle}>Renseignez vos informations bancaires</p>

        <div className={styles.layout}>

          <div className={styles.card}>
            <div className={styles.fieldGrid}>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label htmlFor="titulaire" className={styles.label}>
                  Nom du Titulaire du compte <span className={styles.required}>*</span>
                </label>
                <input id="titulaire" type="text" className={styles.input}
                  value={form.titulaire} onChange={set('titulaire')} autoComplete="name" />
              </div>

              <div className={styles.field}>
                <label htmlFor="iban" className={styles.label}>
                  IBAN <span className={styles.required}>*</span>
                </label>
                <input id="iban" type="text" className={styles.input}
                  value={form.iban} onChange={set('iban')}
                  placeholder="FR76 XXXX XXXX XXXX" autoComplete="off" />
              </div>

              <div className={styles.field}>
                <label htmlFor="ibanConfirm" className={styles.label}>
                  Confirmer l&apos;IBAN <span className={styles.required}>*</span>
                </label>
                <input id="ibanConfirm" type="text" className={styles.input}
                  value={form.ibanConfirm} onChange={set('ibanConfirm')}
                  placeholder="FR76 XXXX XXXX XXXX" autoComplete="off" />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label htmlFor="bic" className={styles.label}>
                  Code BIC / SWIFT <span className={styles.required}>*</span>
                </label>
                <input id="bic" type="text" className={styles.input}
                  value={form.bic} onChange={set('bic')}
                  placeholder="Ex : BNPAFRPPXXX" autoComplete="off" />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.label}>Relevé d&apos;Identité Bancaire (RIB)</span>
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
                  <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                  <UploadIcon />
                  <p className={styles.uploadTitle}>Cliquez ou glissez votre fichier ici</p>
                  <p className={styles.uploadSub}>PDF, PNG ou JPEG (max 5 Mo)</p>
                  {ribFile && <p className={styles.uploadFileName}>{ribFile.name}</p>}
                </div>
              </div>

            </div>

            {erreur && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>{erreur}</p>
            )}

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev} onClick={onPrev}>
                Précédent
              </button>
              <button type="button" className={styles.btnNext} onClick={handleContinue}>
                Continuer
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <button type="button"
              style={{ display: 'block', margin: '8px auto 0', fontSize: 13, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => onNext({ ...form, ribFile: null })}>
              Passer cette étape
            </button>
          </div>

          <aside className={styles.sidebar} aria-label="Progression">
            <p className={styles.sidebarTitle}>Étapes de l&apos;inscription</p>
            <ol className={styles.stepsList}>
              {stepsList.map(s => (
                <li key={s.num} className={`${styles.stepItem} ${styles[s.status]}`}>
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
