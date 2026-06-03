'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './CoordonneesBancaires.module.css'

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

export default function CoordonneesBancaires() {
  const router = useRouter()
  const [profil, setProfil] = useState<string>('entreprise')
  const [ready,  setReady]  = useState(false)

  useEffect(() => {
    setProfil(sessionStorage.getItem('opus_profile') ?? 'entreprise')
    setReady(true)
  }, [])

  const step      = 4
  const total     = 6
  const stepsList = useMemo(
    () => profil === 'particulier' ? STEPS_SANS_SIRET : STEPS_AVEC_SIRET,
    [profil]
  )
  const prevHref  = profil === 'particulier' ? '/inscription/etape-2' : '/inscription/etape-3'

  const [form, setForm] = useState({ titulaire: '', iban: '', ibanConfirm: '', bic: '' })
  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const [ribFile,    setRibFile]    = useState<File | null>(null)
  const [dragging,   setDragging]   = useState(false)
  const [erreur,     setErreur]     = useState('')
  const [chargement, setChargement] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => { if (file) setRibFile(file) }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  const handleContinue = async () => {
    if (form.iban && form.iban !== form.ibanConfirm) {
      setErreur("Les deux IBAN ne correspondent pas.")
      return
    }

    setChargement(true)
    setErreur('')

    try {
      if (ribFile) {
        const resUrl = await fetch('/api/documents/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nomFichier: ribFile.name, contentType: ribFile.type }),
        })
        const { url, key } = await resUrl.json()
        if (!resUrl.ok) throw new Error('Erreur génération URL')

        await fetch(url, { method: 'PUT', body: ribFile, headers: { 'Content-Type': ribFile.type } })

        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'RIB', urlS3: key, nomFichier: ribFile.name }),
        })
      }

      const res = await fetch('/api/inscription/banque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomTitulaireIban: form.titulaire,
          iban:             form.iban,
          bic:              form.bic,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        const msg = data.error && typeof data.error === 'object'
          ? Object.values(data.error).flat().join(', ')
          : (data.error ?? 'Erreur serveur')
        setErreur(msg)
        return
      }

      router.push('/inscription/etape-5')
    } catch {
      setErreur('Une erreur inattendue est survenue.')
    } finally {
      setChargement(false)
    }
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
          <div className={styles.progressFill}
            style={{ width: ready ? `${(step / total) * 100}%` : '0%' }} />
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {step} sur {total}</p>
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => handleFile(e.target.files?.[0] ?? null)}
                  />
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
              <button type="button" className={styles.btnPrev}
                onClick={() => router.push(prevHref)}>
                Précédent
              </button>
              <button type="button" className={styles.btnNext}
                onClick={handleContinue} disabled={chargement}>
                {chargement ? 'Enregistrement…' : (
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
              onClick={() => router.push('/inscription/etape-5')}>
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
