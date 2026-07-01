'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Step2Data, ProfilId } from '../types'
import IconCheck from '@/components/icons/IconCheck'
import IconChevronLeft from '@/components/icons/IconChevronLeft'
import IconArrowRight from '@/components/icons/IconArrowRight'
import IconEyeOpen from '@/components/icons/IconEyeOpen'
import IconEyeClosed from '@/components/icons/IconEyeClosed'

const STEP        = 2
const TOTAL_STEPS = 6

const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'active',   sub: 'En cours' },
  { num: 3, label: 'Vérification SIRET',           status: 'inactive', sub: null       },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'inactive', sub: null       },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

const ROLES = [
  "Apporteur d'affaires",
  'Agent immobilier',
  'Courtier',
  'Indépendant',
  'Gérant BTP',
  'Autre',
]

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputCls = "h-[46px] px-3.5 bg-gray-100 border border-[#E5E7EB] rounded-lg text-sm text-[#0F172A] outline-none w-full transition-all focus:border-[#4648D4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:bg-white placeholder:text-[#B0B8C1]"
const labelCls = "text-[13px] font-medium text-[#1E293B]"
const btnPrevCls = "px-6 py-3 bg-white border-[1.5px] border-[#D1D5DB] rounded-lg text-[15px] font-semibold text-[#0F172A] cursor-pointer hover:border-[#64748B] hover:bg-gray-50 transition-all"
const btnNextCls = "inline-flex items-center gap-2 px-7 py-3 bg-[#4648D4] text-white rounded-lg text-[15px] font-semibold cursor-pointer hover:bg-[#3533B0] hover:-translate-y-px active:scale-[0.98] transition-all"

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? <IconEyeOpen /> : <IconEyeClosed />
}

interface Props {
  initialValues?: Partial<Step2Data>
  profil?: ProfilId | null
  isSignedIn?: boolean
  onNext: (data: Step2Data) => void
  onPrev: () => void
}

export default function InformationsPersonnelles({ initialValues = {}, profil, isSignedIn = false, onNext, onPrev }: Props) {
  const [form, setForm] = useState<Step2Data>({
    nom:          initialValues.nom          ?? '',
    prenom:       initialValues.prenom       ?? '',
    email:        initialValues.email        ?? '',
    telephone:    initialValues.telephone    ?? '',
    fonction:     initialValues.fonction     ?? '',
    motDePasse:   initialValues.motDePasse   ?? '',
    confirmation: initialValues.confirmation ?? '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [erreur,       setErreur]       = useState('')

  const set = (key: keyof Step2Data) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSignedIn) {
      if (!EMAIL_REGEX.test(form.email)) {
        setErreur('Veuillez entrer une adresse email valide (ex : nom@domaine.com).')
        return
      }
      if (form.motDePasse !== form.confirmation) {
        setErreur('Les mots de passe ne correspondent pas.')
        return
      }
      if (!PASSWORD_REGEX.test(form.motDePasse)) {
        setErreur('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.')
        return
      }
    }
    setErreur('')
    onNext(form)
  }

  const selectArrowStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%235A6E7C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 14px center',
  }

  return (
    <div className="min-h-screen bg-opus-bg">

      <header className="bg-white sticky top-0 z-100 shadow-[0_1px_0_#E2EDF5]">
        <div className="max-w-300 mx-auto px-16 h-16 flex items-center justify-between max-md:px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.5px] text-[#0F172A] no-underline" aria-label="Accueil Opus">OPUS</Link>
          <button type="button" className="inline-flex items-center gap-1 text-sm text-[#64748B] border-none bg-transparent p-0 cursor-pointer hover:text-[#0F172A] transition-colors" onClick={onPrev} aria-label="Retour">
            <IconChevronLeft />
            Retour
          </button>
        </div>
        <div className="w-full h-0.75 bg-[#E5EBF0] overflow-hidden" role="progressbar" aria-valuenow={STEP} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Étape ${STEP} sur ${TOTAL_STEPS}`}>
          <div className="h-full bg-[#1C3064] rounded-[0_2px_2px_0] transition-[width] duration-450" style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-300 mx-auto px-16 py-16 pb-20 max-md:px-6 max-md:py-10">
        <p className="text-[13px] font-semibold text-[#4648D4] tracking-[0.01em] mb-2.5 anim-fade-up anim-d050">Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className="text-[32px] font-bold text-[#0F172A] leading-[1.15] tracking-[-0.4px] mb-1.5 anim-fade-up anim-d100 max-md:text-[26px]">Informations personnelles</h1>
        <p className="text-[15px] text-[#64748B] mb-10 anim-fade-up anim-d150">Configurez votre profil utilisateur</p>

        <div className="grid grid-cols-[1fr_360px] gap-12 items-start max-lg:grid-cols-1">

          <form className="flex flex-col anim-fade-up anim-d200" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 max-md:grid-cols-1">

              <div className="flex flex-col gap-1.5">
                <label htmlFor="nom" className={labelCls}>Nom <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="nom" type="text" className={inputCls} value={form.nom} onChange={set('nom')} required autoComplete="family-name" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="prenom" className={labelCls}>Prénom <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="prenom" type="text" className={inputCls} value={form.prenom} onChange={set('prenom')} required autoComplete="given-name" />
              </div>

              {!isSignedIn && (
              <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
                <label htmlFor="email" className={labelCls}>Email professionnel <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="email" type="email" className={inputCls} value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="telephone" className={labelCls}>Numéro de téléphone <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input
                  id="telephone"
                  type="tel"
                  inputMode="numeric"
                  className={inputCls}
                  value={form.telephone}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d+]/g, '')
                    setForm(prev => ({ ...prev, telephone: val }))
                  }}
                  required
                  autoComplete="tel"
                  placeholder="0612345678"
                />
              </div>

              {profil !== 'entreprise' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fonction" className={labelCls}>Fonction (Optionnel)</label>
                <select
                  id="fonction"
                  className={`${inputCls} appearance-none cursor-pointer pr-10`}
                  style={selectArrowStyle}
                  value={form.fonction}
                  onChange={set('fonction')}
                >
                  <option value="" disabled>Sélectionnez un rôle</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              )}

              {!isSignedIn && (
              <div className="col-span-2 max-md:col-span-1 grid grid-cols-2 gap-x-6 max-md:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="motDePasse" className={labelCls}>Mot de passe <span className="text-[#4648D4] ml-0.5">*</span></label>
                  <div className="relative flex items-center">
                    <input id="motDePasse" type={showPassword ? 'text' : 'password'} className={`${inputCls} pr-11`} value={form.motDePasse} onChange={set('motDePasse')} required autoComplete="new-password" />
                    <button type="button" className="absolute right-3 text-[#64748B] hover:text-[#0F172A] p-1 transition-colors" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmation" className={labelCls}>Confirmation Mot de passe <span className="text-[#4648D4] ml-0.5">*</span></label>
                  <div className="relative flex items-center">
                    <input id="confirmation" type={showConfirm ? 'text' : 'password'} className={`${inputCls} pr-11`} value={form.confirmation} onChange={set('confirmation')} required autoComplete="new-password" />
                    <button type="button" className="absolute right-3 text-[#64748B] hover:text-[#0F172A] p-1 transition-colors" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                      <EyeIcon visible={showConfirm} />
                    </button>
                  </div>
                </div>
              </div>
              )}

            </div>

            {erreur && <p className="text-[13px] text-red-600 mt-3">{erreur}</p>}

            <div className="mt-8 pt-6 border-t border-[#E2EDF5] flex gap-3">
              <button type="button" className={btnPrevCls} onClick={onPrev}>Précédent</button>
              <button type="submit" className={btnNextCls}>
                Continuer
                <IconArrowRight />
              </button>
            </div>
          </form>

          <StepSidebar steps={STEPS_LIST} />

        </div>
      </main>
    </div>
  )
}

type StepStatus = 'done' | 'active' | 'inactive'
interface SidebarStep { num: number; label: string; status: StepStatus; sub: string | null }

function StepSidebar({ steps }: { steps: readonly SidebarStep[] }) {
  return (
    <aside className="bg-white border-[1.5px] border-[#E2E8F0] rounded-[14px] p-7 pl-6 sticky top-20 anim-fade-in anim-d250 max-lg:static max-lg:-order-1" aria-label="Progression de l'inscription">
      <p className="text-[15px] font-semibold text-[#0F172A] mb-6">Étapes de l&apos;inscription</p>
      <ol className="list-none p-0 m-0">
        {steps.map((s, idx) => (
          <li key={s.num} className="flex items-start gap-3.5 py-3 relative">
            {idx < steps.length - 1 && (
              <div className={`absolute left-3.75 top-11 -bottom-3 w-0.5 ${
                s.status === 'done' || s.status === 'active' ? 'bg-[#1C3064] opacity-20' : 'bg-[#E5E7EB]'
              }`} aria-hidden="true" />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${
              s.status === 'done'     ? 'bg-[#1C3064] text-white' :
              s.status === 'active'  ? 'bg-[#4648D4] text-white' :
                                       'bg-[#E5E7EB] text-[#9CA3AF]'
            }`} aria-hidden="true">
              {s.status === 'done' ? (
                <IconCheck />
              ) : s.num}
            </div>
            <div className="flex flex-col gap-0.5 pt-1.25">
              <span className={`text-sm leading-[1.3] ${s.status === 'inactive' ? 'font-normal text-[#9CA3AF]' : 'font-medium text-[#0F172A]'}`}>
                {s.label}
              </span>
              {s.sub && (
                <span className={`text-xs ${s.status === 'done' ? 'text-[#64748B]' : s.status === 'active' ? 'text-[#6669E0]' : ''}`}>
                  {s.sub}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  )
}
