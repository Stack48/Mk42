'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ProfileSelection from './ProfileSelection'
import InformationsPersonnelles from './steps/InformationsPersonnelles'
import VerificationSiret from './steps/VerificationSiret'
import CoordonneesBancaires from './steps/CoordonneesBancaires'
import VerificationIdentite from './steps/VerificationIdentite'
import ValidationEmailCGU from './steps/ValidationEmailCGU'
import {
  type WizardFormData,
  type ProfilId,
  type Step2Data,
  type Step3Data,
  type Step4Data,
  type Step5Data,
  EMPTY_WIZARD_DATA,
} from './types'

export default function InscriptionWizard() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const step         = Math.max(1, parseInt(searchParams.get('step') ?? '1', 10))

  const [formData, setFormData] = useState<WizardFormData>(() => ({
    ...EMPTY_WIZARD_DATA,
    profil: (typeof window !== 'undefined'
      ? (sessionStorage.getItem('opus_profile') as ProfilId | null)
      : null),
  }))

  const navigate = useCallback((n: number) => {
    router.push(n <= 1 ? '/inscription' : `/inscription?step=${n}`)
  }, [router])

  const goNext = useCallback(() => {
    const next = step === 2 && formData.profil === 'particulier' ? 4 : step + 1
    navigate(next)
  }, [step, formData.profil, navigate])

  const goPrev = useCallback(() => {
    const prev = step === 4 && formData.profil === 'particulier' ? 2 : step - 1
    navigate(prev)
  }, [step, formData.profil, navigate])

  const updateStep = useCallback(<K extends keyof WizardFormData>(
    key: K,
    data: WizardFormData[K],
  ) => {
    setFormData(prev => ({ ...prev, [key]: data }))
  }, [])

  const handleSelectProfil = useCallback((profil: ProfilId) => {
    sessionStorage.setItem('opus_profile', profil)
    setFormData(prev => ({ ...prev, profil }))
    router.push('/inscription?step=2')
  }, [router])

  switch (step) {
    case 1:
      return <ProfileSelection onSelectProfil={handleSelectProfil} />

    case 2:
      return (
        <InformationsPersonnelles
          initialValues={formData.step2}
          onNext={(data: Step2Data) => { updateStep('step2', data); goNext() }}
          onPrev={goPrev}
        />
      )

    case 3:
      return (
        <VerificationSiret
          initialValues={formData.step3}
          onNext={(data: Step3Data) => { updateStep('step3', data); goNext() }}
          onPrev={goPrev}
        />
      )

    case 4:
      return (
        <CoordonneesBancaires
          initialValues={formData.step4}
          profil={formData.profil ?? 'entreprise'}
          onNext={(data: Step4Data) => { updateStep('step4', data); goNext() }}
          onPrev={goPrev}
        />
      )

    case 5:
      return (
        <VerificationIdentite
          initialValues={formData.step5}
          onNext={(data: Step5Data) => { updateStep('step5', data); goNext() }}
          onPrev={goPrev}
        />
      )

    case 6:
      return (
        <ValidationEmailCGU
          formData={formData}
          onPrev={goPrev}
        />
      )

    default:
      return <ProfileSelection onSelectProfil={handleSelectProfil} />
  }
}
