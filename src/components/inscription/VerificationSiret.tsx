'use client'

/**
 * VerificationSiret.tsx — Étape 3/6
 *
 * LOGIQUE CONDITIONNELLE :
 *   - Affiché uniquement si sessionStorage.opus_profile !== 'particulier'
 *   - Si 'particulier', l'étape 2 redirige directement vers /inscription/etape-4
 *
 * SIMULATION INSEE :
 *   - Clic "Vérifier" → spinner 1.5s → bannière verte + champs pré-remplis
 *   - Bouton "Continuer" activé seulement après validation
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './VerificationSiret.module.css'

/* ── Constantes ─────────────────────────────────────────────────── */
const STEP        = 3
const TOTAL_STEPS = 6

/* ── Données simulées INSEE ─────────────────────────────────────── */
const MOCK_SIRET_DATA = {
  raisonSociale:      'MACONNERIE DURAND SARL',
  adresse:            '12 Rue des Bâtisseurs, 75011 Paris',
  codeApe:            '4399C — Maçonnerie générale',
  representant:       'Jean Durand',
  activeSince:        '2018',
}

/* ── Stepper ────────────────────────────────────────────────────── */
const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé' },
  { num: 2, label: 'Informations personnelles',    status: 'done',     sub: 'Validé' },
  { num: 3, label: 'Vérification SIRET',           status: 'active',   sub: 'En cours' },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'inactive', sub: null },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null },
] as const

/* ── Icône check ────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7l3 3 6-6"/>
    </svg>
  )
}

/* ── Composant principal ────────────────────────────────────────── */
export default function VerificationSiret() {
  const router = useRouter()

  /* État formulaire */
  const [siret,     setSiret]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [validated, setValidated] = useState(false)
  const [data,      setData]      = useState<typeof MOCK_SIRET_DATA | null>(null)
  const [error,     setError]     = useState('')

  /* ── Simulation appel INSEE ───────────────────────────────────── */
  const handleVerify = () => {
    if (siret.replace(/\s/g, '').length < 9) {
      setError('Veuillez saisir un numéro SIRET valide (14 chiffres).')
      return
    }
    setError('')
    setLoading(true)
    setValidated(false)
    setData(null)

    /* Simulation délai API */
    setTimeout(() => {
      setLoading(false)
      setValidated(true)
      setData(MOCK_SIRET_DATA)
    }, 1500)
  }

  /* ── Navigation ───────────────────────────────────────────────── */
  const handleContinue = () => {
    router.push('/inscription/etape-4')
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo}>OPUS</Link>
          <Link href="/inscription/etape-2" className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour
          </Link>
        </div>

        <div className={styles.progressTrack}
          role="progressbar" aria-valuenow={STEP}
          aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <div className={styles.progressFill}
            style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }}/>
        </div>
      </header>

      {/* ── CONTENU ──────────────────────────────────────────────── */}
      <main className={styles.main}>

        <p className={styles.stepLabel}>Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className={styles.pageTitle}>Vérification de votre entreprise</h1>
        <p className={styles.pageSubtitle}>
          Nous interrogeons la base INSEE pour pré-remplir votre fiche.
        </p>

        <div className={styles.layout}>

          {/* ── FORMULAIRE ─────────────────────────────────────── */}
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
                  onChange={e => setSiret(e.target.value)}
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
                {loading ? <span className={styles.spinner}/> : null}
                {loading ? 'Vérification…' : 'Vérifier'}
              </button>
            </div>

            {/* Message d'erreur */}
            {error && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>{error}</p>
            )}

            {/* ── Bannière succès ─────────────────────────────── */}
            {validated && data && (
              <div className={styles.successBanner} role="alert">
                <svg className={styles.successIcon} width="18" height="18"
                  viewBox="0 0 18 18" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1z"/>
                  <path d="M6 9l2 2 4-4"/>
                </svg>
                <div>
                  <p className={styles.successTitle}>✓ SIRET VALIDE</p>
                  <p className={styles.successSub}>
                    {data.raisonSociale} · Active depuis {data.activeSince}
                  </p>
                </div>
              </div>
            )}

            {/* ── Champs pré-remplis ──────────────────────────── */}
            <div className={styles.fieldGrid}>

              {/* Raison sociale */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Raison sociale</label>
                <div className={styles.inputReadonly}>
                  {data ? data.raisonSociale : ''}
                </div>
              </div>

              {/* Adresse */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Adresse du siège</label>
                <div className={styles.inputReadonly}>
                  {data ? data.adresse : ''}
                </div>
              </div>

              {/* Code APE */}
              <div className={styles.field}>
                <label className={styles.label}>Code APE / NAF</label>
                <div className={styles.inputReadonly}>
                  {data ? data.codeApe : ''}
                </div>
              </div>

              {/* Représentant légal */}
              <div className={styles.field}>
                <label className={styles.label}>
                  Représentant légal <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputReadonly}>
                  {data ? data.representant : ''}
                </div>
              </div>
            </div>

            {/* ── Boutons ─────────────────────────────────────── */}
            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev}
                onClick={() => router.push('/inscription/etape-2')}>
                Précédent
              </button>
              <button type="button" className={styles.btnNext}
                disabled={!validated}
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
              {STEPS_LIST.map(step => (
                <li key={step.num}
                  className={`${styles.stepItem} ${styles[step.status]}`}>
                  <div className={styles.stepBadge}>
                    {step.status === 'done' ? <CheckIcon/> : step.num}
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
