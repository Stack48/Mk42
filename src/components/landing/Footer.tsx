'use client'

import Link from 'next/link'
import s from './Footer.module.css'
import IconOpusFooter from '@/components/icons/IconOpusFooter'

export default function Footer() {
  return (
    <footer className={`${s.footer} bg-white box-border flex flex-col min-h-[540px]`}>

      <div className="relative z-[1] flex-1 max-w-[1200px] mx-auto w-full px-10 pt-14 flex justify-between items-stretch box-border">

        <div className="flex flex-col justify-between w-[255px] pb-8">
          <p className="text-[13px] font-normal leading-[1.7] text-[#2A3A48] m-0">
            Nous fournissons une plateforme rationalisée
            pour les entreprises du bâtiment de toute envergure.
          </p>

          <Link href="/" aria-label="Accueil Opus" className="flex flex-row items-center gap-[9px] no-underline">
            <IconOpusFooter />
            <span className="text-base font-extrabold text-[#131B23] tracking-[0.04em] leading-none">
              OPUS
            </span>
          </Link>
        </div>

        <div className="flex gap-20 items-start pb-8">

          <div>
            <p className="text-[11px] font-bold tracking-[0.13em] uppercase text-[#131B23] m-0 mb-4">Menu</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li><Link href="/"                 className="text-[13px] font-normal text-[#4648D4] no-underline block">Accueil</Link></li>
              <li><Link href="/#about"           className="text-[13px] font-normal text-[#2A3A48] no-underline block">À propos</Link></li>
              <li><Link href="/#fonctionnalites" className="text-[13px] font-normal text-[#2A3A48] no-underline block">Fonctionnalités</Link></li>
              <li><Link href="/blog"             className="text-[13px] font-normal text-[#2A3A48] no-underline block">Blog</Link></li>
              <li><Link href="/contact"          className="text-[13px] font-normal text-[#2A3A48] no-underline block">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.13em] uppercase text-[#131B23] m-0 mb-4">Menu</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li><Link href="/"       className="text-[13px] font-normal text-[#2A3A48] no-underline block">Accueil</Link></li>
              <li><Link href="/#about" className="text-[13px] font-normal text-[#2A3A48] no-underline block">À propos</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.13em] uppercase text-[#131B23] m-0 mb-4">Menu</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li><Link href="/" className="text-[13px] font-normal text-[#2A3A48] no-underline block">Accueil</Link></li>
            </ul>

            <p className="text-[11px] font-bold tracking-[0.13em] uppercase text-[#131B23] mt-6 mb-3.5">Autres</p>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {['Instagram','Facebook','LinkedIn','Twitter'].map(name => (
                <li key={name}>
                  <a
                    href={`https://${name.toLowerCase()}.com`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[13px] font-normal text-[#2A3A48] underline underline-offset-[3px] decoration-[rgba(42,58,72,0.4)] block"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <div className="relative z-[1] px-10 box-border">
        <div className="max-w-[1200px] mx-auto">
          <div className="h-px bg-[#E4ECF1]" />
          <div className="flex justify-between items-center py-[18px] pb-6">
            <p className="text-[13px] font-normal text-[#5A6E7C] m-0">
              © 2026 OPUS. Tous droits réservés.
            </p>
            <ul className="flex gap-7 list-none p-0 m-0">
              {[
                ['CGU',              '/cgu'],
                ['Mentions Légales', '/mentions-legales'],
                ['Confidentialité',  '/confidentialite'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[13px] font-normal text-[#5A6E7C] no-underline">
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
