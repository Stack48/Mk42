'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs'
import { SignOutButton } from '@clerk/nextjs'
import styles from './ValidationEmailCGU.module.css'
import type { WizardFormData } from '../types'

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

const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',               status: 'done',   sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',     status: 'done',   sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',            status: 'done',   sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)',  status: 'done',   sub: 'Validé'   },
  { num: 5, label: "Vérification d'identité (KYC)", status: 'done',   sub: 'Validé'   },
  { num: 6, label: 'Validation email & CGU',        status: 'active', sub: 'En cours' },
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

const STEP        = 6
const TOTAL_STEPS = 6

async function uploadDocument(file: File, type: string): Promise<void> {
  const resUrl = await fetch('/api/documents/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomFichier: file.name, contentType: file.type }),
  })
  const { url, key } = await resUrl.json()
  if (!resUrl.ok) throw new Error('Erreur génération URL de téléversement')

  const resS3 = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  if (!resS3.ok) throw new Error('Erreur lors du téléversement du fichier')

  const resDoc = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, urlS3: key, nomFichier: file.name }),
  })
  if (!resDoc.ok) throw new Error('Erreur enregistrement du document')
}

interface Props {
  formData: WizardFormData
  onPrev:   () => void
}

export default function ValidationEmailCGU({ formData, onPrev }: Props) {
  const router     = useRouter()
  const { signIn } = useSignIn()

  const [checks, setChecks] = useState<Record<string, boolean>>({
    cgu: false, privacy: false, cookies: false, newsletter: false,
  })
  const toggleCheck = (id: string) =>
    setChecks(prev => ({ ...prev, [id]: !prev[id] }))

  const requiredChecked = CGU_ITEMS
    .filter(c => c.required)
    .every(c => checks[c.id])

  const [submitStatus,  setSubmitStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [loadingStep,   setLoadingStep]   = useState('')
  const [erreur,        setErreur]        = useState('')

  const handleSubmit = async () => {
    if (!signIn) return
    setSubmitStatus('loading')
    setErreur('')

    try {
      // 1. Créer le compte
      setLoadingStep('Création du compte…')
      const accountRes = await fetch('/api/inscription/compte', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom:     formData.step2.prenom,
          nom:        formData.step2.nom,
          email:      formData.step2.email,
          motDePasse: formData.step2.motDePasse,
          profil:     formData.profil,
          telephone:  formData.step2.telephone,
          fonction:   formData.step2.fonction || undefined,
        }),
      })
      const accountData = await accountRes.json()
      if (!accountRes.ok) throw new Error(accountData.error ?? 'Erreur lors de la création du compte')

      // 2. Authentifier via ticket admin — contourne la 2FA pour l'inscription
      setLoadingStep('Authentification…')

      const { error: createError } = await signIn.create({
        strategy: 'ticket',
        ticket:   accountData.ticket as string,
      })
      if (createError) throw new Error(createError.message)

      if (signIn.status !== 'complete') {
        throw new Error(`Authentification incomplète (status: ${signIn.status ?? 'inconnu'})`)
      }

      const { error: finalizeError } = await signIn.finalize()
      if (finalizeError) throw new Error(finalizeError.message)

      // 3. Enregistrer les données entreprise / apporteur
      if (formData.profil !== 'particulier' && formData.step3.siret) {
        setLoadingStep('Enregistrement de l\'entreprise…')
        const endpoint = formData.profil === 'professionnel'
          ? '/api/inscription/apporteur'
          : '/api/inscription/entreprise'
        const companyRes = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siret: formData.step3.siret, ...formData.step3 }),
        })
        if (!companyRes.ok) {
          const d = await companyRes.json()
          const msg = d.error?.fieldErrors
            ? Object.values(d.error.fieldErrors).flat().join(', ')
            : (d.error ?? 'Erreur enregistrement entreprise')
          throw new Error(msg)
        }
      }

      // 4. Enregistrer les coordonnées bancaires
      if (formData.step4.iban) {
        setLoadingStep('Enregistrement des coordonnées bancaires…')
        const bankRes = await fetch('/api/inscription/banque', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomTitulaireIban: formData.step4.titulaire,
            iban:             formData.step4.iban,
            bic:              formData.step4.bic,
          }),
        })
        if (!bankRes.ok) {
          const d = await bankRes.json()
          throw new Error(d.error ?? 'Erreur enregistrement bancaire')
        }
      }

      // 5. Téléverser le RIB
      if (formData.step4.ribFile) {
        setLoadingStep('Téléversement du RIB…')
        await uploadDocument(formData.step4.ribFile, 'RIB')
      }

      // 6. Téléverser les documents KYC
      if (formData.step5.kbisFile) {
        setLoadingStep('Téléversement du K-Bis…')
        await uploadDocument(formData.step5.kbisFile, 'KYC_KBIS')
      }
      if (formData.step5.idFile) {
        setLoadingStep('Téléversement de la pièce d\'identité…')
        await uploadDocument(formData.step5.idFile, 'KYC_IDENTITE')
      }

      // 7. Envoyer l'email de vérification
      setLoadingStep('Envoi de l\'email de vérification…')
      const emailRes = await fetch('/api/inscription/verify-email', { method: 'POST' })
      if (!emailRes.ok) {
        const d = await emailRes.json()
        throw new Error(d.error ?? 'Erreur lors de l\'envoi de l\'email')
      }

      setSubmitStatus('success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
      setErreur(msg)
      setSubmitStatus('error')
    } finally {
      setLoadingStep('')
    }
  }

  const isLoading = submitStatus === 'loading'
  const isSuccess = submitStatus === 'success'

  return (
    <div className={styles.page}>

      <header className={styles.header}>
        <div className={styles.headerBar}>
          <Link href="/" className={styles.logo}>OPUS</Link>
          <button type="button" className={styles.backLink} onClick={onPrev} disabled={isLoading}
            aria-label="Retour">
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
        <h1 className={styles.pageTitle}>Validation Email &amp; CGU</h1>
        <p className={styles.pageSubtitle}>
          Acceptez nos conditions puis finalisez votre inscription
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
                      <input type="checkbox" className={styles.checkBox}
                        checked={checks[item.id]}
                        onChange={() => toggleCheck(item.id)}
                        disabled={isLoading || isSuccess}
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

              {!isSuccess ? (
                <>
                  <p className={styles.otpDesc}>
                    Cliquez sur le bouton ci-dessous pour finaliser votre inscription et recevoir un lien de vérification par email. Le lien est valable 24h.
                  </p>

                  {isLoading && loadingStep && (
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
                      {loadingStep}
                    </p>
                  )}

                  <button
                    type="button"
                    className={styles.btnSubmit}
                    onClick={handleSubmit}
                    disabled={!requiredChecked || isLoading}
                    aria-disabled={!requiredChecked || isLoading}
                    style={{ marginTop: 16 }}
                  >
                    {isLoading ? 'Finalisation en cours…' : 'Envoyer le lien de vérification'}
                  </button>

                  {!requiredChecked && !isLoading && (
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>
                      Acceptez les conditions obligatoires pour continuer
                    </p>
                  )}

                  {submitStatus === 'error' && (
                    <p style={{ fontSize: 13, color: '#DC2626', marginTop: 8, textAlign: 'center' }}>
                      {erreur}
                    </p>
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
                    <button type="button" className={styles.resendBtn} onClick={handleSubmit}>
                      <RefreshIcon />
                      Renvoyer le lien
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev} onClick={onPrev} disabled={isLoading}>
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
                disabled={!isSuccess}
                aria-disabled={!isSuccess}
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
