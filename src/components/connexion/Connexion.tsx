'use client'

import { useState } from 'react'
import Link from 'next/link'
import IconCheckMini from '@/components/icons/IconCheckMini'
import IconArrowRight from '@/components/icons/IconArrowRight'

/* Classe partagée par les deux champs de saisie — identique pixel-perfect. */
const INPUT_CLASS =
  'h-[52px] w-full rounded-[10px] border-[1.5px] border-[#e2e4ea] bg-white px-4 ' +
  'text-[15px] text-[#111] outline-none ' +
  'transition-[border-color,box-shadow] duration-150 ease-in-out ' +
  'placeholder:text-[#c4c6d2] ' +
  'focus:border-[#4648d4] focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)]'

export default function Connexion() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /* TODO: logique d'authentification */
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6f8] max-md:flex-col">

      {/* ── PANNEAU GAUCHE (dark) ─────────────────────────────────── */}
      <aside className="flex w-[42%] shrink-0 flex-col rounded-r-[24px] bg-[#1a1a1a] px-12 py-10 animate-fade-in max-md:w-full max-md:rounded-r-none max-md:rounded-b-[20px] max-md:px-6 max-md:py-8">

        <Link
          href="/"
          className="text-[26px] font-extrabold tracking-[-0.5px] text-white no-underline animate-fade-up [animation-delay:0.05s]"
        >
          Opus
        </Link>

        <div className="my-auto py-12 max-md:my-0 max-md:pt-6 max-md:pb-2">
          <h2
            className="mb-6 text-[30px] font-bold leading-[1.25] tracking-[-0.3px] text-white animate-fade-up [animation-delay:0.12s] max-md:text-[22px]"
          >
            La conformité fiscale<br />
            de vos apports d&apos;affaires,<br />
            automatisée.
          </h2>
          <p
            className="text-[13.5px] leading-[1.7] text-[#8a8a8a] animate-fade-up [animation-delay:0.20s]"
          >
            Contrats horodatés · Signature électronique<br />
            Factures auto-générées · Export DAS2
          </p>
        </div>

      </aside>

      {/* ── PANNEAU DROIT (light) ─────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center px-16 py-12 max-md:px-6 max-md:py-10">
        <div className="w-full max-w-[520px]">

          <h1
            className="mb-2 text-[38px] font-extrabold tracking-[-0.8px] text-[#111] animate-fade-up [animation-delay:0.10s] max-md:text-[28px]"
          >
            Connexion
          </h1>

          <p
            className="mb-9 text-sm leading-[1.5] text-[#8a8a9a] animate-fade-up [animation-delay:0.16s]"
          >
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email ──────────────────────────────────────────────── */}
            <div
              className="mb-5 flex flex-col gap-1.5 animate-fade-up [animation-delay:0.22s]"
            >
              <label htmlFor="email" className="text-[13.5px] font-semibold text-[#111]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={INPUT_CLASS}
              />
            </div>

            {/* Mot de passe ───────────────────────────────────────── */}
            <div
              className="mb-5 flex flex-col gap-1.5 animate-fade-up [animation-delay:0.22s]"
            >
              <label htmlFor="password" className="text-[13.5px] font-semibold text-[#111]">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={INPUT_CLASS}
              />
            </div>

            {/* Checkbox + Mot de passe oublié ─────────────────────── */}
            <div
              className="mt-1 mb-7 flex items-center justify-between animate-fade-up [animation-delay:0.28s]"
            >
              <label className="flex cursor-pointer select-none items-center gap-2.5 text-[13.5px] text-[#444]">
                {/* Checkbox native cachée, remplacée par un span stylisé */}
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors duration-150 ease-in-out ${
                    rememberMe
                      ? 'border-[#4648d4] bg-[#4648d4]'
                      : 'border-[#c4c6d2] bg-white'
                  }`}
                >
                  {rememberMe && <IconCheckMini />}
                </span>
                Rester connecté
              </label>

              <Link
                href="/mot-de-passe-oublie"
                className="text-[13.5px] font-medium text-[#4648d4] no-underline transition-opacity duration-150 hover:opacity-75"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton Se connecter ────────────────────────────────── */}
            <button
              type="submit"
              className="mb-5 flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-[#4648d4] text-[16px] font-semibold tracking-[0.1px] text-white transition-[background-color,transform] duration-150 ease-in-out hover:bg-[#3533b0] active:scale-[0.99] animate-fade-up [animation-delay:0.32s]"
            >
              Se connecter
              <IconArrowRight />
            </button>

          </form>

          {/* Lien vers l'inscription ────────────────────────────── */}
          <p
            className="text-center text-[13.5px] text-[#8a8a9a] animate-fade-up [animation-delay:0.36s]"
          >
            Pas encore inscrit ?{' '}
            <Link
              href="/inscription"
              className="ml-1 font-semibold text-[#4648d4] no-underline transition-opacity duration-150 hover:opacity-75"
            >
              Créer un compte →
            </Link>
          </p>

        </div>
      </main>

    </div>
  )
}
