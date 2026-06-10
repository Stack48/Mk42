'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './VerificationSiret.module.css'
import type { Step3Data } from '../types'

const STEP        = 3
const TOTAL_STEPS = 6

const FORMES_JURIDIQUES = [
  { group: 'Sociétés commerciales', options: [
    'SARL – Société à Responsabilité Limitée',
    'EURL – Entreprise Unipersonnelle à Responsabilité Limitée',
    'SAS – Société par Actions Simplifiée',
    'SASU – Société par Actions Simplifiée Unipersonnelle',
    'SA – Société Anonyme',
    'SNC – Société en Nom Collectif',
    'SCS – Société en Commandite Simple',
    'SCA – Société en Commandite par Actions',
    'SE – Société Européenne',
  ]},
  { group: 'Entreprises individuelles', options: [
    'EI – Entreprise Individuelle',
    'Micro-entreprise / Auto-entrepreneur',
  ]},
  { group: 'Sociétés civiles', options: [
    'SC – Société Civile',
    'SCI – Société Civile Immobilière',
    'SCM – Société Civile de Moyens',
    'SCP – Société Civile Professionnelle',
  ]},
  { group: 'Professions libérales', options: [
    'SELARL – Société d\'Exercice Libéral à Responsabilité Limitée',
    'SELARLU – SELARL Unipersonnelle',
    'SELAS – Société d\'Exercice Libéral par Actions Simplifiée',
    'SELASU – SELAS Unipersonnelle',
    'SELCA – Société d\'Exercice Libéral en Commandite par Actions',
  ]},
  { group: 'Coopératives', options: [
    'SCOP – Société Coopérative de Production',
    'SCIC – Société Coopérative d\'Intérêt Collectif',
  ]},
  { group: 'Autres', options: [
    'GIE – Groupement d\'Intérêt Économique',
    'GEIE – Groupement Européen d\'Intérêt Économique',
    'Association loi 1901',
    'Fondation',
    'SEM – Société d\'Économie Mixte',
    'SPL – Société Publique Locale',
  ]},
] as const

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

interface Props {
  initialValues?: Partial<Step3Data>
  onNext: (data: Step3Data) => void
  onPrev: () => void
}

export default function VerificationSiret({ initialValues = {}, onNext, onPrev }: Props) {
  const [siret,     setSiret]     = useState(initialValues.siret ?? '')
  const [loading,   setLoading]   = useState(false)
  const [validated, setValidated] = useState(!!initialValues.siret)
  const [erreur,    setErreur]    = useState('')

  const [form, setForm] = useState({
    raisonSociale:     initialValues.raisonSociale     ?? '',
    adresseSiege:      initialValues.adresseSiege      ?? '',
    codeApe:           initialValues.codeApe           ?? '',
    representantLegal: initialValues.representantLegal ?? '',
    telephone:         initialValues.telephone         ?? '',
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

  const handleContinue = () => {
    onNext({
      siret:             siret.replace(/\s/g, ''),
      raisonSociale:     form.raisonSociale,
      adresseSiege:      form.adresseSiege,
      codeApe:           form.codeApe,
      representantLegal: form.representantLegal,
      telephone:         form.telephone,
    })
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
        <h1 className={styles.pageTitle}>Vérification de votre entreprise</h1>
        <p className={styles.pageSubtitle}>
          Renseignez le numéro SIRET puis complétez les informations de votre société.
        </p>

        <div className={styles.layout}>

          <div className={styles.card}>

            <div className={styles.siretRow}>
              <div className={styles.siretField}>
                <label htmlFor="siret" className={styles.label}>
                  Numéro SIRET <span className={styles.required}>*</span>
                </label>
                <input id="siret" type="text" className={styles.input} value={siret}
                  onChange={e => { setSiret(e.target.value); setValidated(false) }}
                  placeholder="Ex : 832 547 891 00012" maxLength={17} autoComplete="off" />
              </div>
              <button type="button" className={styles.btnVerify} onClick={handleVerify}
                disabled={loading || siret.trim() === ''}>
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? 'Vérification…' : 'Vérifier'}
              </button>
            </div>

            {erreur && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 14 }}>{erreur}</p>
            )}

            {validated && (
              <div className={styles.successBanner} role="alert">
                <svg className={styles.successIcon} width="18" height="18" viewBox="0 0 18 18"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1z" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
                <div>
                  <p className={styles.successTitle}>✓ FORMAT SIRET VALIDE</p>
                  <p className={styles.successSub}>Complétez les informations ci-dessous</p>
                </div>
              </div>
            )}

            {validated && (
              <div className={styles.fieldGrid}>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="raisonSociale" className={styles.label}>
                    Raison sociale <span className={styles.required}>*</span>
                  </label>
                  <select id="raisonSociale" className={styles.input}
                    value={form.raisonSociale}
                    onChange={e => setForm(prev => ({ ...prev, raisonSociale: e.target.value }))}>
                    <option value="">-- Sélectionnez une forme juridique --</option>
                    {FORMES_JURIDIQUES.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="adresseSiege" className={styles.label}>
                    Adresse du siège <span className={styles.required}>*</span>
                  </label>
                  <input id="adresseSiege" type="text" className={styles.input}
                    value={form.adresseSiege} onChange={set('adresseSiege')}
                    placeholder="Ex : 12 Rue des Bâtisseurs, 75011 Paris" autoComplete="street-address" />
                </div>

                <div className={styles.field}>
                  <label htmlFor="codeApe" className={styles.label}>Code APE / NAF</label>
                  <input id="codeApe" type="text" className={styles.input}
                    value={form.codeApe} onChange={set('codeApe')} placeholder="Ex : 4399C" />
                </div>

                <div className={styles.field}>
                  <label htmlFor="representantLegal" className={styles.label}>
                    Représentant légal <span className={styles.required}>*</span>
                  </label>
                  <input id="representantLegal" type="text" className={styles.input}
                    value={form.representantLegal} onChange={set('representantLegal')}
                    placeholder="Ex : Jean Durand" autoComplete="name" />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="telephone" className={styles.label}>
                    Téléphone <span className={styles.required}>*</span>
                  </label>
                  <input id="telephone" type="tel" className={styles.input}
                    value={form.telephone} onChange={set('telephone')}
                    placeholder="Ex : 01 23 45 67 89" autoComplete="tel" />
                </div>

              </div>
            )}

            <div className={styles.formFooter}>
              <button type="button" className={styles.btnPrev} onClick={onPrev}>
                Précédent
              </button>
              <button type="button" className={styles.btnNext}
                disabled={!validated} onClick={handleContinue}>
                Continuer
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <aside className={styles.sidebar} aria-label="Progression">
            <p className={styles.sidebarTitle}>Étapes de l'inscription</p>
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
