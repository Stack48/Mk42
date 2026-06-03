'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OpportuniteFormData } from '../page'
import { createOpportunite } from '@/lib/actions/opportunite'
import styles from './StepSoumettre.module.css'

const DELAI_LABELS: Record<string, string> = {
  urgent:    'Urgent (< 1 mois)',
  '1-3':     '1 à 3 mois',
  '3-6':     '3 à 6 mois',
  '6+':      'Plus de 6 mois',
  undefined: 'Non défini',
  '':        'Non défini',
}

interface Props {
  formData: OpportuniteFormData
  onPrev: () => void
}

export default function StepSoumettre({ formData, onPrev }: Props) {
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const isPro = formData.clientType === 'PRO'
  const clientLabel = isPro ? formData.clientRaisonSociale : `${formData.clientPrenom} ${formData.clientNom}`.trim()
  const delaiLabel = DELAI_LABELS[formData.delai] ?? 'Non défini'

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    const result = await createOpportunite(formData)
    if (result.success) {
      router.push(`/opportunites/${result.id}/confirmation`)
    } else {
      setSubmitError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.wrap}>
      {/* Recap */}
      <div className={styles.recapGrid}>
        {/* Card client */}
        <div className={styles.recapCard}>
          <p className={styles.recapTitle}>Le client</p>
          <div className={styles.recapList}>
            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>Type</span>
              <span className={isPro ? styles.badgePro : styles.badgePart}>
                {isPro ? 'Professionnel' : 'Particulier'}
              </span>
            </div>

            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>{isPro ? 'Raison sociale' : 'Nom'}</span>
              <span className={styles.recapValue}>{clientLabel || '—'}</span>
            </div>

            {isPro && formData.clientSiret && (
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>SIRET</span>
                <span className={styles.recapValueMono}>{formData.clientSiret}</span>
              </div>
            )}

            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>Téléphone</span>
              <span className={styles.recapValue}>{formData.clientTelephone || '—'}</span>
            </div>

            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>Email</span>
              <span className={styles.recapValue}>{formData.clientEmail || '—'}</span>
            </div>

            {formData.adresseChantier && (
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Adresse</span>
                <span className={styles.recapValue}>{formData.adresseChantier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card chantier */}
        <div className={styles.recapCard}>
          <p className={styles.recapTitle}>Le chantier</p>
          <div className={styles.recapList}>
            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>Type de travaux</span>
              <span className={styles.recapValue}>{formData.typesTravaux || '—'}</span>
            </div>

            <div className={styles.recapRow}>
              <span className={styles.recapLabel}>Délai souhaité</span>
              <span className={`${styles.badge} ${styles.badgeDelai}`}>{delaiLabel}</span>
            </div>

            {formData.adresseChantier && (
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Adresse</span>
                <span className={styles.recapValue}>{formData.adresseChantier}</span>
              </div>
            )}

            {formData.description && (
              <div className={styles.recapRow}>
                <span className={styles.recapLabel}>Description</span>
                <span className={styles.recapValueItalic}>{formData.description}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation + submit */}
      <div className={styles.confirmCard}>
        {submitError && (
          <div role="alert" style={{ marginBottom: 16, padding: '12px 14px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 14, color: '#B91C1C' }}>
            {submitError}
          </div>
        )}
        <div className={styles.checkboxRow}>
          <input
            id="confirmation"
            type="checkbox"
            className={styles.checkbox}
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            aria-label="Confirmation de l'exactitude des informations"
          />
          <label htmlFor="confirmation" className={styles.checkboxLabel}>
            Je confirme l'exactitude des informations renseignées.
          </label>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnPrev} onClick={onPrev}>
            Précédent
          </button>
          <button
            type="button"
            className={styles.btnSubmit}
            onClick={handleSubmit}
            disabled={!confirmed || isSubmitting}
            aria-disabled={!confirmed || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className={`${styles.spinner} ${!confirmed ? styles.spinnerDisabled : ''}`}
                  aria-hidden="true"
                />
                Soumission en cours…
              </>
            ) : (
              "Soumettre l'opportunité"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
