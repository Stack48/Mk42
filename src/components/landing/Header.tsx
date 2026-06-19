'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import IconMenuToggle from '@/components/icons/IconMenuToggle'

const NAV = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#temoignages',     label: 'Témoignages' },
  { href: '#prix',            label: 'Tarifs' },
  { href: '#faq',             label: 'FAQ' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] border-b border-[#E5E7EB] transition-colors duration-200 ${
      scrolled ? 'bg-white/95 backdrop-blur-[12px]' : 'bg-white'
    }`}>
      <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center gap-8">

        <Link href="/" className="no-underline shrink-0 flex items-center gap-1.5">
          <span className="font-extrabold text-[18px] text-[#111111] tracking-[-0.02em]">OPUS</span>
        </Link>

        <nav className="hidden md:flex gap-1 flex-1 justify-center">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href}
              className="px-3.5 py-1.5 text-sm font-medium text-[#374151] no-underline rounded-[6px] transition-[color,background] duration-150 hover:text-[#4648D4] hover:bg-[#EEEEFF]">
              {label}
            </a>
          ))}
        </nav>

        <Link href="/inscription"
          className="hidden md:inline-flex bg-[#4648D4] hover:bg-[#3533B0] text-white px-[18px] py-2 rounded-[7px] text-[13px] font-semibold no-underline shrink-0 transition-colors duration-150">
          Démo Gratuite
        </Link>

        <button className="ml-auto md:hidden bg-transparent border-none cursor-pointer p-2 text-[#111111]" onClick={() => setOpen(!open)}>
          <IconMenuToggle open={open} />
        </button>
      </div>

      {open && (
        <div className="border-t border-[#E5E7EB] bg-white px-6 pt-3 pb-5">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block py-[11px] text-[15px] font-medium text-[#374151] no-underline border-b border-[#E5E7EB]">
              {label}
            </a>
          ))}
          <Link href="/inscription"
            className="block mt-3.5 text-center bg-[#4648D4] text-white p-3 rounded-[7px] font-semibold no-underline text-sm">
            Démo Gratuite
          </Link>
        </div>
      )}
    </header>
  )
}
