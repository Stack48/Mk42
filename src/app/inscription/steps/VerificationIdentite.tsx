'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { Step5Data, ProfilId } from '../types'
import IconCheck from '@/components/icons/IconCheck'
import IconChevronLeft from '@/components/icons/IconChevronLeft'
import IconArrowRight from '@/components/icons/IconArrowRight'
import IconUpload from '@/components/icons/IconUpload'

const STEP        = 5
const TOTAL_STEPS = 6

const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',               status: 'done',     sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',     status: 'done',     sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',            status: 'done',     sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)',  status: 'done',     sub: 'Validé'   },
  { num: 5, label: "Vérification d'identité (KYC)", status: 'active',   sub: 'En cours' },
  { num: 6, label: 'Validation email & CGU',        status: 'inactive', sub: null       },
] as const

const DOC_TYPES = ["Carte d'identité", 'Passeport', 'Titre de séjour', 'Permis de conduire']

const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) return 'Format non supporté. Utilisez PDF, PNG, JPG ou JPEG.'
  if (file.size > MAX_FILE_SIZE) return 'Le fichier dépasse la taille maximale de 10 Mo.'
  return null
}

const inputCls = "h-[46px] px-3.5 bg-gray-100 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] outline-none w-full transition-all focus:border-[#4648D4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:bg-white"
const labelCls = "text-[13px] font-medium text-[#1E293B]"
const btnPrevCls = "px-6 py-3 bg-white border-[1.5px] border-[#D1D5DB] rounded-lg text-[15px] font-semibold text-[#0F172A] cursor-pointer hover:border-[#64748B] hover:bg-gray-50 transition-all"
const btnNextCls = "inline-flex items-center gap-2 px-7 py-3 bg-[#4648D4] text-white rounded-lg text-[15px] font-semibold cursor-pointer hover:bg-[#3533B0] hover:-translate-y-px active:scale-[0.98] transition-all"

const selectArrowStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 14px center',
}

type StepStatus = 'done' | 'active' | 'inactive'
interface SidebarStep { num: number; label: string; status: StepStatus; sub: string | null }

function StepSidebar({ steps }: { steps: readonly SidebarStep[] }) {
  return (
    <aside className="bg-white border-[1.5px] border-[#E2E8F0] rounded-[14px] p-7 pl-6 sticky top-20 anim-fade-in anim-d250 max-lg:static max-lg:-order-1" aria-label="Progression">
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
              s.status === 'done'    ? 'bg-[#1C3064] text-white' :
              s.status === 'active' ? 'bg-[#4648D4] text-white' :
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
  initialValues?: Partial<Step5Data>
  profil?: ProfilId | null
  onNext: (data: Step5Data) => void
  onPrev: () => void
}

export default function VerificationIdentite({ initialValues = {}, profil, onNext, onPrev }: Props) {
  const [docType,    setDocType]    = useState(initialValues.docType  ?? DOC_TYPES[0])
  const [docNum,     setDocNum]     = useState(initialValues.docNum   ?? '')
  const [kbisFile,   setKbisFile]   = useState<File | null>(initialValues.kbisFile ?? null)
  const [idFile,     setIdFile]     = useState<File | null>(initialValues.idFile   ?? null)
  const [kbisError,  setKbisError]  = useState('')
  const [idError,    setIdError]    = useState('')

  const [draggingKbis, setDraggingKbis] = useState(false)
  const [draggingId,   setDraggingId]   = useState(false)

  function handleKbisFile(file: File) {
    const err = validateFile(file)
    if (err) { setKbisError(err); return }
    setKbisError('')
    setKbisFile(file)
  }

  function handleIdFile(file: File) {
    const err = validateFile(file)
    if (err) { setIdError(err); return }
    setIdError('')
    setIdFile(file)
  }

  const kbisRef = useRef<HTMLInputElement>(null)
  const idRef   = useRef<HTMLInputElement>(null)

  const uploadZoneCls = (dragging: boolean) =>
    `mt-1 border-2 border-dashed rounded-lg py-10 px-6 flex flex-col items-center gap-2 cursor-pointer text-center transition-all ${
      dragging ? 'border-[#4648D4] bg-[#EEEEFF]' : 'border-[#CBD5E1] bg-[#FAFBFF] hover:border-[#4648D4] hover:bg-[#EEEEFF]'
    }`

  return (
    <div className="min-h-screen bg-white">

      <header className="bg-white sticky top-0 z-100 shadow-[0_1px_0_#E2E8F0]">
        <div className="max-w-300 mx-auto px-16 h-16 flex items-center justify-between max-md:px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.5px] text-[#0F172A] no-underline">OPUS</Link>
          <button type="button" className="inline-flex items-center gap-1 text-sm text-[#64748B] border-none bg-transparent p-0 cursor-pointer hover:text-[#0F172A] transition-colors" onClick={onPrev} aria-label="Retour">
            <IconChevronLeft />
            Retour
          </button>
        </div>
        <div className="w-full h-0.75 bg-[#E5EBF0] overflow-hidden" role="progressbar" aria-valuenow={STEP} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
          <div className="h-full bg-[#1C3064] rounded-[0_2px_2px_0] transition-[width] duration-450" style={{ width: `${(STEP / TOTAL_STEPS) * 100}%` }} />
        </div>
      </header>

      <main className="max-w-300 mx-auto px-16 py-16 pb-20 max-md:px-6 max-md:py-10">
        <p className="text-[13px] font-semibold text-[#4648D4] tracking-[0.01em] mb-2.5 anim-fade-up anim-d050">Étape {STEP} sur {TOTAL_STEPS}</p>
        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-[-0.4px] mb-1.5 anim-fade-up anim-d100 max-md:text-[26px]">Vérification d&apos;identité</h1>
        <p className="text-[15px] text-[#64748B] mb-9 anim-fade-up anim-d150">Veuillez télécharger vos documents justificatifs</p>

        <div className="grid grid-cols-[1fr_360px] gap-12 items-start max-lg:grid-cols-1">

          <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-[14px] p-8 anim-fade-up anim-d200">
            <div className="flex flex-col gap-5">

              <div className="flex flex-col gap-1.5">
                <span className={labelCls}>Extrait K-Bis <span className="text-[#4648D4] ml-0.5">*</span></span>
                <p className="text-xs text-[#6B7280] mb-1.5">Document officiel d&apos;immatriculation (moins de 3 mois)</p>
                <div
                  className={uploadZoneCls(draggingKbis)}
                  onClick={() => kbisRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDraggingKbis(true) }}
                  onDragLeave={() => setDraggingKbis(false)}
                  onDrop={e => { e.preventDefault(); setDraggingKbis(false); const f = e.dataTransfer.files[0]; if (f) handleKbisFile(f) }}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && kbisRef.current?.click()}
                  aria-label="Zone de dépôt du K-Bis"
                >
                  <input ref={kbisRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleKbisFile(f) }} />
                  <IconUpload className="text-[#4648D4] mb-1" />
                  <p className="text-sm font-semibold text-[#0F172A]">Cliquez ou glissez votre K-Bis ici</p>
                  <p className="text-[13px] text-[#64748B]">PDF, PNG, JPG ou JPEG (max 10 Mo)</p>
                  {kbisFile && <p className="text-xs text-green-600 font-medium">✓ {kbisFile.name}</p>}
                  {kbisError && <p className="text-xs text-red-600 font-medium mt-1">{kbisError}</p>}
                </div>
              </div>

              {profil !== 'entreprise' && (<>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="docType" className={labelCls}>Type de document d&apos;identité <span className="text-[#4648D4] ml-0.5">*</span></label>
                <select id="docType"
                  className={`${inputCls} appearance-none pr-10`}
                  style={selectArrowStyle}
                  value={docType} onChange={e => setDocType(e.target.value)}>
                  {DOC_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="docNum" className={labelCls}>Numéro du document <span className="text-[#4648D4] ml-0.5">*</span></label>
                <input id="docNum" type="text" className={inputCls} value={docNum} onChange={e => setDocNum(e.target.value)} placeholder="Entrez le numéro" autoComplete="off" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={labelCls}>Pièce d&apos;identité (Recto / Verso) <span className="text-[#4648D4] ml-0.5">*</span></span>
                <div
                  className={uploadZoneCls(draggingId)}
                  onClick={() => idRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDraggingId(true) }}
                  onDragLeave={() => setDraggingId(false)}
                  onDrop={e => { e.preventDefault(); setDraggingId(false); const f = e.dataTransfer.files[0]; if (f) handleIdFile(f) }}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && idRef.current?.click()}
                  aria-label="Zone de dépôt de la pièce d'identité"
                >
                  <input ref={idRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleIdFile(f) }} />
                  <IconUpload className="text-[#4648D4] mb-1" />
                  <p className="text-sm font-semibold text-[#0F172A]">Cliquez ou glissez votre pièce d&apos;identité ici</p>
                  <p className="text-[13px] text-[#64748B]">(Recto / Verso) — PDF, PNG, JPG ou JPEG (max 10 Mo)</p>
                  {idFile && <p className="text-xs text-green-600 font-medium">✓ {idFile.name}</p>}
                  {idError && <p className="text-xs text-red-600 font-medium mt-1">{idError}</p>}
                </div>
              </div>
              </>)}

            </div>

            <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex gap-3">
              <button type="button" className={btnPrevCls} onClick={onPrev}>Précédent</button>
              <button type="button" className={btnNextCls} onClick={() => onNext({ docType, docNum, kbisFile, idFile })}>
                Continuer
                <IconArrowRight />
              </button>
            </div>

            <button type="button"
              className="block mx-auto mt-2 text-[13px] text-[#6B7280] bg-transparent border-none cursor-pointer hover:underline"
              onClick={() => onNext({ docType, docNum, kbisFile: null, idFile: null })}>
              Passer cette étape
            </button>
          </div>

          <StepSidebar steps={STEPS_LIST} />

        </div>
      </main>
    </div>
  )
}
