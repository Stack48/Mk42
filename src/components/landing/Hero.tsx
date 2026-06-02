'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import DashboardPreview from './DashboardPreview'
import { EASE_EXPO, EASE_POWER3, SPRING_MAGNETIC, SPRING_TILT } from '@/lib/motion'

const C = {
  primary: '#4648D4', primaryDk: '#3533B0',
  primaryXL: '#EEEEFF', ink: '#111111',
  muted: '#6B7280', border: '#E5E7EB',
}

// ── Word-by-word clip reveal ──────────────────────────────────────────────────
function SplitText({ text, baseDelay = 0 }: { text: string; baseDelay?: number }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '115%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.82, ease: EASE_EXPO, delay: baseDelay + i * 0.075 }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </>
  )
}

// ── Bouton magnétique avec spring physics ─────────────────────────────────────
function MagneticButton({ children, type }: { children: React.ReactNode; type?: 'submit' | 'button' }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, SPRING_MAGNETIC)
  const sy = useSpring(y, SPRING_MAGNETIC)

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width / 2)) * 0.38)
    y.set((e.clientY - (r.top  + r.height / 2)) * 0.38)
  }, [x, y])

  const onLeave = useCallback(() => {
    x.set(0); y.set(0); setHovered(false)
  }, [x, y])

  return (
    <motion.button
      ref={ref}
      type={type}
      style={{
        x: sx, y: sy,
        background: hovered ? C.primaryDk : C.primary,
        color: '#fff', padding: '11px 24px', borderRadius: 8,
        fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
        transition: 'background 180ms',
      }}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

// ── Dashboard avec tilt parallax 3D + fondu bas ───────────────────────────────
function TiltDashboard() {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  // springs légèrement plus réactifs pour suivre le tilt amplifié
  const sRotX = useSpring(rotX, { stiffness: 105, damping: 17, mass: 0.65 })
  const sRotY = useSpring(rotY, { stiffness: 105, damping: 17, mass: 0.65 })

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const nx = (e.clientX - r.left) / r.width  - 0.5
    const ny = (e.clientY - r.top)  / r.height - 0.5
    rotY.set( nx * 20)   // +amplifié (était 10)
    rotX.set(-ny * 13)   // +amplifié (était 6)
  }, [rotX, rotY])

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0)
  }, [rotX, rotY])

  return (
    <motion.div
      initial={{ opacity: 0, y: 72, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.2, ease: EASE_EXPO, delay: 0.7 }}
    >
      <div ref={ref} style={{ perspective: 900 }} onMouseMove={onMove} onMouseLeave={onLeave}>
        <motion.div
          style={{
            rotateX: sRotX,
            rotateY: sRotY,
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {/* Dashboard */}
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 56px 130px rgba(70,72,212,0.16), 0 10px 32px rgba(0,0,0,0.1)',
          }}>
            <DashboardPreview />
          </div>

          {/* Fondu bas — 9 stops pour une courbe quasi-sinusoïdale, pas de coupure sèche */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '52%',
            borderRadius: '0 0 16px 16px',
            pointerEvents: 'none',
            background: [
              'linear-gradient(to bottom,',
              '  rgba(255,255,255,0)    0%,',
              '  rgba(255,255,255,0.04) 18%,',
              '  rgba(255,255,255,0.14) 32%,',
              '  rgba(255,255,255,0.32) 46%,',
              '  rgba(255,255,255,0.55) 58%,',
              '  rgba(255,255,255,0.74) 70%,',
              '  rgba(255,255,255,0.88) 81%,',
              '  rgba(255,255,255,0.96) 91%,',
              '  #ffffff               100%',
              ')',
            ].join(''),
          }} />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/inscription')
  }

  return (
    <section style={{ background: '#fff', paddingTop: 100, paddingBottom: 72 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_POWER3, delay: 0.05 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            border: `1px solid ${C.border}`, background: C.primaryXL,
            fontSize: 13, fontWeight: 500, color: C.primary,
          }}>
            {/* Icône qui clignote doucement en boucle */}
            <motion.span
              animate={{ rotate: [0, 18, -12, 18, 0] }}
              transition={{ duration: 2, delay: 1.4, repeat: Infinity, repeatDelay: 5, ease: EASE_POWER3 }}
              style={{ display: 'inline-block', lineHeight: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={C.primary}>
                <path d="M7.833 1.167L2.917 7.583h4.25l-.834 5.25 5.25-6.416H7.25z"/>
              </svg>
            </motion.span>
            Découvrez tout ce qui peut être transformé avec les pros de votre entreprise
          </span>
        </motion.div>

        {/* H1 — révélation mot par mot */}
        <h1 style={{
          textAlign: 'center',
          fontSize: 'clamp(36px, 5vw, 58px)',
          fontWeight: 800, lineHeight: 1.18,
          color: C.ink, letterSpacing: '-0.03em',
          maxWidth: 820, margin: '0 auto 20px',
        }}>
          <SplitText text="Simplifiez vos opérations." baseDelay={0.18} />
          <br />
          <SplitText text="Accélérez votre croissance." baseDelay={0.42} />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.95, ease: EASE_EXPO, delay: 0.78 }}
          style={{
            textAlign: 'center', fontSize: 16,
            color: C.muted, lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 36px',
          }}
        >
          Une plateforme SaaS tout-en-un pour rationaliser vos projets, automatiser vos ventes
          et fluidifier vos flux de travail pour toute entreprise du bâtiment.
        </motion.p>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_EXPO, delay: 0.94 }}
          style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 56, flexWrap: 'wrap' }}
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              padding: '11px 16px', borderRadius: 8, fontSize: 14,
              border: `1px solid ${C.border}`, outline: 'none',
              width: 240, color: C.ink,
              transition: 'border-color 200ms, box-shadow 200ms',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = C.primary
              e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primaryXL}`
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = C.border
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <MagneticButton type="submit">Démarrer maintenant</MagneticButton>
        </motion.form>

        {/* Dashboard tilt 3D + orbes décoratifs */}
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>

          {/* ── Glow principal : left:0 right:0 + at 50% 50% = symétrie garantie ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: EASE_EXPO, delay: 0.5 }}
            style={{
              position: 'absolute',
              top: '5%', left: 0, right: 0,
              height: '82%',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(70,72,212,0.24) 0%, rgba(70,72,212,0.08) 50%, transparent 72%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* ── Halo secondaire plus concentré, même axe central ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.2, ease: EASE_EXPO, delay: 0.78 }}
            style={{
              position: 'absolute',
              top: '12%', left: 0, right: 0,
              height: '55%',
              background: 'radial-gradient(ellipse at 50% 42%, rgba(100,104,228,0.16) 0%, transparent 58%)',
              filter: 'blur(6px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Dashboard au premier plan */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <TiltDashboard />
          </div>
        </div>

      </div>
    </section>
  )
}
