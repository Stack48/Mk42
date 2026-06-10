'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import styles from './VerificationIdentite.module.css'
import type { Step5Data } from '../types'

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

const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',               status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',     status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',            status: 'done',     sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)',  status: 'done',     sub: 'Validé'   },
  { num: 5, label: "Vérification d'identité (KYC)", status: 'active',   sub: 'En cours' },
  { num: 6, label: 'Validation email & CGU',        status: 'inactive', sub: null       },
] as const

const DOC_TYPES = ["Carte d'identité", 'Passeport', 'Titre de séjour', 'Permis de conduire']

const STEP        = 5
const TOTAL_STEPS = 6

interface Props {
  initialValues?: Partial<Step5Data>
  onNext: (data: Step5Data) => void
  onPrev: () => void
}

export default function VerificationIdentite({ initialValues = {}, onNext, onPrev }: Props) {
  const [docType,  setDocType]  = useState(initialValues.docType  ?? DOC_TYPES[0])
  const [docNum,   setDocNum]   = useState(initialValues.docNum   ?? '')
  const [kbisFile, setKbisFile] = useState<File | null>(initialValues.kbisFile ?? null)
  const [idFile,   setIdFile]   = useState<File | null>(initialValues.idFile   ?? null)

  const [draggingKbis, setDraggingKbis] = useState(false)
  const [draggingId,   setDraggingId]   = useState(false)

  const kbisRef = useRef<HTMLInputElement>(null)
  const idRef   = useRef<HTMLInputElement>(null)

  const handleContinue = () => {
    onNext({ docType, docNum, kbisFile, idFile })
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
        <h1 className={styles.pageTitle}>Vérification d&apos;identité</h1>
        <p className={styles.pageSubtitle}>Veuillez télécharger vos documents justificatifs</p>

        <div className={styles.layout}>

          <div className={styles.card}>
            <div className={styles.fieldStack}>

              <div className={styles.field}>
                <span className={styles.label}>
                  Extrait K-Bis <span className={styles.required}>*</span>
                </span>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                  Document officiel d&apos;immatriculation (moins de 3 mois)
                </p>
                <div
                  className={`${styles.uploadZone} ${draggingKbis ? styles.dragging : ''}`}
                  onClick={() => kbisRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDraggingKbis(true) }}
                  onDragLeave={() => setDraggingKbis(false)}
                  onDrop={e => {
                    e.preventDefault(); setDraggingKbis(false)
                    const f = e.dataTransfer.files[0]; if (f) setKbisFile(f)
                  }}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && kbisRef.current?.click()}
                  aria-label="Zone de dépôt du K-Bis"
                >
                  <input ref={kbisRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setKbisFile(f) }} />
                  <UploadIcon />
                  <p className={styles.uploadTitle}>Cliquez ou glissez votre K-Bis ici</p>
                  <p className={styles.uploadSub}>PDF, PNG ou JPEG (max 5 Mo)</p>
                  {kbisFile && (
                    <p style={{ fontSize: 12, color: '#16A34A', fontWeight: 500 }}>✓ {kbisFile.name}</p>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="docType" className={styles.label}>
                  Type de document d&apos;identité <span className={styles.required}>*</span>
                </label>
                <select id="docType" className={styles.select}
                  value={docType} onChange={e => setDocType(e.target.value)}>
                  {DOC_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="docNum" className={styles.label}>
                  Numéro du document <span className={styles.required}>*</span>
                </label>
                <input id="docNum" type="text" className={styles.input}
                  value={docNum} onChange={e => setDocNum(e.target.value)}
                  placeholder="Entrez le numéro" autoComplete="off" />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>
                  Pièce d&apos;identité (Recto / Verso) <span className={styles.required}>*</span>
                </span>
                <div
                  className={`${styles.uploadZone} ${draggingId ? styles.dragging : ''}`}
                  onClick={() => idRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDraggingId(true) }}
                  onDragLeave={() => setDraggingId(false)}
                  onDrop={e => {
                    e.preventDefault(); setDraggingId(false)
                    const f = e.dataTransfer.files[0]; if (f) setIdFile(f)
                  }}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && idRef.current?.click()}
                  aria-label="Zone de dépôt de la pièce d'identité"
                >
                  <input ref={idRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setIdFile(f) }} />
                  <UploadIcon />
                  <p className={styles.uploadTitle}>
                    Cliquez ou glissez votre pièce d&apos;identité ici
                  </p>
                  <p className={styles.uploadSub}>(Recto / Verso) — PDF, PNG ou JPEG (max 5 Mo)</p>
                  {idFile && (
                    <p style={{ fontSize: 12, color: '#16A34A', fontWeight: 500 }}>✓ {idFile.name}</p>
                  )}
                </div>
              </div>

            </div>

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
              onClick={() => onNext({ docType, docNum, kbisFile: null, idFile: null })}>
              Passer cette étape
            </button>
          </div>

          <aside className={styles.sidebar} aria-label="Progression">
            <p className={styles.sidebarTitle}>Étapes de l&apos;inscription</p>
            <ol className={styles.stepsList}>
              {STEPS_LIST.map(s => (
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
