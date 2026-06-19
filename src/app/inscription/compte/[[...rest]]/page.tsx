/**
 * /inscription/compte  →  Création de compte Clerk
 * Accessible après la sélection du profil (/inscription).
 */
import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import IconLogo from '@/components/icons/IconLogo'
import IconCheckSquare from '@/components/icons/IconCheckSquare'
import IconLines from '@/components/icons/IconLines'
import IconPlus from '@/components/icons/IconPlus'

export const metadata: Metadata = {
  title: 'Opus — Créer un compte',
}

const FEATURES = [
  {
    icon: <IconCheckSquare />,
    title: 'Contrats légaux automatiques',
    desc: 'Générés et signés en quelques secondes, conformes au droit français.',
  },
  {
    icon: <IconLines />,
    title: 'DAS2 et factures en 1 clic',
    desc: "Export fiscal prêt à l'emploi, zéro risque de redressement.",
  },
  {
    icon: <IconPlus />,
    title: 'Coffre-fort sécurisé RGPD',
    desc: 'Tous vos documents archivés 10 ans, accessibles à tout moment.',
  },
]

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  return (
    <div className="flex min-h-screen">

      {/* Left panel — Clerk form */}
      <div className="flex-none w-full max-w-[520px] max-lg:max-w-full flex flex-col justify-center px-10 py-12 bg-[var(--opus-bg)]">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 no-underline">
            <span className="w-[30px] h-[30px] rounded-[7px] bg-[var(--opus-primary)] flex items-center justify-center">
              <IconLogo />
            </span>
            <span className="font-bold text-[17px] text-[var(--opus-ink)] tracking-[0.01em]">
              OPUS
            </span>
          </Link>
        </div>

        <div className="mb-7">
          <h1 className="text-[26px] font-bold text-[var(--opus-ink)] tracking-[-0.3px] mb-2">
            Créer votre compte
          </h1>
          <p className="text-[15px] text-[var(--opus-muted)] leading-[1.5]">
            Déjà inscrit ?{' '}
            <Link href="/connexion" className="text-[var(--opus-primary)] font-medium no-underline">
              Se connecter
            </Link>
          </p>
        </div>

        <SignUp unsafeMetadata={{ typeApporteur: type ?? 'particulier' }} />
      </div>

      {/* Right panel — marketing */}
      <div className="hidden lg:flex flex-col justify-center px-14 py-16 bg-[linear-gradient(145deg,#3533B0_0%,#4648D4_45%,#6669E0_100%)] relative overflow-hidden flex-1">
        <span aria-hidden="true" className="absolute bottom-[-40px] right-[-20px] text-[220px] font-black text-white/5 tracking-[-8px] select-none leading-none pointer-events-none">
          OPUS
        </span>

        <div className="relative z-[1] max-w-[440px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full bg-white/[0.12] border border-white/20 text-xs font-medium text-white/85 tracking-[0.04em] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7DD3FC] shrink-0" />
            Essai gratuit · Sans carte bancaire
          </span>

          <h2 className="text-[clamp(28px,3vw,40px)] font-extrabold text-white leading-[1.15] tracking-[-0.5px] mb-4">
            Simplifiez vos commissions.{' '}
            <span className="text-white/65">Évitez les redressements.</span>
          </h2>

          <p className="text-base text-white/70 leading-[1.65] mb-12">
            Opus automatise la conformité de vos apporteurs d&apos;affaires BTP — contrats, factures, DAS2 — en toute légalité.
          </p>

          <div className="flex flex-col gap-6 mb-12">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-[10px] bg-white/[0.12] flex items-center justify-center shrink-0 text-white">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white mb-0.5">{f.title}</p>
                  <p className="text-[13px] text-white/60 leading-[1.5]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-8 pt-8 border-t border-white/15">
            {[{ num: '500+', label: 'entreprises BTP' }, { num: '12 k', label: 'documents générés' }, { num: '98 %', label: 'de satisfaction' }].map(s => (
              <div key={s.label}>
                <p className="text-[22px] font-extrabold text-white leading-none">{s.num}</p>
                <p className="text-xs text-white/55 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
