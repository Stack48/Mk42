'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ProfilId } from './types'

const STEP        = 1
const TOTAL_STEPS = 6

interface ProfileOption {
  id:          ProfilId
  title:       string
  description: string
  features:    string[]
}

const PROFILES: ProfileOption[] = [
  {
    id:          'particulier',
    title:       'Particulier',
    description: 'Vous apportez des affaires à titre personnel, sans structure juridique.',
    features:    ['Sans SIRET requis', 'Commissions en nom propre', 'Déclaration simplifiée'],
  },
  {
    id:          'professionnel',
    title:       'Professionnel',
    description: 'Vous exercez en tant qu\'indépendant avec un statut auto-entrepreneur ou similaire.',
    features:    ['SIRET requis', 'Facturation automatique', 'DAS2 pris en charge'],
  },
  {
    id:          'entreprise',
    title:       'Entreprise',
    description: 'Vous représentez une société qui apporte des affaires (SAS, SARL, etc.).',
    features:    ['SIRET + Kbis requis', 'Contrats société', 'Export DAS2 & comptable'],
  },
]

const CARD_DELAYS = ['anim-d200', 'anim-d280', 'anim-d360']

interface ProfileCardProps {
  profile:    ProfileOption
  isSelected: boolean
  onSelect:   () => void
  onChoose:   () => void
  delay:      string
}

function ProfileCard({ profile, isSelected, onSelect, onChoose, delay }: ProfileCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={profile.title}
      className={`bg-white border-[1.5px] rounded-[14px] p-8 flex flex-col cursor-pointer outline-none transition-all duration-200 anim-fade-up ${delay} ${
        isSelected
          ? 'border-opus-primary shadow-[0_0_0_3px_rgba(34,116,165,0.18),0_4px_24px_rgba(34,116,165,0.13)] -translate-y-0.5'
          : 'border-[#E2EDF5] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:border-opus-border hover:shadow-[0_4px_24px_rgba(34,116,165,0.13)] hover:-translate-y-[3px]'
      }`}
      onClick={onSelect}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
    >
      <div className="w-[60px] h-[60px] rounded-full bg-[#BDD5EA] flex-shrink-0 mb-6" aria-hidden="true" />
      <h2 className="text-[19px] font-bold text-opus-ink leading-[1.25] mb-2">{profile.title}</h2>
      <p className="text-sm text-opus-muted leading-relaxed mb-6">{profile.description}</p>
      <ul className="list-none p-0 m-0 flex-1 flex flex-col gap-1.5 mb-6" aria-label="Caractéristiques">
        {profile.features.map(feature => (
          <li key={feature} className="text-sm text-opus-text pl-3.5 relative before:content-['•'] before:absolute before:left-0 before:text-opus-text leading-relaxed">
            {feature}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label={`Choisir le profil ${profile.title}`}
        className={`w-full py-3 px-4 border-[1.5px] border-opus-primary rounded-lg text-sm font-semibold text-center cursor-pointer transition-all active:scale-[0.97] ${
          isSelected
            ? 'bg-opus-primary text-white hover:bg-opus-primary-dk hover:border-opus-primary-dk'
            : 'bg-transparent text-opus-primary hover:bg-opus-primary-xl'
        }`}
        onClick={e => { e.stopPropagation(); onChoose() }}
      >
        Choisir ce profil
      </button>
    </article>
  )
}

interface ProfileSelectionProps {
  onSelectProfil?: (profil: ProfilId) => void
}

export default function ProfileSelection({ onSelectProfil }: ProfileSelectionProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<ProfilId | null>(null)

  function handleChoose(profil: ProfilId) {
    if (onSelectProfil) {
      onSelectProfil(profil)
    } else {
      router.push('/inscription?step=2')
    }
  }

  return (
    <div className="min-h-screen bg-opus-bg">

      <header className="bg-white sticky top-0 z-[100] shadow-[0_1px_0_#E2EDF5]">
        <div className="max-w-[1200px] mx-auto px-16 h-16 flex items-center justify-between max-[960px]:px-6 max-[600px]:px-4">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.5px] text-opus-ink no-underline" aria-label="Retour à l'accueil Opus">
            OPUS
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-opus-muted no-underline hover:text-opus-ink transition-colors" aria-label="Retour à l'accueil">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </Link>
        </div>
        <div
          className="w-full h-[3px] bg-[#E5EBF0] overflow-hidden"
          role="progressbar"
          aria-valuenow={STEP}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Étape ${STEP} sur ${TOTAL_STEPS}`}
        >
          <div className="h-full bg-[#1C3064] rounded-[0_2px_2px_0] transition-[width] duration-[450ms]" style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-16 py-20 max-[960px]:px-6 max-[960px]:py-[60px] max-[600px]:px-4 max-[600px]:py-10">
        <p className="text-[13px] font-semibold text-opus-primary tracking-[0.01em] mb-3 anim-fade-up anim-d050">
          Étape {STEP} sur {TOTAL_STEPS}
        </p>
        <h1 className="text-[36px] font-bold text-opus-ink leading-[1.15] tracking-[-0.5px] mb-2 anim-fade-up anim-d100 max-[960px]:text-[28px] max-[600px]:text-2xl">
          Quel est votre profil&nbsp;?
        </h1>
        <p className="text-[15px] text-opus-muted mb-12 anim-fade-up anim-d150">
          Vous pourrez modifier ces informations plus tard.
        </p>

        <div
          className="grid grid-cols-3 gap-6 mb-8 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1 max-[600px]:gap-4"
          role="group"
          aria-label="Choisissez votre profil"
        >
          {PROFILES.map((profile, idx) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={selected === profile.id}
              onSelect={() => setSelected(profile.id)}
              onChoose={() => handleChoose(profile.id)}
              delay={CARD_DELAYS[idx] ?? 'anim-d200'}
            />
          ))}
        </div>
      </main>

    </div>
  )
}
