'use client'

import { useState } from 'react'
import type { OpportuniteFormData } from '../page'
import { stepDetailsChantierSchema } from '@/lib/validations/opportunite'
import styles from './css/StepDetailsChantier.module.css'
import IconArrowRight from '@/components/icons/IconArrowRight'

const TYPES_TRAVAUX = [
  'Maçonnerie & Gros œuvre',
  'Charpente & Couverture',
  'Plomberie & Sanitaire',
  'Électricité',
  'Isolation & Thermique',
  'Menuiserie & Fenêtres',
  'Carrelage & Revêtements',
  'Peinture & Décoration',
  'Aménagement extérieur & Terrassement',
  'Démolition & Désamiantage',
  'Autre',
]

const DELAIS = [
  { value: 'urgent',   label: 'Urgent (< 1 mois)' },
  { value: '1-3',      label: '1 à 3 mois' },
  { value: '3-6',      label: '3 à 6 mois' },
  { value: '6+',       label: 'Plus de 6 mois' },
  { value: 'undefined',label: 'Non défini' },
]

type Errors = Partial<Record<'typesTravaux' | 'adresseChantier', string>>

interface Props {
  formData: OpportuniteFormData
  setFormData: React.Dispatch<React.SetStateAction<OpportuniteFormData>>
  onNext: () => void
  onPrev: () => void
}

export default function StepDetailsChantier({ formData, setFormData, onNext, onPrev }: Props) {
  const [errors, setErrors] = useState<Errors>({})

  const set = (key: keyof OpportuniteFormData) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value }))

  const validateField = (key: 'typesTravaux' | 'adresseChantier', value: string) => {
    const schemas = {
      typesTravaux:    { min: 1, msg: 'Type de travaux requis' },
      adresseChantier: { min: 1, msg: 'Adresse du chantier requise' },
    }
    const s = schemas[key]
    setErrors(prev => ({
      ...prev,
      [key]: value.length >= s.min ? undefined : s.msg,
    }))
  }

  // Adresse saisie à l'étape 2 (PRO seulement) — capturée au montage du composant
  const [initialAddress] = useState(formData.adresseChantier)

  const prefillAddress = () => {
    setFormData(prev => ({ ...prev, adresseChantier: initialAddress }))
    setErrors(prev => ({ ...prev, adresseChantier: undefined }))
  }

  const handleNext = () => {
    const result = stepDetailsChantierSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Errors
        newErrors[key] = issue.message
      }
      setErrors(newErrors)
      return
    }
    onNext()
  }

  const hasProAddress = formData.clientType === 'PRO' && formData.adresseChantier

  return (
    <div className={styles.card}>
      <div className={styles.fieldStack}>

        {/* Type de travaux */}
        <div className={styles.field}>
          <label htmlFor="typesTravaux" className={styles.label}>
            Type de travaux<span className={styles.required}>*</span>
          </label>
          <select
            id="typesTravaux"
            className={`${styles.select} ${!formData.typesTravaux ? styles.placeholder : ''} ${errors.typesTravaux ? styles.hasError : ''}`}
            value={formData.typesTravaux}
            onChange={set('typesTravaux')}
            onBlur={e => validateField('typesTravaux', e.target.value)}
            aria-describedby={errors.typesTravaux ? 'err-travaux' : undefined}
          >
            <option value="" disabled>Sélectionnez un type de travaux</option>
            {TYPES_TRAVAUX.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.typesTravaux && (
            <span id="err-travaux" className={styles.error}>{errors.typesTravaux}</span>
          )}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description <span className={styles.optional}>(Optionnel)</span>
          </label>
          <textarea
            id="description"
            className={styles.textarea}
            value={formData.description}
            onChange={set('description')}
            placeholder="Décrivez les travaux à réaliser..."
          />
        </div>

        {/* Délai */}
        <div className={styles.field}>
          <label htmlFor="delai" className={styles.label}>
            Délai souhaité <span className={styles.optional}>(Optionnel)</span>
          </label>
          <select
            id="delai"
            className={`${styles.select} ${!formData.delai ? styles.placeholder : ''}`}
            value={formData.delai}
            onChange={set('delai')}
          >
            <option value="">Non défini</option>
            {DELAIS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Adresse chantier */}
        <div className={styles.field}>
          <label htmlFor="adresseChantierStep3" className={styles.label}>
            Adresse du chantier<span className={styles.required}>*</span>
          </label>
          <input
            id="adresseChantierStep3"
            type="text"
            className={`${styles.input} ${errors.adresseChantier ? styles.hasError : ''}`}
            value={formData.adresseChantier}
            onChange={set('adresseChantier')}
            onBlur={e => validateField('adresseChantier', e.target.value)}
            placeholder="1 Rue des Bâtisseurs, Paris, 75001"
            aria-describedby={errors.adresseChantier ? 'err-addr-3' : undefined}
          />
          {formData.clientType === 'PRO' && initialAddress && formData.adresseChantier !== initialAddress && (
            <button
              type="button"
              className={styles.prefillLink}
              onClick={prefillAddress}
            >
              Utiliser l'adresse saisie précédemment
            </button>
          )}
          {errors.adresseChantier && (
            <span id="err-addr-3" className={styles.error}>{errors.adresseChantier}</span>
          )}
        </div>

      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.btnPrev} onClick={onPrev}>
          Précédent
        </button>
        <button type="button" className={styles.btnNext} onClick={handleNext}>
          Continuer
          <IconArrowRight />
        </button>
      </div>
    </div>
  )
}
