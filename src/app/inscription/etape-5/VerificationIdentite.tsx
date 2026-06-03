'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './VerificationIdentite.module.css'

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

const STEPS_PRO = [
  { num: 1, label: 'Choix du profil',               status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',     status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',            status: 'done',     sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)',  status: 'done',     sub: 'Validé'   },
  { num: 5, label: "Vérification d'identité (KYC)", status: 'active',   sub: 'En cours' },
  { num: 6, label: 'Validation email & CGU',        status: 'inactive', sub: null       },
] as const

const DOC_TYPES = ["Carte d'identité", 'Passeport', 'Titre de séjour', 'Permis de conduire']

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

async function uploadDocument(file: File, type: 'KYC_KBIS' | 'KYC_IDENTITE'): Promise<void> {
  const resUrl = await fetch('/api/documents/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomFichier: file.name, contentType: file.type }),
  })
  const { url, key } = await resUrl.json()
  if (!resUrl.ok) throw new Error('Erreur génération URL')

  const resS3 = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  if (!resS3.ok) throw new Error('Erreur upload S3')

  const resDoc = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, urlS3: key, nomFichier: file.name }),
  })
  if (!resDoc.ok) throw new Error('Erreur enregistrement')
}

export default function VerificationIdentite() {
  const router = useRouter()

  const step      = 5
  const total     = 6
  const stepsList = STEPS_PRO
  const prevHref  = '/inscription/etape-4'

  const [docType,  setDocType]  = useState(DOC_TYPES[0])
  const [docNum,   setDocNum]   = useState('')

  const [kbisFile,     setKbisFile]     = useState<File | null>(null)
  const [kbisStatus,   setKbisStatus]   = useState<UploadStatus>('idle')
  const [idFile,       setIdFile]       = useState<File | null>(null)
  const [idStatus,     setIdStatus]     = useState<UploadStatus>('idle')
  const [draggingKbis, setDraggingKbis] = useState(false)
  const [draggingId,   setDraggingId]   = useState(false)
  const [erreur,       setErreur]       = useState('')
  const [chargement,   setChargement]   = useState(false)

  const kbisRef = useRef<HTMLInputElement>(null)
  const idRef   = useRef<HTMLInputElement>(null)

  const handleKbisFile = async (file: File) => {
    setKbisFile(file)
    setKbisStatus('uploading')
    try {
      await uploadDocument(file, 'KYC_KBIS')
      setKbisStatus('done')
    } catch {
      setKbisStatus('error')
    }
  }

  const handleIdFile = async (file: File) => {
    setIdFile(file)
    setIdStatus('uploading')
    try {
      await uploadDocument(file, 'KYC_IDENTITE')
      setIdStatus('done')
    } catch {
      setIdStatus('error')
    }
  }

  const handleContinue = () => {
    if (kbisStatus === 'uploading' || idStatus === 'uploading') return
    router.push('/inscription/etape-6')
  }

  const statusLabel = (status: UploadStatus, file: File | null) => {
    if (status === 'uploading') return <span style={{ fontSize: 12, color: '#6B7280' }}>Chargement…</span>
    if (status === 'done')      return <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 500 }}>✓ {file?.name}</span>
    if (status === 'error')     return <span style={{ fontSize: 12, color: '#DC2626' }}>Erreur — réessayer</span>
    return null
  }

  return (
    <div className={styles.page}>

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
          <div className={styles.progressFill} style={{ width: `${(step / total) * 100}%` }} />
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {step} sur {total}</p>
        <h1 className={styles.pageTitle}>Vérification d&apos;identité</h1>
        <p className={styles.pageSubtitle}>Veuillez télécharger vos documents justificatifs</p>

        <div className={styles.layout}>

          <div className={styles.card}>
            <div className={styles.fieldStack}>

              {/* K-Bis (entreprise) */}
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
                  onDrop={e => { e.preventDefault(); setDraggingKbis(false); const f = e.dataTransfer.files[0]; if (f) handleKbisFile(f) }}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && kbisRef.current?.click()}
                  aria-label="Zone de dépôt du K-Bis"
                >
                  <input ref={kbisRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleKbisFile(f) }} />
                  <UploadIcon />
                  <p className={styles.uploadTitle}>Cliquez ou glissez votre K-Bis ici</p>
                  <p className={styles.uploadSub}>PDF, PNG ou JPEG (max 5 Mo)</p>
                  {statusLabel(kbisStatus, kbisFile)}
                </div>
              </div>

              {/* Type de document identité */}
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

              {/* Numéro du document */}
              <div className={styles.field}>
                <label htmlFor="docNum" className={styles.label}>
                  Numéro du document <span className={styles.required}>*</span>
                </label>
                <input id="docNum" type="text" className={styles.input}
                  value={docNum} onChange={e => setDocNum(e.target.value)}
                  placeholder="Entrez le numéro" autoComplete="off" />
              </div>

              {/* Pièce d'identité */}
              <div className={styles.field}>
                <span className={styles.label}>
                  Pièce d&apos;identité (Recto / Verso) <span className={styles.required}>*</span>
                </span>
                <div
                  className={`${styles.uploadZone} ${draggingId ? styles.dragging : ''}`}
                  onClick={() => idRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDraggingId(true) }}
                  onDragLeave={() => setDraggingId(false)}
                  onDrop={e => { e.preventDefault(); setDraggingId(false); const f = e.dataTransfer.files[0]; if (f) handleIdFile(f) }}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && idRef.current?.click()}
                  aria-label="Zone de dépôt de la pièce d'identité"
                >
                  <input ref={idRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleIdFile(f) }} />
                  <UploadIcon />
                  <p className={styles.uploadTitle}>
                    Cliquez ou glissez votre pièce d&apos;identité ici
                  </p>
                  <p className={styles.uploadSub}>(Recto / Verso) — PDF, PNG ou JPEG (max 5 Mo)</p>
                  {statusLabel(idStatus, idFile)}
                </div>
              </div>

            </div>

            {erreur && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>{erreur}</p>
            )}

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev}
                onClick={() => router.push(prevHref)}>
                Précédent
              </button>
              <button type="button" className={styles.btnNext}
                onClick={handleContinue}
                disabled={chargement || kbisStatus === 'uploading' || idStatus === 'uploading'}>
                {chargement ? 'Chargement…' : (
                  <>
                    Continuer
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            <button type="button"
              style={{ display: 'block', margin: '8px auto 0', fontSize: 13, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => router.push('/inscription/etape-6')}>
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
