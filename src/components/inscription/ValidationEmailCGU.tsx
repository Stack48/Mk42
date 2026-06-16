'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './ValidationEmailCGU.module.css'

/* ── Icône check (sidebar) ──────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

/* ── Icône email ────────────────────────────────────────────────── */
function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      stroke="#4648D4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="18" height="14" rx="2" />
      <path d="M2 7l9 6 9-6" />
    </svg>
  )
}

/* ── Icône refresh ──────────────────────────────────────────────── */
function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2v4H9" />
      <path d="M1 12v-4h4" />
      <path d="M11.5 5A5 5 0 0 0 3 5.5M2.5 9A5 5 0 0 0 11 8.5" />
    </svg>
  )
}

/* ── Steps selon le profil (sans "Choix du profil") ────────────── */
const STEPS_PARTICULIER = [
  { num: 1, label: 'Informations personnelles',     status: 'done',   sub: 'Validé'   },
  { num: 2, label: 'Coordonnées bancaires (IBAN)',  status: 'done',   sub: 'Validé'   },
  { num: 3, label: "Vérification d'identité (KYC)", status: 'done',   sub: 'Validé'   },
  { num: 4, label: 'Validation email & CGU',        status: 'active', sub: 'En cours' },
] as const

const STEPS_PRO = [
  { num: 1, label: 'Informations personnelles',     status: 'done',   sub: 'Validé'   },
  { num: 2, label: 'Vérification SIRET',            status: 'done',   sub: 'Validé'   },
  { num: 3, label: 'Coordonnées bancaires (IBAN)',  status: 'done',   sub: 'Validé'   },
  { num: 4, label: "Vérification d'identité (KYC)", status: 'done',   sub: 'Validé'   },
  { num: 5, label: 'Validation email & CGU',        status: 'active', sub: 'En cours' },
] as const

/* ── Cases CGU ───────────────────────────────────────────────────── */
const CGU_ITEMS = [
  {
    id: 'cgu',
    label: "J'accepte les Conditions Générales d'Utilisation",
    sub: "Obligatoire pour l'utilisation des services OPUS Accounting.",
    required: true,
  },
  {
    id: 'privacy',
    label: "J'accepte la Politique de Confidentialité",
    sub: 'Comprendre comment nous protégeons vos données financières.',
    required: true,
  },
  {
    id: 'cookies',
    label: "J'accepte la Politique relative aux Cookies",
    sub: "Gestion de l'expérience utilisateur et analytique.",
    required: true,
  },
  {
    id: 'newsletter',
    label: 'S\'abonner à la Newsletter (Optionnel)',
    sub: 'Recevez des conseils comptables et des mises à jour produit.',
    required: false,
  },
] as const

const OTP_LENGTH = 6

/* ── Composant principal ────────────────────────────────────────── */
export default function ValidationEmailCGU() {
  const router = useRouter()
  const [profile, setProfile] = useState<string | null>(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    setProfile(sessionStorage.getItem('opus_profile'))
    setReady(true)
  }, [])

  const isParticulier = profile === 'particulier'
  const step      = isParticulier ? 4 : 5
  const total     = isParticulier ? 4 : 5
  const stepsList = isParticulier ? STEPS_PARTICULIER : STEPS_PRO
  const prevHref  = '/inscription/etape-5'

  /* ── OTP ─────────────────────────────────────────────────────── */
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const focusBox = (i: number) => inputRefs.current[i]?.focus()

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < OTP_LENGTH - 1) focusBox(i + 1)
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) focusBox(i - 1)
    if (e.key === 'ArrowLeft'  && i > 0)            focusBox(i - 1)
    if (e.key === 'ArrowRight' && i < OTP_LENGTH-1) focusBox(i + 1)
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = [...otp]
    digits.split('').forEach((d, i) => { next[i] = d })
    setOtp(next)
    focusBox(Math.min(digits.length, OTP_LENGTH - 1))
  }

  /* ── CGU ─────────────────────────────────────────────────────── */
  const [checks, setChecks] = useState<Record<string, boolean>>({
    cgu: false, privacy: false, cookies: false, newsletter: false,
  })
  const toggleCheck = (id: string) =>
    setChecks(prev => ({ ...prev, [id]: !prev[id] }))

  const requiredChecked = CGU_ITEMS
    .filter(c => c.required)
    .every(c => checks[c.id])

  const otpComplete = otp.every(d => d !== '')
  const canSubmit   = otpComplete && requiredChecked

  /* ── Navigation ──────────────────────────────────────────────── */
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return
    router.push('/inscription/compte')
  }, [canSubmit, router])

  /* ── Render ──────────────────────────────────────────────────── */
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
        <h1 className={styles.pageTitle}>Validation Email &amp; CGU</h1>
        <p className={styles.pageSubtitle}>
          Confirmez votre adresse email et acceptez nos conditions d'utilisation
        </p>

        <div className={styles.layout}>

          {/* ── CARD PRINCIPALE ── */}
          <div className={styles.card}>

            {/* Section OTP */}
            <div className={styles.otpSection}>
              <div className={styles.otpHeader}>
                <MailIcon />
                <h2 className={styles.otpTitle}>Code de vérification</h2>
              </div>
              <p className={styles.otpDesc}>
                Saisissez le code à 6 chiffres envoyé à votre adresse email professionnelle.
              </p>

              <div className={styles.otpRow} onPaste={handleOtpPaste}>
                {otp.map((val, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    className={styles.otpBox}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    aria-label={`Chiffre ${i + 1} du code`}
                  />
                ))}
              </div>

              <div className={styles.resendRow}>
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={() => setOtp(Array(OTP_LENGTH).fill(''))}
                >
                  <RefreshIcon />
                  Renvoyer le code
                </button>
              </div>
            </div>

            {/* Séparateur */}
            <div className={styles.divider} />

            {/* Section CGU */}
            <div className={styles.cguSection}>
              <h2 className={styles.cguTitle}>Conditions &amp; Confidentialité</h2>
              <ul className={styles.cguList} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {CGU_ITEMS.map(item => (
                  <li key={item.id}>
                    <label className={styles.checkItem}>
                      <input
                        type="checkbox"
                        className={styles.checkBox}
                        checked={checks[item.id]}
                        onChange={() => toggleCheck(item.id)}
                      />
                      <div className={styles.checkContent}>
                        <span className={styles.checkLabel}>
                          {item.label}
                          {item.required && <span className={styles.required}> *</span>}
                        </span>
                        <p className={styles.checkSub}>{item.sub}</p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Boutons */}
            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev}
                onClick={() => router.push(prevHref)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Précédent
              </button>
              <button
                type="button"
                className={styles.btnSubmit}
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
              >
                Terminer l'inscription
              </button>
            </div>
          </div>

          {/* ── SIDEBAR STEPPER ── */}
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
