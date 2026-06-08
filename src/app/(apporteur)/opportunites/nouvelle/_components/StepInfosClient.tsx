'use client'

import { useState } from 'react'
import { z } from 'zod'
import type { OpportuniteFormData } from '../page'
import {
  stepInfosClientProSchema,
  stepInfosClientParticulierSchema,
} from '@/lib/validations/opportunite'
import styles from './css/StepInfosClient.module.css'

interface InseeResult {
  raisonSociale: string
  activeSince: string
}

type Errors = Partial<Record<keyof OpportuniteFormData, string>>

interface Props {
  formData: OpportuniteFormData
  setFormData: React.Dispatch<React.SetStateAction<OpportuniteFormData>>
  onNext: () => void
  onPrev: () => void
}

export default function StepInfosClient({ formData, setFormData, onNext, onPrev }: Props) {
  const [verifyLoading,  setVerifyLoading]  = useState(false)
  const [verifySuccess,  setVerifySuccess]  = useState<InseeResult | null>(null)
  const [verifyDegraded, setVerifyDegraded] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const set = (key: keyof OpportuniteFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value }))

  const validateField = (key: keyof OpportuniteFormData, value: string) => {
    const schema =
      formData.clientType === 'PRO'
        ? stepInfosClientProSchema
        : stepInfosClientParticulierSchema

    const fieldSchemas: Record<string, z.ZodTypeAny> = {
      clientSiret:        z.string().min(14, 'SIRET invalide (14 chiffres requis)'),
      clientRaisonSociale: z.string().min(1, 'Raison sociale requise'),
      clientLastname:     z.string().min(1, 'Nom requis'),
      clientFirstname:    z.string().min(1, 'Prénom requis'),
      clientPhoneNumber:  z.string().min(10, 'Numéro de téléphone invalide'),
      clientEmail:        z.string().email('Adresse email invalide'),
      adresseChantier:   formData.clientType === 'PARTICULIER'
        ? z.string().min(1, 'Adresse du chantier requise')
        : z.string().optional(),
    }

    const fieldSchema = fieldSchemas[key]
    if (!fieldSchema) return

    const result = fieldSchema.safeParse(value)
    setErrors(prev => ({
      ...prev,
      [key]: result.success ? undefined : result.error.issues[0]?.message,
    }))
  }

  const changeType = (type: 'PRO' | 'PARTICULIER') => {
    setFormData(prev => ({
      ...prev,
      clientType: type,
      clientSiret: '',
      clientRaisonSociale: '',
      clientLastname: '',
      clientFirstname: '',
      clientPhoneNumber: '',
      clientEmail: '',
      adresseChantier: '',
    }))
    setVerifySuccess(null)
    setVerifyDegraded(false)
    setErrors({})
  }

  const handleVerify = async () => {
    const raw = formData.clientSiret.replace(/\s/g, '')
    if (raw.length < 14) {
      setErrors(prev => ({ ...prev, clientSiret: 'SIRET invalide (14 chiffres requis)' }))
      return
    }

    setVerifyLoading(true)
    setVerifySuccess(null)
    setVerifyDegraded(false)
    setErrors(prev => ({ ...prev, clientSiret: undefined }))

    try {
      const ctrl = new AbortController()
      const timerId = setTimeout(() => ctrl.abort(), 4000)

      const resp = await fetch(
        `https://api.annuaire-entreprises.data.gouv.fr/api/v3/unite_legale/${raw}`,
        { signal: ctrl.signal }
      )
      clearTimeout(timerId)

      if (!resp.ok) throw new Error('not_found')

      const json = await resp.json()
      const raison = json.personne_morale_attributs?.raison_sociale
        ?? json.nom_complet
        ?? raw
      const dateCreation: string = json.date_creation ?? ''
      const year = dateCreation.slice(0, 4) || '—'

      setVerifySuccess({ raisonSociale: raison, activeSince: year })
      setFormData(prev => ({ ...prev, clientRaisonSociale: raison }))
    } catch {
      setVerifyDegraded(true)
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleNext = () => {
    const schema =
      formData.clientType === 'PRO'
        ? stepInfosClientProSchema
        : stepInfosClientParticulierSchema

    const result = schema.safeParse(formData)
    if (!result.success) {
      const newErrors: Errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof OpportuniteFormData
        newErrors[key] = issue.message
      }
      setErrors(newErrors)
      return
    }
    onNext()
  }

  const isPro = formData.clientType === 'PRO'

  return (
    <div className={styles.card}>
      {/* Toggle Professionnel / Particulier */}
      <div className={styles.toggleSection}>
        <p className={styles.toggleLabel}>Vous êtes un...</p>
        <div
          className={styles.toggleGroup}
          role="radiogroup"
          aria-label="Type de client"
        >
          {(['PARTICULIER', 'PRO'] as const).map(type => {
            const checked = formData.clientType === type
            return (
              <label key={type} className={styles.radioOption}>
                <div
                  className={`${styles.radioCircle} ${checked ? styles.checked : ''}`}
                  role="radio"
                  aria-checked={checked}
                  tabIndex={0}
                  onClick={() => changeType(type)}
                  onKeyDown={e => e.key === 'Enter' || e.key === ' ' ? changeType(type) : undefined}
                >
                  {checked && <div className={styles.radioDot} />}
                </div>
                {type === 'PARTICULIER' ? 'Particulier' : 'Professionnel'}
              </label>
            )
          })}
        </div>
      </div>

      <div className={styles.fieldStack}>
        {isPro ? (
          <>
            {/* SIRET */}
            <div className={styles.field}>
              <label htmlFor="clientSiret" className={styles.label}>
                Numéro SIRET de l'entreprise<span className={styles.required}>*</span>
              </label>
              <div className={styles.siretRow}>
                <div className={styles.siretField}>
                  <input
                    id="clientSiret"
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    className={`${styles.input} ${styles.mono} ${errors.clientSiret ? styles.hasError : ''}`}
                    value={formData.clientSiret}
                    onChange={set('clientSiret')}
                    onBlur={e => validateField('clientSiret', e.target.value)}
                    placeholder="Ex : 83254789100012"
                    disabled={verifyLoading}
                    aria-describedby={errors.clientSiret ? 'err-siret' : undefined}
                  />
                </div>
                {!verifyDegraded && (
                  <button
                    type="button"
                    className={styles.btnVerify}
                    onClick={handleVerify}
                    disabled={verifyLoading || formData.clientSiret.trim().length < 14}
                    aria-label="Vérifier le SIRET"
                  >
                    {verifyLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
                    {verifyLoading ? 'Vérification…' : 'Vérifier'}
                  </button>
                )}
              </div>
              {errors.clientSiret && (
                <span id="err-siret" className={styles.error}>{errors.clientSiret}</span>
              )}
              {verifyDegraded && (
                <span className={styles.degradedNote}>Saisie manuelle activée (service INSEE indisponible)</span>
              )}
            </div>

            {/* Bannière succès */}
            {verifySuccess && (
              <div className={styles.successBanner} role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" />
                  <path d="M5 8l2 2 4-4" />
                </svg>
                <div>
                  <p className={styles.successTitle}>✓ SIRET VALIDE</p>
                  <p className={styles.successSub}>
                    {verifySuccess.raisonSociale} · Active depuis {verifySuccess.activeSince}
                  </p>
                </div>
              </div>
            )}

            {/* Téléphone */}
            <div className={styles.field}>
              <label htmlFor="clientPhoneNumber" className={styles.label}>
                Téléphone<span className={styles.required}>*</span>
              </label>
              <input
                id="clientPhoneNumber"
                type="tel"
                className={`${styles.input} ${errors.clientPhoneNumber ? styles.hasError : ''}`}
                value={formData.clientPhoneNumber}
                onChange={set('clientPhoneNumber')}
                onBlur={e => validateField('clientPhoneNumber', e.target.value)}
                placeholder="06 00 00 00 00"
                aria-describedby={errors.clientPhoneNumber ? 'err-tel' : undefined}
              />
              {errors.clientPhoneNumber && (
                <span id="err-tel" className={styles.error}>{errors.clientPhoneNumber}</span>
              )}
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="clientEmail" className={styles.label}>
                Email<span className={styles.required}>*</span>
              </label>
              <input
                id="clientEmail"
                type="email"
                className={`${styles.input} ${errors.clientEmail ? styles.hasError : ''}`}
                value={formData.clientEmail}
                onChange={set('clientEmail')}
                onBlur={e => validateField('clientEmail', e.target.value)}
                placeholder="contact@entreprise.fr"
                aria-describedby={errors.clientEmail ? 'err-email' : undefined}
              />
              {errors.clientEmail && (
                <span id="err-email" className={styles.error}>{errors.clientEmail}</span>
              )}
            </div>

            {/* Adresse chantier (facultatif pour PRO) */}
            <div className={styles.field}>
              <label htmlFor="adresseChantier" className={styles.label}>
                Adresse du chantier <span className={styles.optional}>(Facultatif)</span>
              </label>
              <input
                id="adresseChantier"
                type="text"
                className={styles.input}
                value={formData.adresseChantier}
                onChange={set('adresseChantier')}
                placeholder="1 Rue des Bâtisseurs, Paris, 75001"
              />
            </div>
          </>
        ) : (
          <>
            {/* Nom */}
            <div className={styles.field}>
              <label htmlFor="clientLastname" className={styles.label}>
                Nom<span className={styles.required}>*</span>
              </label>
              <input
                id="clientLastname"
                type="text"
                className={`${styles.input} ${errors.clientLastname ? styles.hasError : ''}`}
                value={formData.clientLastname}
                onChange={set('clientLastname')}
                onBlur={e => validateField('clientLastname', e.target.value)}
                autoComplete="family-name"
                aria-describedby={errors.clientLastname ? 'err-nom' : undefined}
              />
              {errors.clientLastname && (
                <span id="err-nom" className={styles.error}>{errors.clientLastname}</span>
              )}
            </div>

            {/* Prénom */}
            <div className={styles.field}>
              <label htmlFor="clientFirstname" className={styles.label}>
                Prénom<span className={styles.required}>*</span>
              </label>
              <input
                id="clientFirstname"
                type="text"
                className={`${styles.input} ${errors.clientFirstname ? styles.hasError : ''}`}
                value={formData.clientFirstname}
                onChange={set('clientFirstname')}
                onBlur={e => validateField('clientFirstname', e.target.value)}
                autoComplete="given-name"
                aria-describedby={errors.clientFirstname ? 'err-prenom' : undefined}
              />
              {errors.clientFirstname && (
                <span id="err-prenom" className={styles.error}>{errors.clientFirstname}</span>
              )}
            </div>

            {/* Téléphone */}
            <div className={styles.field}>
              <label htmlFor="clientPhoneNumber" className={styles.label}>
                Téléphone<span className={styles.required}>*</span>
              </label>
              <input
                id="clientPhoneNumber"
                type="tel"
                className={`${styles.input} ${errors.clientPhoneNumber ? styles.hasError : ''}`}
                value={formData.clientPhoneNumber}
                onChange={set('clientPhoneNumber')}
                onBlur={e => validateField('clientPhoneNumber', e.target.value)}
                placeholder="06 00 00 00 00"
                aria-describedby={errors.clientPhoneNumber ? 'err-tel' : undefined}
              />
              {errors.clientPhoneNumber && (
                <span id="err-tel" className={styles.error}>{errors.clientPhoneNumber}</span>
              )}
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="clientEmail" className={styles.label}>
                Email<span className={styles.required}>*</span>
              </label>
              <input
                id="clientEmail"
                type="email"
                className={`${styles.input} ${errors.clientEmail ? styles.hasError : ''}`}
                value={formData.clientEmail}
                onChange={set('clientEmail')}
                onBlur={e => validateField('clientEmail', e.target.value)}
                placeholder="client@exemple.fr"
                aria-describedby={errors.clientEmail ? 'err-email' : undefined}
              />
              {errors.clientEmail && (
                <span id="err-email" className={styles.error}>{errors.clientEmail}</span>
              )}
            </div>

            {/* Adresse chantier (obligatoire pour PARTICULIER) */}
            <div className={styles.field}>
              <label htmlFor="adresseChantier" className={styles.label}>
                Adresse du chantier<span className={styles.required}>*</span>
              </label>
              <input
                id="adresseChantier"
                type="text"
                className={`${styles.input} ${errors.adresseChantier ? styles.hasError : ''}`}
                value={formData.adresseChantier}
                onChange={set('adresseChantier')}
                onBlur={e => validateField('adresseChantier', e.target.value)}
                placeholder="1 Rue des Bâtisseurs, Paris, 75001"
                aria-describedby={errors.adresseChantier ? 'err-adresse' : undefined}
              />
              {errors.adresseChantier && (
                <span id="err-adresse" className={styles.error}>{errors.adresseChantier}</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.btnPrev} onClick={onPrev}>
          Précédent
        </button>
        <button type="button" className={styles.btnNext} onClick={handleNext}>
          Continuer
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
