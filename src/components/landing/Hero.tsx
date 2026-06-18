'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardPreview from './DashboardPreview'

export default function Hero() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/inscription')
  }

  return (
    <section className="bg-white pt-[100px] pb-[72px] overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6">

        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5E7EB] bg-[#EEEEFF] text-[13px] font-medium text-[#4648D4]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="#4648D4">
              <path d="M7.833 1.167L2.917 7.583h4.25l-.834 5.25 5.25-6.416H7.25z"/>
            </svg>
            Découvrez tout ce qui peut être transformé avec les pros de votre entreprise
          </span>
        </div>

        <h1 className="text-center text-[clamp(36px,5vw,58px)] font-extrabold leading-[1.1] text-[#111111] tracking-[-0.03em] max-w-[820px] mx-auto mb-5">
          Simplifiez vos opérations.{' '}
          <br />
          Accélérez votre croissance.
        </h1>

        <p className="text-center text-base text-[#6B7280] leading-[1.7] max-w-[560px] mx-auto mb-9">
          Une plateforme SaaS tout-en-un pour rationaliser vos projets, automatiser vos ventes et fluidifier vos flux de travail pour toute entreprise du bâtiment.
        </p>

        <form onSubmit={handleSubmit} className="flex justify-center gap-2 mb-14 flex-wrap">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="px-4 py-[11px] rounded-lg text-sm border border-[#E5E7EB] outline-none w-60 text-[#111111] transition-[border-color] duration-150 focus:border-[#4648D4]"
          />
          <button type="submit"
            className="bg-[#4648D4] hover:bg-[#3533B0] text-white px-6 py-[11px] rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors duration-150">
            Démarrer maintenant
          </button>
        </form>

        <div className="max-w-[960px] mx-auto">
          <DashboardPreview />
        </div>

      </div>
    </section>
  )
}
