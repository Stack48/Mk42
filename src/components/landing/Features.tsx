'use client'
import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import {
  clipRevealVariants,
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
  EASE_POWER3,
  SPRING_TILT,
  VIEWPORT,
} from '@/lib/motion'

const C = {
  primary: '#4648D4', primaryDk: '#3533B0',
  primaryXL: '#EEEEFF', ink: '#111111',
  muted: '#6B7280', border: '#E5E7EB',
}

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6z"/>
        <polyline points="12 2 12 6 16 6"/>
        <line x1="8" y1="11" x2="12" y2="11"/>
        <line x1="8" y1="14" x2="10" y2="14"/>
      </svg>
    ),
    title: 'Contrats légaux en 2 clics',
    desc: 'Générez des contrats conformes au droit français avec signature électronique eIDAS.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="16" height="14" rx="2"/>
        <line x1="7" y1="10" x2="13" y2="10"/>
        <line x1="10" y1="7" x2="10" y2="13"/>
        <line x1="4" y1="6" x2="6" y2="6"/>
        <line x1="14" y1="6" x2="16" y2="6"/>
      </svg>
    ),
    title: 'DAS2 sans effort',
    desc: 'Déclaration annuelle générée automatiquement pour tous vos bénéficiaires.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="13" rx="2"/>
        <path d="M7 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>
        <line x1="7" y1="9" x2="13" y2="9"/>
        <line x1="7" y1="12" x2="10" y2="12"/>
      </svg>
    ),
    title: 'Factures automatiques',
    desc: 'Facture légale ou reçu de commission générés automatiquement, exportables en PDF.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L3 6v5c0 4 2.5 7.5 7 8.5 4.5-1 7-4.5 7-8.5V6z"/>
        <polyline points="7 10 9 12 13 8"/>
      </svg>
    ),
    title: 'Coffre-fort sécurisé',
    desc: 'Documents archivés 6 ans, accessibles immédiatement en cas de contrôle fiscal.',
  },
]

// ── Carte avec tilt 3D au hover (nécessite des hooks → composant séparé) ─────
function FeatureCard({ feature }: { feature: typeof FEATURES[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sRotX = useSpring(rotX, SPRING_TILT)
  const sRotY = useSpring(rotY, SPRING_TILT)

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const nx = (e.clientX - r.left)  / r.width  - 0.5
    const ny = (e.clientY - r.top)   / r.height - 0.5
    rotY.set( nx * 14)
    rotX.set(-ny * 9)
  }, [rotX, rotY])

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0)
  }, [rotX, rotY])

  return (
    // perspective sur le wrapper
    <div ref={ref} style={{ perspective: 700 }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        variants={staggerItemVariants}
        style={{
          rotateX: sRotX, rotateY: sRotY,
          transformStyle: 'preserve-3d',
          background: '#fff', borderRadius: 10, padding: '20px 18px',
          border: `1px solid ${C.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          cursor: 'default', willChange: 'transform',
        }}
        whileHover={{
          borderColor: C.primary,
          boxShadow: '0 20px 50px rgba(70,72,212,0.16)',
          transition: { duration: 0.25, ease: EASE_POWER3 },
        }}
      >
        {/* Icône — micro pop + rotation au hover de la carte */}
        <motion.div
          whileHover={{ scale: 1.15, rotate: -6 }}
          transition={{ duration: 0.28, ease: EASE_POWER3 }}
          style={{
            width: 38, height: 38, borderRadius: 8,
            background: C.primaryXL, color: C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          {feature.icon}
        </motion.div>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 6, lineHeight: 1.3 }}>
          {feature.title}
        </h3>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          {feature.desc}
        </p>
      </motion.div>
    </div>
  )
}

// ── Section Fonctionnalités ───────────────────────────────────────────────────
export default function Features() {
  return (
    <section id="fonctionnalites" style={{ background: '#fff', padding: 'clamp(60px,7vw,90px) 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header — clip reveal */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ overflow: 'hidden', marginBottom: 10 }}>
            <motion.p
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              style={{
                fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: C.primary,
                fontFamily: "'DM Mono', monospace", margin: 0,
              }}
            >
              Fonctionnalités
            </motion.p>
          </div>

          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              variants={clipRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              transition={{ delay: 0.1 }}
              style={{
                fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800,
                color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.2,
                maxWidth: 480, margin: 0,
              }}
            >
              Toutes les fonctionnalités, sans les maux de tête
            </motion.h2>
          </div>
        </div>

        {/* 2 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* Grille 2×2 — stagger + tilt 3D */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          >
            {FEATURES.map(f => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </motion.div>

          {/* Panneau droit — fade-up décalé */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            transition={{ delay: 0.3 }}
            style={{
              borderRadius: 14, overflow: 'hidden', background: '#F3F4F6',
              minHeight: 360, display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.primary}, #6669e0)`,
                margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 3h-8l-2 4h12z"/>
                  <circle cx="12" cy="13" r="2"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.primary, marginBottom: 8 }}>Secteur BTP</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>
                Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          transition={{ delay: 0.18 }}
          style={{ marginTop: 32, fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}
        >
          Parce que gérer son entreprise ne devrait pas ressembler à un contrôle fiscal.
        </motion.p>
      </div>

      <style>{`
        @media(max-width:860px){
          #fonctionnalites > div > div:last-child > div:first-child { grid-template-columns: 1fr !important; }
          #fonctionnalites > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
