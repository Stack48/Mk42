'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const id = href.replace('#', '')
    const target = document.getElementById(id)
    if (!target) return
    const top = target.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] border-b border-gray-200 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-md' : 'bg-white'}`}>
      <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center gap-8">

        <Link href="/" className="no-underline shrink-0 flex items-center gap-1.5">
          <span className="font-extrabold text-[18px] text-opus-ink tracking-tight">OPUS</span>
        </Link>

        <nav className="hidden md:flex gap-1 flex-1 justify-center">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href}
              onClick={e => smoothScroll(e, href)}
              className="px-3.5 py-1.5 text-sm font-medium text-gray-700 no-underline rounded-md transition-colors duration-150 hover:text-opus-primary hover:bg-opus-primary-xl"
            >{label}</a>
          ))}
        </nav>

        <Link href="/inscription"
          className="hidden md:inline-flex bg-opus-primary hover:bg-opus-primary-dk text-white px-[18px] py-2 rounded-[7px] text-[13px] font-semibold no-underline shrink-0 transition-colors duration-150"
        >
          Démo Gratuite
        </Link>

        <button
          className="ml-auto md:hidden bg-transparent border-none cursor-pointer p-2 text-opus-ink"
          onClick={() => setOpen(!open)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            {open
              ? (<><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></>)
              : (<><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="11" x2="17" y2="11"/><line x1="3" y1="16" x2="17" y2="16"/></>)}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white px-6 pb-5 pt-3">
          {NAV.map(({ href, label }) => (
            <a key={href} href={href}
              onClick={e => { smoothScroll(e, href); setOpen(false) }}
              className="block py-[11px] text-[15px] font-medium text-gray-700 no-underline border-b border-gray-200"
            >{label}</a>
          ))}
          <Link href="/inscription"
            className="block mt-3.5 text-center bg-opus-primary text-white py-3 rounded-[7px] font-semibold no-underline text-sm"
          >
            Démo Gratuite
          </Link>
        </div>
      )}
    </header>
  )
}
