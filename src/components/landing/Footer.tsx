'use client'

import Link from 'next/link'
import s from '@/styles/landing/Footer.module.css'

function OpusIcon() {
  return (
    <svg width="24" height="22" viewBox="33 66 22 22" fill="none" aria-hidden="true" className="block shrink-0">
      <path d="M44 67L34 72L44 77L54 72L44 67Z M34 82L44 87L54 82H34Z M34 77L44 82L54 77H34Z" fill="#4648D4" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className={`${s.footer} bg-white flex flex-col md:min-h-[540px] box-border`}>

      <div className="relative z-[1] flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-10 pt-10 md:pt-14 pb-0 flex flex-col md:flex-row md:justify-between md:items-stretch gap-10 box-border">

        <div className="flex flex-col gap-6 md:gap-0 md:justify-between md:w-[255px] md:pb-8 w-full">
          <Link href="/" aria-label="Accueil Opus" className="flex md:hidden flex-row items-center gap-[9px] no-underline">
            <OpusIcon />
            <span className="text-base font-extrabold text-opus-ink tracking-[0.04em] leading-none">
              OPUS
            </span>
          </Link>
          <p className="text-[13px] font-normal leading-[1.7] text-opus-text m-0">
            Nous fournissons une plateforme rationalisée
            pour les entreprises du bâtiment de toute envergure.
          </p>
          <Link href="/" aria-label="Accueil Opus" className="hidden md:flex flex-row items-center gap-[9px] no-underline">
            <OpusIcon />
            <span className="text-base font-extrabold text-opus-ink tracking-[0.04em] leading-none">
              OPUS
            </span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-10 md:gap-20 items-start md:pb-8">

          <div className="min-w-[120px]">
            <p className="text-[11px] font-bold tracking-[0.13em] uppercase text-opus-ink m-0 mb-4">Menu</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li><Link href="/"                 className="text-[13px] font-normal text-opus-primary no-underline block">Accueil</Link></li>
              <li><Link href="/#about"           className="text-[13px] font-normal text-opus-text no-underline block">À propos</Link></li>
              <li><Link href="/#fonctionnalites" className="text-[13px] font-normal text-opus-text no-underline block">Fonctionnalités</Link></li>
              <li><Link href="/blog"             className="text-[13px] font-normal text-opus-text no-underline block">Blog</Link></li>
              <li><Link href="/contact"          className="text-[13px] font-normal text-opus-text no-underline block">Contact</Link></li>
            </ul>
          </div>

          <div className="min-w-[120px]">
            <p className="text-[11px] font-bold tracking-[0.13em] uppercase text-opus-ink m-0 mb-4">Réseaux</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {['Instagram','Facebook','LinkedIn','Twitter'].map(name => (
                <li key={name}>
                  <a
                    href={`https://${name.toLowerCase()}.com`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[13px] font-normal text-opus-text underline underline-offset-[3px] decoration-opus-text/40 block"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-[1] px-6 md:px-10 box-border mt-8 md:mt-0">
        <div className="max-w-[1200px] mx-auto">
          <div className="h-px bg-[#E4ECF1]" />
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-[18px] pb-6 gap-3 md:gap-0 items-start">
            <p className="text-[13px] font-normal text-opus-muted m-0">
              © 2026 OPUS. Tous droits réservés.
            </p>
            <ul className="flex flex-wrap gap-4 md:gap-7 list-none p-0 m-0">
              {[
                ['CGU',              '/cgu'],
                ['Mentions Légales', '/mentions-legales'],
                ['Confidentialité',  '/confidentialite'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] font-normal text-opus-muted no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </footer>
  )
}
