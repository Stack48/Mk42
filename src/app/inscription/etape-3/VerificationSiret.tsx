'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './VerificationSiret.module.css'

const STEP        = 3
const TOTAL_STEPS = 6

const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',           status: 'active',   sub: 'En cours' },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'inactive', sub: null       },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

export default function VerificationSiret() {
  const router = useRouter()

  useEffect(() => {
    const profil = sessionStorage.getItem('opus_profile')
    if (profil === 'particulier') router.replace('/inscription/etape-4')
  }, [router])

  const [siret,      setSiret]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [validated,  setValidated]  = useState(false)
  const [erreur,     setErreur]     = useState('')
  const [chargement, setChargement] = useState(false)

  const [form, setForm] = useState({
    raisonSociale:    '',
    adresseSiege:     '',
    codeApe:          '',
    representantLegal:'',
    telephone:        '',
  })

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleVerify = () => {
    const digits = siret.replace(/\s/g, '')
    if (!/^\d{14}$/.test(digits)) {
      setErreur('Veuillez saisir un numéro SIRET valide (14 chiffres).')
      return
    }
    setErreur('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setValidated(true)
    }, 600)
  }

  const handleContinue = async () => {
    setChargement(true)
    setErreur('')

    try {
      const profil = sessionStorage.getItem('opus_profile') ?? 'entreprise'
      const endpoint = profil === 'professionnel'
        ? '/api/inscription/apporteur'
        : '/api/inscription/entreprise'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: siret.replace(/\s/g, ''), ...form }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.error?.fieldErrors
          ? Object.values(data.error.fieldErrors).flat().join(', ')
          : (data.error ?? 'Erreur serveur')
        setErreur(msg)
        return
      }

      if (data.apporteurId) sessionStorage.setItem('opus_apporteur_id', data.apporteurId)
      if (data.entrepriseId) sessionStorage.setItem('opus_entreprise_id', data.entrepriseId)

      router.push('/inscription/etape-4')
    } catch {
      setErreur('Une erreur inattendue est survenue. Veuillez réessayer.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo}>OPUS</Link>
          <Link href="/inscription/etape-2" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </Link>
        </div>
        <div className={styles.progressTrack}
          role="progressbar" aria-valuenow={STEP}
          aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <div className={styles.progressFill}
            style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className={styles.pageTitle}>Vérification de votre entreprise</h1>
        <p className={styles.pageSubtitle}>
          Renseignez le numéro SIRET puis complétez les informations de votre société.
        </p>

        <div className={styles.layout}>

          <div className={styles.card}>

            {/* Ligne SIRET + Vérifier */}
            <div className={styles.siretRow}>
              <div className={styles.siretField}>
                <label htmlFor="siret" className={styles.label}>
                  Numéro SIRET <span className={styles.required}>*</span>
                </label>
                <input
                  id="siret"
                  type="text"
                  className={styles.input}
                  value={siret}
                  onChange={e => { setSiret(e.target.value); setValidated(false) }}
                  placeholder="Ex : 832 547 891 00012"
                  maxLength={17}
                  autoComplete="off"
                />
              </div>

              <button
                type="button"
                className={styles.btnVerify}
                onClick={handleVerify}
                disabled={loading || siret.trim() === ''}
              >
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? 'Vérification…' : 'Vérifier'}
              </button>
            </div>

            {erreur && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>{erreur}</p>
            )}

            {/* Bannière succès */}
            {validated && (
              <div className={styles.successBanner} role="alert">
                <svg className={styles.successIcon} width="18" height="18"
                  viewBox="0 0 18 18" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1z" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
                <div>
                  <p className={styles.successTitle}>✓ FORMAT SIRET VALIDE</p>
                  <p className={styles.successSub}>Complétez les informations ci-dessous</p>
                </div>
              </div>
            )}

            {/* Champs à remplir — visibles après validation SIRET */}
            {validated && (
              <div className={styles.fieldGrid}>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="raisonSociale" className={styles.label}>
                    Raison sociale <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="raisonSociale"
                    type="text"
                    className={styles.input}
                    value={form.raisonSociale}
                    onChange={set('raisonSociale')}
                    placeholder="Ex : MAÇONNERIE DURAND SARL"
                    autoComplete="organization"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="adresseSiege" className={styles.label}>
                    Adresse du siège <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="adresseSiege"
                    type="text"
                    className={styles.input}
                    value={form.adresseSiege}
                    onChange={set('adresseSiege')}
                    placeholder="Ex : 12 Rue des Bâtisseurs, 75011 Paris"
                    autoComplete="street-address"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="codeApe" className={styles.label}>Code APE / NAF</label>
                  <input
                    id="codeApe"
                    type="text"
                    className={styles.input}
                    value={form.codeApe}
                    onChange={set('codeApe')}
                    placeholder="Ex : 4399C"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="representantLegal" className={styles.label}>
                    Représentant légal <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="representantLegal"
                    type="text"
                    className={styles.input}
                    value={form.representantLegal}
                    onChange={set('representantLegal')}
                    placeholder="Ex : Jean Durand"
                    autoComplete="name"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="telephone" className={styles.label}>
                    Téléphone <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    className={styles.input}
                    value={form.telephone}
                    onChange={set('telephone')}
                    placeholder="Ex : 01 23 45 67 89"
                    autoComplete="tel"
                  />
                </div>

              </div>
            )}

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev}
                onClick={() => router.push('/inscription/etape-2')}>
                Précédent
              </button>
              <button
                type="button"
                className={styles.btnNext}
                disabled={!validated || chargement}
                onClick={handleContinue}
              >
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
          </div>

          <aside className={styles.sidebar} aria-label="Progression">
            <p className={styles.sidebarTitle}>Étapes de l'inscription</p>
            <ol className={styles.stepsList}>
              {STEPS_LIST.map(step => (
                <li key={step.num}
                  className={`${styles.stepItem} ${styles[step.status]}`}>
                  <div className={styles.stepBadge}>
                    {step.status === 'done' ? <CheckIcon /> : step.num}
                  </div>
                  <div className={styles.stepContent}>
                    <span className={styles.stepName}>{step.label}</span>
                    {step.sub && (
                      <span className={`${styles.stepSubLabel} ${
                        step.status === 'done'   ? styles.validated  :
                        step.status === 'active' ? styles.inProgress : ''
                      }`}>
                        {step.sub}
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
