'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const C = {
  primary: '#4648D4',
  primaryDk: '#3533B0',
  ink: '#111111',
  text: '#374151',
  border: '#E5E7EB',
  bgTint: '#EEEEFF',
}

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

  /* Scroll fluide vers une ancre en compensant la hauteur de la navbar */
  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const id = href.replace('#', '')
    const target = document.getElementById(id)
    if (!target) return
    const offset = 72 // hauteur navbar (60px) + 12px de respiration
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: `1px solid ${scrolled ? C.border : C.border}`,
      transition: 'background 200ms',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 60, display: 'flex', alignItems: 'center', gap: 32,
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: C.ink, letterSpacing: '-0.02em' }}>OPUS</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex" style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
          {NAV.map(({ href, label }) => (
            <a key={href} href={href}
              onClick={e => smoothScroll(e, href)}
              style={{
                padding: '6px 14px', fontSize: 14, fontWeight: 500,
                color: C.text, textDecoration: 'none', borderRadius: 6,
                transition: 'color 150ms, background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.bgTint }}
              onMouseLeave={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = 'transparent' }}
            >{label}</a>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/inscription" className="hidden md:inline-flex" style={{
          background: C.primary, color: '#fff',
          padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600,
          textDecoration: 'none', flexShrink: 0, transition: 'background 150ms',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = C.primaryDk)}
          onMouseLeave={e => (e.currentTarget.style.background = C.primary)}
        >
          Démo Gratuite
        </Link>

        {/* Burger */}
        <button className="ml-auto md:hidden" onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: C.ink }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            {open
              ? (<><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></>)
              : (<><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="11" x2="17" y2="11"/><line x1="3" y1="16" x2="17" y2="16"/></>)}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, background: '#fff', padding: '12px 24px 20px' }}>
          {NAV.map(({ href, label }) => (
            <a key={href} href={href}
              onClick={e => { smoothScroll(e, href); setOpen(false) }}
              style={{
                display: 'block', padding: '11px 0', fontSize: 15, fontWeight: 500,
                color: C.text, textDecoration: 'none', borderBottom: `1px solid ${C.border}`,
              }}
            >{label}</a>
          ))}
          <Link href="/inscription" style={{
            display: 'block', marginTop: 14, textAlign: 'center',
            background: C.primary, color: '#fff',
            padding: 12, borderRadius: 7, fontWeight: 600, textDecoration: 'none', fontSize: 14,
          }}>Démo Gratuite</Link>
        </div>
      )}
    </header>
  )
}
