'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from './_components/ProgressBar'
import StepperSidebar from './_components/StepperSidebar'
import StepVosInfos from './_components/StepVosInfos'
import StepInfosClient from './_components/StepInfosClient'
import StepDetailsChantier from './_components/StepDetailsChantier'
import StepSoumettre from './_components/StepSoumettre'
import styles from './page.module.css'
import IconChevronLeft from '@/components/icons/IconChevronLeft'

export type OpportuniteFormData = {
  clientType: 'PRO' | 'PARTICULIER'
  clientSiret: string
  clientRaisonSociale: string
  clientLastname: string
  clientFirstname: string
  clientPhoneNumber: string
  clientEmail: string
  adresseChantier: string
  typesTravaux: string
  description: string
  delai: string
}

const STEP_TITLES: Record<number, { label: string; title: string; subtitle: string }> = {
  1: {
    label: 'Étape 1 sur 4',
    title: 'Vos informations',
    subtitle: 'Vérifiez que votre profil est à jour avant de soumettre une opportunité.',
  },
  2: {
    label: 'Étape 2 sur 4',
    title: 'Proposer une opportunité',
    subtitle: 'Nous nous référons à la base INSEE pour pré-remplir votre fiche.',
  },
  3: {
    label: 'Étape 3 sur 4',
    title: 'Détails du chantier',
    subtitle: 'Décrivez les travaux pour aider l\'entreprise à évaluer l\'opportunité.',
  },
  4: {
    label: 'Étape 4 sur 4',
    title: "Soumettre l'opportunité",
    subtitle: 'Vérifiez les informations avant de soumettre.',
  },
}

export default function NouvelleopportunitePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<OpportuniteFormData>({
    clientType: 'PARTICULIER',
    clientSiret: '',
    clientRaisonSociale: '',
    clientLastname: '',
    clientFirstname: '',
    clientPhoneNumber: '',
    clientEmail: '',
    adresseChantier: '',
    typesTravaux: '',
    description: '',
    delai: '',
  })

  const goNext = () => {
    setStep(s => {
      const next = s + 1
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return next
    })
  }

  const goPrev = () => {
    setStep(s => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return s - 1
    })
  }

  const meta = STEP_TITLES[step]

  return (
    <>
      <div className={styles.innerHeader}>
        <div className={styles.headerBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.back()}
          >
            <IconChevronLeft />
            Retour
          </button>
        </div>
        <ProgressBar step={step} totalSteps={4} />
      </div>

      <div className={styles.content}>
        <p className={styles.stepLabel}>{meta.label}</p>
        <h1 className={styles.pageTitle}>{meta.title}</h1>
        <p className={styles.pageSubtitle}>{meta.subtitle}</p>

        <div className={styles.layout}>
          <div key={step} className={styles.stepAnim}>
            {step === 1 && (
              <StepVosInfos onNext={goNext} />
            )}
            {step === 2 && (
              <StepInfosClient
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {step === 3 && (
              <StepDetailsChantier
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {step === 4 && (
              <StepSoumettre
                formData={formData}
                onPrev={goPrev}
              />
            )}
          </div>

          <StepperSidebar currentStep={step} />
        </div>
      </div>
    </>
  )
}
