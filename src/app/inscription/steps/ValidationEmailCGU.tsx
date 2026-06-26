'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSignIn } from '@clerk/nextjs'
import type { WizardFormData } from '../types'
import IconCheck from '@/components/icons/IconCheck'
import IconChevronLeft from '@/components/icons/IconChevronLeft'
import IconEmail from '@/components/icons/IconEmail'
import IconCheckboxMark from '@/components/icons/IconCheckboxMark'
import IconRefresh from '@/components/icons/IconRefresh'

const STEP        = 6
const TOTAL_STEPS = 6

const STEPS_LIST = [
  { num: 1, label: 'Choix du profil',               status: 'done',   sub: 'Validé'   },
  { num: 2, label: 'Informations personnelles',     status: 'done',   sub: 'Validé'   },
  { num: 3, label: 'Vérification SIRET',            status: 'done',   sub: 'Validé'   },
  { num: 4, label: 'Coordonnées bancaires (IBAN)',  status: 'done',   sub: 'Validé'   },
  { num: 5, label: "Vérification d'identité (KYC)", status: 'done',   sub: 'Validé'   },
  { num: 6, label: 'Validation email & CGU',        status: 'active', sub: 'En cours' },
] as const

const CGU_ITEMS = [
  {
    id: 'cgu',
    label: "J'accepte les Conditions Générales d'Utilisation",
    sub: "Obligatoire pour l'utilisation des services OPUS Accounting.",
    required: true,
    hasModal: true,
  },
  {
    id: 'privacy',
    label: "J'accepte la Politique de Confidentialité",
    sub: 'Comprendre comment nous protégeons vos données financières.',
    required: true,
    hasModal: true,
  },
  {
    id: 'cookies',
    label: "J'accepte la Politique relative aux Cookies",
    sub: "Gestion de l'expérience utilisateur et analytique.",
    required: true,
    hasModal: true,
  },
  {
    id: 'newsletter',
    label: "S'abonner à la Newsletter (Optionnel)",
    sub: 'Recevez des conseils comptables et des mises à jour produit.',
    required: false,
    hasModal: false,
  },
] as const

const MODAL_CONTENT: Record<string, { title: string; content: string }> = {
  cgu: {
    title: "Conditions Générales d'Utilisation",
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Article 1 — Objet
Les présentes Conditions Générales d'Utilisation ont pour objet de définir les modalités et conditions d'utilisation des services proposés par OPUS Accounting, ainsi que les droits et obligations des parties dans ce cadre.

Article 2 — Accès au service
L'accès aux services est réservé aux utilisateurs ayant complété leur inscription et validé leur adresse email. OPUS Accounting se réserve le droit de suspendre ou de résilier l'accès en cas de non-respect des présentes conditions.

Article 3 — Responsabilité
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.

Article 4 — Modification des CGU
OPUS Accounting se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification par email ou notification dans l'application.`,
  },
  privacy: {
    title: 'Politique de Confidentialité',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nous attachons une importance primordiale à la protection de vos données personnelles et financières.

1. Données collectées
Nous collectons les informations que vous nous fournissez lors de votre inscription : nom, prénom, adresse email, numéro de téléphone, coordonnées bancaires (IBAN, BIC), et documents d'identité à des fins de vérification KYC.

2. Utilisation des données
Vos données sont utilisées pour : fournir et améliorer nos services, traiter vos commissions, émettre des documents comptables, et respecter nos obligations légales (DAS2, déclarations fiscales).

3. Conservation
Vos données sont conservées pendant la durée de votre relation contractuelle avec OPUS Accounting et jusqu'à 5 ans après la fin de celle-ci, conformément aux obligations légales applicables.

4. Vos droits
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à : privacy@opus-btp.fr.`,
  },
  cookies: {
    title: 'Politique relative aux Cookies',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Notre site utilise des cookies pour améliorer votre expérience de navigation.

Qu'est-ce qu'un cookie ?
Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site web. Il permet au site de mémoriser vos préférences et d'analyser votre comportement de navigation.

Types de cookies utilisés
• Cookies essentiels : nécessaires au fonctionnement du service (authentification, session).
• Cookies analytiques : nous aident à comprendre comment vous utilisez notre application afin de l'améliorer.
• Cookies de préférences : mémorisent vos paramètres (langue, affichage).

Gestion des cookies
Vous pouvez à tout moment modifier vos préférences en matière de cookies depuis les paramètres de votre compte ou de votre navigateur. Notez que la désactivation de certains cookies essentiels peut altérer le bon fonctionnement du service.`,
  },
}

async function uploadDocument(file: File, type: string): Promise<void> {
  const resUrl = await fetch('/api/documents/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomFichier: file.name, contentType: file.type }),
  })
  const { url, key } = await resUrl.json()
  if (!resUrl.ok) throw new Error('Erreur génération URL de téléversement')

  const resS3 = await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
  if (!resS3.ok) throw new Error('Erreur lors du téléversement du fichier')

  const resDoc = await fetch('/api/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, urlS3: key, nomFichier: file.name }),
  })
  if (!resDoc.ok) throw new Error('Erreur enregistrement du document')
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

interface PolicyModalProps {
  modalId: string
  onClose: () => void
}

function PolicyModal({ modalId, onClose }: PolicyModalProps) {
  const data = MODAL_CONTENT[modalId]
  if (!data) return null
  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={data.title}
    >
      <div
        className="bg-white rounded-[14px] shadow-xl max-w-160 w-full max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#E2E8F0]">
          <h3 className="text-[17px] font-bold text-[#0F172A]">{data.title}</h3>
          <button
            type="button"
            className="text-[#64748B] hover:text-[#0F172A] text-xl font-semibold bg-transparent border-none cursor-pointer leading-none"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-7 py-6 text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">
          {data.content}
        </div>
        <div className="px-7 py-5 border-t border-[#E2E8F0]">
          <button
            type="button"
            className="w-full py-2.5 px-6 bg-[#4648D4] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#3533B0] transition-colors"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  formData: WizardFormData
  onPrev:   () => void
}

export default function ValidationEmailCGU({ formData, onPrev }: Props) {
  const { signIn } = useSignIn()

  const [checks, setChecks] = useState<Record<string, boolean>>({
    cgu: false, privacy: false, cookies: false, newsletter: false,
  })
  const toggleCheck = (id: string) =>
    setChecks(prev => ({ ...prev, [id]: !prev[id] }))

  const requiredChecked = CGU_ITEMS
    .filter(c => c.required)
    .every(c => checks[c.id])

  const [submitStatus,  setSubmitStatus]  = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [loadingStep,   setLoadingStep]   = useState('')
  const [erreur,        setErreur]        = useState('')
  const [openModal,     setOpenModal]     = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!signIn) return
    setSubmitStatus('loading')
    setErreur('')

    try {
      setLoadingStep('Création du compte…')
      const accountRes = await fetch('/api/inscription/compte', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom:     formData.step2.prenom,
          nom:        formData.step2.nom,
          email:      formData.step2.email,
          motDePasse: formData.step2.motDePasse,
          profil:     formData.profil,
          telephone:  formData.step2.telephone,
          fonction:   formData.step2.fonction || undefined,
        }),
      })
      const accountData = await accountRes.json()
      if (!accountRes.ok) throw new Error(accountData.error ?? 'Erreur lors de la création du compte')

      setLoadingStep('Authentification…')
      const { error: createError } = await signIn.create({
        strategy: 'ticket',
        ticket:   accountData.ticket as string,
      })
      if (createError) throw new Error(createError.message)

      if (signIn.status !== 'complete') {
        throw new Error(`Authentification incomplète (status: ${signIn.status ?? 'inconnu'})`)
      }

      const { error: finalizeError } = await signIn.finalize()
      if (finalizeError) throw new Error(finalizeError.message)

      if (formData.profil === 'particulier') {
        setLoadingStep('Enregistrement du profil…')
        const particulierRes = await fetch('/api/inscription/particulier', { method: 'POST' })
        if (!particulierRes.ok) {
          const d = await particulierRes.json()
          throw new Error(d.error ?? 'Erreur enregistrement profil particulier')
        }
      }

      if (formData.profil !== 'particulier' && formData.step3.siret) {
        setLoadingStep("Enregistrement de l'entreprise…")
        const endpoint = formData.profil === 'professionnel'
          ? '/api/inscription/apporteur'
          : '/api/inscription/entreprise'
        const companyRes = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siret: formData.step3.siret, ...formData.step3 }),
        })
        if (!companyRes.ok) {
          const d = await companyRes.json()
          const msg = d.error?.fieldErrors
            ? Object.values(d.error.fieldErrors).flat().join(', ')
            : (d.error ?? 'Erreur enregistrement entreprise')
          throw new Error(msg)
        }
      }

      if (formData.step4.iban) {
        setLoadingStep('Enregistrement des coordonnées bancaires…')
        const bankRes = await fetch('/api/inscription/banque', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomTitulaireIban: formData.step4.titulaire,
            iban:             formData.step4.iban,
            bic:              formData.step4.bic,
          }),
        })
        if (!bankRes.ok) {
          const d = await bankRes.json()
          throw new Error(d.error ?? 'Erreur enregistrement bancaire')
        }
      }

      if (formData.step4.ribFile) {
        setLoadingStep('Téléversement du RIB…')
        await uploadDocument(formData.step4.ribFile, 'RIB')
      }
      if (formData.step5.kbisFile) {
        setLoadingStep('Téléversement du K-Bis…')
        await uploadDocument(formData.step5.kbisFile, 'KYC_KBIS')
      }
      if (formData.step5.idFile) {
        setLoadingStep("Téléversement de la pièce d'identité…")
        await uploadDocument(formData.step5.idFile, 'KYC_IDENTITE')
      }

      setLoadingStep("Envoi de l'email de vérification…")
      const emailRes = await fetch('/api/inscription/verify-email', { method: 'POST' })
      if (!emailRes.ok) {
        const d = await emailRes.json()
        throw new Error(d.error ?? "Erreur lors de l'envoi de l'email")
      }

      setSubmitStatus('success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
      setErreur(msg)
      setSubmitStatus('error')
    } finally {
      setLoadingStep('')
    }
  }

  const handleResendEmail = async () => {
    setSubmitStatus('loading')
    setErreur('')
    try {
      const emailRes = await fetch('/api/inscription/verify-email', { method: 'POST' })
      if (!emailRes.ok) {
        const d = await emailRes.json()
        throw new Error(d.error ?? "Erreur lors de l'envoi de l'email")
      }
      setSubmitStatus('success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.'
      setErreur(msg)
      setSubmitStatus('error')
    }
  }

  const isLoading = submitStatus === 'loading'
  const isSuccess = submitStatus === 'success'

  return (
    <div className="min-h-screen bg-white">

      {openModal && <PolicyModal modalId={openModal} onClose={() => setOpenModal(null)} />}

      <header className="bg-white sticky top-0 z-100 shadow-[0_1px_0_#E2E8F0]">
        <div className="max-w-300 mx-auto px-16 h-16 flex items-center justify-between max-md:px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-[-0.5px] text-[#0F172A] no-underline">OPUS</Link>
          <button type="button" className="inline-flex items-center gap-1 text-sm text-[#64748B] border-none bg-transparent p-0 cursor-pointer hover:text-[#0F172A] transition-colors disabled:opacity-50" onClick={onPrev} disabled={isLoading} aria-label="Retour">
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
        <h1 className="text-[32px] font-bold text-[#0F172A] tracking-[-0.4px] mb-1.5 anim-fade-up anim-d100 max-md:text-[26px]">Validation Email &amp; CGU</h1>
        <p className="text-[15px] text-[#64748B] mb-9 anim-fade-up anim-d150">Acceptez nos conditions puis finalisez votre inscription</p>

        <div className="grid grid-cols-[1fr_360px] gap-12 items-start max-lg:grid-cols-1">

          <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-[14px] p-8 anim-fade-up anim-d200">

            {/* CGU */}
            <h2 className="text-[18px] font-bold text-[#0F172A] mb-5">Conditions &amp; Confidentialité</h2>
            <ul className="list-none p-0 m-0 flex flex-col gap-4">
              {CGU_ITEMS.map(item => (
                <li key={item.id}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={checks[item.id]}
                        onChange={() => toggleCheck(item.id)}
                        disabled={isLoading || isSuccess}
                      />
                      <div className="w-5 h-5 border-[1.5px] border-[#CBD5E1] rounded-[5px] bg-white peer-checked:bg-[#4648D4] peer-checked:border-[#4648D4] peer-focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] transition-all" />
                      {checks[item.id] && (
                        <IconCheckboxMark />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-[#0F172A] leading-[1.4]">
                        {item.label}
                        {item.required && <span className="text-[#4648D4] ml-0.5"> *</span>}
                      </span>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-[1.4]">{item.sub}</p>
                      {item.hasModal && (
                        <button
                          type="button"
                          className="mt-1 text-xs text-[#4648D4] bg-transparent border-none cursor-pointer p-0 underline hover:text-[#3533B0] transition-colors"
                          onClick={e => { e.preventDefault(); setOpenModal(item.id) }}
                        >
                          Lire le document
                        </button>
                      )}
                    </div>
                  </label>
                </li>
              ))}
            </ul>

            <div className="h-px bg-[#E2E8F0] my-7" />

            {/* Email */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <IconEmail className="w-5.5 h-5.5 text-[#4648D4]" />
                <h2 className="text-[18px] font-bold text-[#0F172A]">Vérification de votre email</h2>
              </div>

              {!isSuccess ? (
                <>
                  <p className="text-sm text-[#64748B] mb-5 leading-relaxed">
                    Cliquez sur le bouton ci-dessous pour finaliser votre inscription et recevoir un lien de vérification par email. Le lien est valable 24h.
                  </p>

                  {isLoading && loadingStep && (
                    <p className="text-[13px] text-[#6B7280] mt-2 text-center">{loadingStep}</p>
                  )}

                  <button
                    type="button"
                    className="mt-4 w-full py-3 px-7 bg-[#4648D4] text-white rounded-lg text-[15px] font-semibold cursor-pointer hover:bg-[#3533B0] transition-colors disabled:bg-[#A5B4FC] disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={!requiredChecked || isLoading}
                  >
                    {isLoading ? 'Finalisation en cours…' : 'Envoyer le lien de vérification'}
                  </button>

                  {!requiredChecked && !isLoading && (
                    <p className="text-xs text-[#6B7280] mt-2 text-center">
                      Acceptez les conditions obligatoires pour continuer
                    </p>
                  )}

                  {submitStatus === 'error' && (
                    <p className="text-[13px] text-red-600 mt-2 text-center">{erreur}</p>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[15px] font-semibold text-green-600 mb-2">✓ Email envoyé !</p>
                  <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                    Consultez votre boîte mail et <strong>cliquez sur le lien</strong> pour vérifier votre adresse.
                    Vous serez automatiquement redirigé vers le tableau de bord une fois votre email confirmé.
                  </p>
                  <div className="flex justify-end">
                    <button type="button"
                      className="inline-flex items-center gap-1.5 bg-transparent border-none text-[13px] font-medium text-[#4648D4] cursor-pointer p-0 hover:opacity-75 transition-opacity"
                      onClick={handleResendEmail}>
                      <IconRefresh />
                      Renvoyer le lien
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons navigation */}
            <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex gap-3">
              <button type="button"
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-white border-[1.5px] border-[#D1D5DB] rounded-lg text-[15px] font-semibold text-[#0F172A] cursor-pointer hover:border-[#64748B] hover:bg-gray-50 transition-all disabled:opacity-50"
                onClick={onPrev} disabled={isLoading}>
                <IconChevronLeft />
                Précédent
              </button>
            </div>

          </div>

          <StepSidebar steps={STEPS_LIST} />

        </div>
      </main>
    </div>
  )
}
