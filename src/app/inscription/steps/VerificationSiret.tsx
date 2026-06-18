'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Step3Data } from '../types'
import IconCheck from '@/components/icons/IconCheck'
import IconChevronLeft from '@/components/icons/IconChevronLeft'
import IconArrowRight from '@/components/icons/IconArrowRight'
import IconCircleCheck from '@/components/icons/IconCircleCheck'

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

const inputCls = "h-[46px] px-3.5 bg-gray-100 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] outline-none w-full transition-all focus:border-[#4648D4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:bg-white"
const labelCls = "text-[13px] font-medium text-[#1E293B]"
const btnPrevCls = "px-6 py-3 bg-white border-[1.5px] border-[#D1D5DB] rounded-lg text-[15px] font-semibold text-[#0F172A] cursor-pointer hover:border-[#64748B] hover:bg-gray-50 transition-all"
const btnNextCls = "inline-flex items-center gap-2 px-7 py-3 bg-[#4648D4] text-white rounded-lg text-[15px] font-semibold cursor-pointer hover:bg-[#3533B0] hover:-translate-y-px active:scale-[0.98] transition-all disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"

type StepStatus = 'done' | 'active' | 'inactive'
interface SidebarStep { num: number; label: string; status: StepStatus; sub: string | null }

function StepSidebar({ steps }: { steps: readonly SidebarStep[] }) {
  return (
    <aside className="bg-white border-[1.5px] border-[#E2E8F0] rounded-[14px] p-7 pl-6 sticky top-20 anim-fade-in anim-d250 max-lg:static max-lg:[order:-1]" aria-label="Progression">
      <p className="text-[15px] font-semibold text-[#0F172A] mb-6">Étapes de l&apos;inscription</p>
      <ol className="list-none p-0 m-0">
        {steps.map((s, idx) => (
          <li key={s.num} className="flex items-start gap-3.5 py-3 relative">
            {idx < steps.length - 1 && (
              <div className={`absolute left-[15px] top-[44px] bottom-[-12px] w-0.5 ${
                s.status === 'done' || s.status === 'active' ? 'bg-[#1C3064] opacity-20' : 'bg-[#E5E7EB]'
              }`} aria-hidden="true" />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold ${
              s.status === 'done'    ? 'bg-[#1C3064] text-white' :
              s.status === 'active' ? 'bg-[#4648D4] text-white' :
                                      'bg-[#E5E7EB] text-[#9CA3AF]'
            }`} aria-hidden="true">
              {s.status === 'done' ? (
                <IconCheck />
              ) : s.num}
            </div>
            <div className="flex flex-col gap-0.5 pt-[5px]">
              <span className={`text-sm leading-[1.3] ${s.status === 'inactive' ? 'font-normal text-[#9CA3AF]' : 'font-medium text-[#0F172A]'}`}>
                {s.label}
              </span>
              {s.sub && (
                <span className={`text-xs ${s.status === 'done' ? 'text-[#64748B]' : s.status === 'active' ? 'text-[#4648D4]' : ''}`}>
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
    setTimeout(() => { setLoading(false); setValidated(true) }, 600)
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
    <div className="min-h-screen bg-white">

      <header className="bg-white sticky top-0 z-[100] shadow-[0_1px_0_#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-16 h-16 flex items-center justify-between max-md:px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.5px] text-[#0F172A] no-underline">OPUS</Link>
          <button type="button" className="inline-flex items-center gap-1 text-sm text-[#64748B] border-none bg-transparent p-0 cursor-pointer hover:text-[#0F172A] transition-colors" onClick={onPrev} aria-label="Retour">
            <IconChevronLeft />
            Retour
          </button>
        </div>
        <div className="w-full h-[3px] bg-[#E5EBF0] overflow-hidden" role="progressbar" aria-valuenow={STEP} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <div className="h-full bg-[#1C3064] rounded-[0_2px_2px_0] transition-[width] duration-[450ms]" style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-16 py-16 pb-20 max-md:px-6 max-md:py-10">
        <p className="text-[13px] font-semibold text-[#4648D4] tracking-[0.01em] mb-2.5 anim-fade-up anim-d050">Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-[-0.4px] mb-1.5 anim-fade-up anim-d100 max-md:text-[26px]">Vérification de votre entreprise</h1>
        <p className="text-[15px] text-[#64748B] mb-9 anim-fade-up anim-d150">
          Renseignez le numéro SIRET puis complétez les informations de votre société.
        </p>

        <div className="grid grid-cols-[1fr_360px] gap-12 items-start max-lg:grid-cols-1">

          <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-[14px] p-8 anim-fade-up anim-d200">

            <div className="flex gap-3 items-end mb-3.5 max-md:flex-col max-md:items-stretch">
              <div className="flex-1 flex flex-col gap-1.5">
                <label htmlFor="siret" className={labelCls}>Numéro SIRET <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="siret" type="text" className={inputCls} value={siret}
                  onChange={e => { setSiret(e.target.value); setValidated(false) }}
                  placeholder="Ex : 832 547 891 00012" maxLength={17} autoComplete="off" />
              </div>
              <button type="button"
                className="h-[46px] px-6 bg-[#4648D4] text-white rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2 hover:bg-[#3533B0] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed transition-colors"
                onClick={handleVerify} disabled={loading || siret.trim() === ''}>
                {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white anim-spin-slow" />}
                {loading ? 'Vérification…' : 'Vérifier'}
              </button>
            </div>

            {erreur && <p className="text-[13px] text-red-600 mb-3.5">{erreur}</p>}

            {validated && (
              <div className="flex items-start gap-2.5 bg-green-50 border border-green-300 rounded-[10px] px-4 py-3.5 mb-6 anim-slide-down" role="alert">
                <IconCircleCheck className="text-green-700 shrink-0 mt-px w-[18px] h-[18px]" />
                <div>
                  <p className="text-[13px] font-bold text-green-700 tracking-[0.02em] mb-0.5">✓ FORMAT SIRET VALIDE</p>
                  <p className="text-[13px] text-green-700 opacity-85">Complétez les informations ci-dessous</p>
                </div>
              </div>
            )}

            {validated && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] anim-fade-up anim-d050 max-md:grid-cols-1">

                <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
                  <label htmlFor="raisonSociale" className={labelCls}>Raison sociale <span className="text-[#4648D4] ml-0.5">*</span></label>
                  <select id="raisonSociale" className={`${inputCls} appearance-auto cursor-pointer`}
                    value={form.raisonSociale}
                    onChange={e => setForm(prev => ({ ...prev, raisonSociale: e.target.value }))}>
                    <option value="">-- Sélectionnez une forme juridique --</option>
                    {FORMES_JURIDIQUES.map(group => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
                  <label htmlFor="adresseSiege" className={labelCls}>Adresse du siège <span className="text-[#4648D4] ml-0.5">*</span></label>
                  <input id="adresseSiege" type="text" className={inputCls} value={form.adresseSiege} onChange={set('adresseSiege')} placeholder="Ex : 12 Rue des Bâtisseurs, 75011 Paris" autoComplete="street-address" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="codeApe" className={labelCls}>Code APE / NAF</label>
                  <input id="codeApe" type="text" className={inputCls} value={form.codeApe} onChange={set('codeApe')} placeholder="Ex : 4399C" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="representantLegal" className={labelCls}>Représentant légal <span className="text-[#4648D4] ml-0.5">*</span></label>
                  <input id="representantLegal" type="text" className={inputCls} value={form.representantLegal} onChange={set('representantLegal')} placeholder="Ex : Jean Durand" autoComplete="name" />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
                  <label htmlFor="telephone" className={labelCls}>Téléphone <span className="text-[#4648D4] ml-0.5">*</span></label>
                  <input id="telephone" type="tel" className={inputCls} value={form.telephone} onChange={set('telephone')} placeholder="Ex : 01 23 45 67 89" autoComplete="tel" />
                </div>

              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex gap-3">
              <button type="button" className={btnPrevCls} onClick={onPrev}>Précédent</button>
              <button type="button" className={btnNextCls} disabled={!validated} onClick={handleContinue}>
                Continuer
                <IconArrowRight />
              </button>
            </div>
          </div>

          <StepSidebar steps={STEPS_LIST} />

        </div>
      </main>
    </div>
  )
}
