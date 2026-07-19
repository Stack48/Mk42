'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getEntrepriseById } from '@/lib/actions/entreprise.actions'
import ProgressBar from './_components/ProgressBar'
import StepperSidebar from './_components/StepperSidebar'
import StepVosInfos from './_components/StepVosInfos'
import StepInfosClient from './_components/StepInfosClient'
import StepChoixEntreprise from './_components/StepChoixEntreprise'
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
  entrepriseId: string
  entrepriseNom: string
  entrepriseSiret: string
}

const STEP_TITLES: Record<number, { label: string; title: string; subtitle: string }> = {
  1: {
    label: 'Étape 1 sur 5',
    title: 'Vos informations',
    subtitle: 'Vérifiez que votre profil est à jour avant de soumettre une opportunité.',
  },
  2: {
    label: 'Étape 2 sur 5',
    title: 'Proposer une opportunité',
    subtitle: 'Nous nous référons à la base INSEE pour pré-remplir votre fiche.',
  },
  3: {
    label: 'Étape 3 sur 5',
    title: "Choisir l'entreprise",
    subtitle: "Sélectionnez l'entreprise à qui vous souhaitez soumettre cette opportunité.",
  },
  4: {
    label: 'Étape 4 sur 5',
    title: 'Détails du chantier',
    subtitle: "Décrivez les travaux pour aider l'entreprise à évaluer l'opportunité.",
  },
  5: {
    label: 'Étape 5 sur 5',
    title: "Soumettre l'opportunité",
    subtitle: 'Vérifiez les informations avant de soumettre.',
  },
}

export default function NouvelleopportunitePage() {
  return (
    <Suspense>
      <NouvelleopportuniteWizard />
    </Suspense>
  )
}

function NouvelleopportuniteWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
    entrepriseId: '',
    entrepriseNom: '',
    entrepriseSiret: '',
  })

  // Pré-remplit l'étape "Choisir l'entreprise" quand on arrive depuis la
  // fiche entreprise de Discovery (lien "Proposer une opportunité").
  useEffect(() => {
    const entrepriseId = searchParams.get('entrepriseId')
    if (!entrepriseId) return
    getEntrepriseById(entrepriseId).then(entreprise => {
      if (!entreprise) return
      setFormData(prev => ({
        ...prev,
        entrepriseId: entreprise.id,
        entrepriseNom: entreprise.raisonSociale,
        entrepriseSiret: entreprise.siret,
      }))
    })
  }, [searchParams])

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
        <ProgressBar step={step} totalSteps={5} />
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
              <StepChoixEntreprise
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {step === 4 && (
              <StepDetailsChantier
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {step === 5 && (
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
