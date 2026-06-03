'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import styles from './ValidationEmailCGU.module.css'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
      stroke="#4648D4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="18" height="14" rx="2" />
      <path d="M2 7l9 6 9-6" />
    </svg>
  )
}

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

const STEPS_AVEC_SIRET = [
  { num: 1, label: 'Choix du profil',              status: 'done',   sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'done',   sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',           status: 'done',   sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'done',   sub: 'Validé'   },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'done',   sub: 'Validé'   },
  { num: 6, label: 'Validation email & CGU',       status: 'active', sub: 'En cours' },
] as const

const STEPS_SANS_SIRET = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',           status: 'inactive', sub: null       },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'done',     sub: 'Validé'   },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'done',     sub: 'Validé'   },
  { num: 6, label: 'Validation email & CGU',       status: 'active',   sub: 'En cours' },
] as const

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
    label: "S'abonner à la Newsletter (Optionnel)",
    sub: 'Recevez des conseils comptables et des mises à jour produit.',
    required: false,
  },
] as const

export default function ValidationEmailCGU() {
  const router = useRouter()
  const [profil, setProfil] = useState<string>('entreprise')
  const [ready,  setReady]  = useState(false)

  useEffect(() => {
    setProfil(sessionStorage.getItem('opus_profile') ?? 'entreprise')
    setReady(true)
  }, [])

  const step      = 6
  const total     = 6
  const stepsList = useMemo(
    () => profil === 'particulier' ? STEPS_SANS_SIRET : STEPS_AVEC_SIRET,
    [profil]
  )
  const prevHref  = '/inscription/etape-5'

  const [checks, setChecks] = useState<Record<string, boolean>>({
    cgu: false, privacy: false, cookies: false, newsletter: false,
  })
  const toggleCheck = (id: string) =>
    setChecks(prev => ({ ...prev, [id]: !prev[id] }))

  const requiredChecked = CGU_ITEMS
    .filter(c => c.required)
    .every(c => checks[c.id])

  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [emailError,  setEmailError]  = useState('')

  const handleSendLink = async () => {
    setEmailStatus('loading')
    setEmailError('')
    try {
      const res = await fetch('/api/inscription/verify-email', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur inconnue')
      }
      setEmailStatus('sent')
    } catch (err: unknown) {
      setEmailStatus('error')
      setEmailError(err instanceof Error ? err.message : "Impossible d'envoyer l'email.")
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
          <div className={styles.progressFill} style={{ width: ready ? `${(step / total) * 100}%` : '0%' }} />
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.stepLabel}>Étape {step} sur {total}</p>
        <h1 className={styles.pageTitle}>Validation Email &amp; CGU</h1>
        <p className={styles.pageSubtitle}>
          Acceptez nos conditions puis vérifiez votre adresse email
        </p>

        <div className={styles.layout}>

          <div className={styles.card}>

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

            <div className={styles.divider} />

            {/* Section Email */}
            <div className={styles.otpSection}>
              <div className={styles.otpHeader}>
                <MailIcon />
                <h2 className={styles.otpTitle}>Vérification de votre email</h2>
              </div>

              {emailStatus !== 'sent' ? (
                <>
                  <p className={styles.otpDesc}>
                    Cliquez sur le bouton ci-dessous pour recevoir un lien de vérification par email.
                    Le lien est valable 24h.
                  </p>

                  <button
                    type="button"
                    className={styles.btnSubmit}
                    onClick={handleSendLink}
                    disabled={!requiredChecked || emailStatus === 'loading'}
                    aria-disabled={!requiredChecked || emailStatus === 'loading'}
                    style={{ marginTop: 16 }}
                  >
                    {emailStatus === 'loading' ? 'Envoi en cours…' : 'Envoyer le lien de vérification'}
                  </button>

                  {!requiredChecked && (
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
                      Acceptez les conditions obligatoires pour continuer
                    </p>
                  )}

                  {emailStatus === 'error' && (
                    <p style={{ fontSize: 13, color: '#DC2626', marginTop: 8, textAlign: 'center' }}>{emailError}</p>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#16A34A', marginBottom: 8 }}>
                    ✓ Email envoyé !
                  </p>
                  <p className={styles.otpDesc}>
                    Consultez votre boîte mail et <strong>cliquez sur le lien</strong> pour vérifier votre adresse.
                    Vous serez automatiquement redirigé vers le tableau de bord.
                  </p>
                  <div className={styles.resendRow}>
                    <button type="button" className={styles.resendBtn} onClick={handleSendLink}>
                      <RefreshIcon />
                      Renvoyer le lien
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                onClick={() => router.push('/dashboard')}
                disabled={emailStatus !== 'sent'}
                aria-disabled={emailStatus !== 'sent'}
              >
                Accéder au tableau de bord
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <SignOutButton redirectUrl="/connexion">
                <button type="button" style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Se déconnecter
                </button>
              </SignOutButton>
            </div>

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
