'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { Step4Data } from '../types'

const STEP        = 4
const TOTAL_STEPS = 6

const STEPS_AVEC_SIRET = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',           status: 'done',     sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'active',   sub: 'En cours' },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

const STEPS_SANS_SIRET = [
  { num: 1, label: 'Choix du profil',              status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',    status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',           status: 'inactive', sub: null       },
  { num: 4, label: 'Coordonnées bancaires (IBAN)', status: 'active',   sub: 'En cours' },
  { num: 5, label: "Vérification d'identité (KYC)",status: 'inactive', sub: null       },
  { num: 6, label: 'Validation email & CGU',       status: 'inactive', sub: null       },
] as const

const inputCls = "h-[46px] px-3.5 bg-gray-100 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] outline-none w-full transition-all focus:border-[#4648D4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:bg-white"
const labelCls = "text-[13px] font-medium text-[#1E293B]"
const btnPrevCls = "px-6 py-3 bg-white border-[1.5px] border-[#D1D5DB] rounded-lg text-[15px] font-semibold text-[#0F172A] cursor-pointer hover:border-[#64748B] hover:bg-gray-50 transition-all"
const btnNextCls = "inline-flex items-center gap-2 px-7 py-3 bg-[#4648D4] text-white rounded-lg text-[15px] font-semibold cursor-pointer hover:bg-[#3533B0] hover:-translate-y-px active:scale-[0.98] transition-all"

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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold ${
              s.status === 'done'    ? 'bg-[#1C3064] text-white' :
              s.status === 'active' ? 'bg-[#4648D4] text-white' :
                                      'bg-[#E5E7EB] text-[#9CA3AF]'
            }`} aria-hidden="true">
              {s.status === 'done' ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 7l3 3 6-6" />
                </svg>
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

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="text-[#4648D4] mb-1">
      <rect x="4" y="4" width="28" height="28" rx="6" />
      <path d="M18 24V14M13 19l5-5 5 5" />
    </svg>
  )
}

interface Props {
  initialValues?: Partial<Step4Data>
  profil: string
  onNext: (data: Step4Data) => void
  onPrev: () => void
}

export default function CoordonneesBancaires({ initialValues = {}, profil, onNext, onPrev }: Props) {
  const stepsList = profil === 'particulier' ? STEPS_SANS_SIRET : STEPS_AVEC_SIRET

  const [form, setForm] = useState({
    titulaire:   initialValues.titulaire   ?? '',
    iban:        initialValues.iban        ?? '',
    ibanConfirm: initialValues.ibanConfirm ?? '',
    bic:         initialValues.bic         ?? '',
  })
  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const [ribFile,  setRibFile]  = useState<File | null>(initialValues.ribFile ?? null)
  const [dragging, setDragging] = useState(false)
  const [erreur,   setErreur]   = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => { if (file) setRibFile(file) }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0] ?? null)
  }

  const handleContinue = () => {
    if (form.iban && form.iban !== form.ibanConfirm) {
      setErreur("Les deux IBAN ne correspondent pas.")
      return
    }
    onNext({ ...form, ribFile })
  }

  return (
    <div className="min-h-screen bg-white">

      <header className="bg-white sticky top-0 z-[100] shadow-[0_1px_0_#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-16 h-16 flex items-center justify-between max-md:px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.5px] text-[#0F172A] no-underline">OPUS</Link>
          <button type="button" className="inline-flex items-center gap-1 text-sm text-[#64748B] border-none bg-transparent p-0 cursor-pointer hover:text-[#0F172A] transition-colors" onClick={onPrev} aria-label="Retour">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </button>
        </div>
        <div className="w-full h-[3px] bg-[#E5EBF0] overflow-hidden" role="progressbar" aria-valuenow={STEP} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <div className="h-full bg-[#1C3064] rounded-[0_2px_2px_0] transition-[width] duration-[450ms]" style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-16 py-16 pb-20 max-md:px-6 max-md:py-10">
        <p className="text-[13px] font-semibold text-[#4648D4] tracking-[0.01em] mb-2.5 anim-fade-up anim-d050">Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-[-0.4px] mb-1.5 anim-fade-up anim-d100 max-md:text-[26px]">Coordonnées bancaires</h1>
        <p className="text-[15px] text-[#64748B] mb-9 anim-fade-up anim-d150">Renseignez vos informations bancaires</p>

        <div className="grid grid-cols-[1fr_360px] gap-12 items-start max-lg:grid-cols-1">

          <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-[14px] p-8 anim-fade-up anim-d200">
            <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-md:grid-cols-1">

              <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
                <label htmlFor="titulaire" className={labelCls}>Nom du Titulaire du compte <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="titulaire" type="text" className={inputCls} value={form.titulaire} onChange={set('titulaire')} autoComplete="name" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="iban" className={labelCls}>IBAN <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="iban" type="text" className={inputCls} value={form.iban} onChange={set('iban')} placeholder="FR76 XXXX XXXX XXXX" autoComplete="off" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="ibanConfirm" className={labelCls}>Confirmer l&apos;IBAN <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="ibanConfirm" type="text" className={inputCls} value={form.ibanConfirm} onChange={set('ibanConfirm')} placeholder="FR76 XXXX XXXX XXXX" autoComplete="off" />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
                <label htmlFor="bic" className={labelCls}>Code BIC / SWIFT <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="bic" type="text" className={inputCls} value={form.bic} onChange={set('bic')} placeholder="Ex : BNPAFRPPXXX" autoComplete="off" />
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 max-md:col-span-1">
                <span className={labelCls}>Relevé d&apos;Identité Bancaire (RIB)</span>
                <div
                  className={`mt-1 border-2 border-dashed rounded-lg py-9 px-6 flex flex-col items-center gap-2 cursor-pointer text-center transition-all ${
                    dragging ? 'border-[#4648D4] bg-[#EEEEFF]' : 'border-[#CBD5E1] bg-[#FAFBFF] hover:border-[#4648D4] hover:bg-[#EEEEFF]'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Zone de dépôt du RIB"
                >
                  <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                    onChange={e => handleFile(e.target.files?.[0] ?? null)} />
                  <UploadIcon />
                  <p className="text-sm font-semibold text-[#0F172A]">Cliquez ou glissez votre fichier ici</p>
                  <p className="text-[13px] text-[#64748B]">PDF, PNG ou JPEG (max 5 Mo)</p>
                  {ribFile && <p className="text-[13px] text-[#4648D4] font-medium mt-1">{ribFile.name}</p>}
                </div>
              </div>

            </div>

            {erreur && <p className="text-[13px] text-red-600 mt-3">{erreur}</p>}

            <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex gap-3">
              <button type="button" className={btnPrevCls} onClick={onPrev}>Précédent</button>
              <button type="button" className={btnNextCls} onClick={handleContinue}>
                Continuer
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <button type="button"
              className="block mx-auto mt-2 text-[13px] text-[#6B7280] bg-transparent border-none cursor-pointer hover:underline"
              onClick={() => onNext({ ...form, ribFile: null })}>
              Passer cette étape
            </button>
          </div>

          <StepSidebar steps={stepsList} />

        </div>
      </main>
    </div>
  )
}
