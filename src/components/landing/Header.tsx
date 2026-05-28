'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const NAV = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '#prix', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        insetInline: 0,
        zIndex: 100,
        backdropFilter: scrolled ? 'blur(12px) saturate(1.4)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px) saturate(1.4)' : 'none',
        backgroundColor: scrolled ? 'rgba(249,252,255,0.82)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? '#D4E6F2' : 'transparent'}`,
        transition: 'background 200ms, border-color 200ms, backdrop-filter 200ms',
      }}
    >
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        height: '64px', display: 'flex', alignItems: 'center', gap: '24px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            width: '30px', height: '30px', borderRadius: '7px',
            backgroundColor: 'var(--opus-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white" />
              <rect x="9" y="2.5" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55" />
              <rect x="2.5" y="9" width="4.5" height="4.5" rx="1.2" fill="white" fillOpacity="0.55" />
              <rect x="9" y="9" width="4.5" height="4.5" rx="1.2" fill="white" />
            </svg>
          </span>
          <span style={{ fontWeight: 700, fontSize: '17px', color: 'var(--opus-ink)', letterSpacing: '0.01em' }}>
            OPUS
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' }}
          className="hidden md:flex"
        >
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                padding: '7px 14px',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--opus-text)',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'color 150ms, background 150ms',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget
                t.style.color = 'var(--opus-primary)'
                t.style.background = 'var(--opus-bg-tint)'
              }}
              onMouseLeave={e => {
                const t = e.currentTarget
                t.style.color = 'var(--opus-text)'
                t.style.background = 'transparent'
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/inscription"
          className="hidden md:inline-flex"
          style={{
            backgroundColor: 'var(--opus-primary)',
            color: 'white',
            padding: '9px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'background 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--opus-primary-dk)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--opus-primary)')}
        >
          Démo Gratuit
        </Link>

        {/* Mobile burger */}
        <button
          className="ml-auto md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--opus-ink)' }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            {open ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" />
                <line x1="18" y1="4" x2="4" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" />
                <line x1="3" y1="12" x2="19" y2="12" />
                <line x1="3" y1="17" x2="19" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          borderTop: '1px solid var(--opus-border)',
          backgroundColor: 'rgba(249,252,255,0.97)',
          backdropFilter: 'blur(12px)',
          padding: '12px 24px 20px',
        }}>
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '12px 0', fontSize: '16px', fontWeight: 500,
                color: 'var(--opus-text)', textDecoration: 'none',
                borderBottom: '1px solid var(--opus-border)',
              }}
            >
              {label}
            </a>
          ))}
          <Link
            href="/inscription"
            style={{
              display: 'block', marginTop: '16px', textAlign: 'center',
              backgroundColor: 'var(--opus-primary)', color: 'white',
              padding: '12px', borderRadius: '8px', fontWeight: 600,
              textDecoration: 'none', fontSize: '15px',
            }}
          >
            Démo Gratuit
          </Link>
        </div>
      )}
    </header>
  )
}
