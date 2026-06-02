'use client'
import { motion } from 'framer-motion'
import {
  clipRevealVariants,
  staggerContainerVariants,
  staggerItemVariants,
  EASE_POWER3,
  VIEWPORT,
} from '@/lib/motion'

const C = { primary: '#4648D4', ink: '#111111', text: '#374151', muted: '#6B7280', border: '#E5E7EB' }

const TESTIMONIALS = [
  {
    name: 'Marc G.', role: 'Agent immobilier, Apporteur pro',
    quote: "Opus m'a permis d'automatiser toute ma gestion de commissions. Je passe maintenant 10x moins de temps sur la paperasse et mes clients apporteurs sont bien mieux servis.",
    initials: 'MG', bg: '#EEEEFF', color: '#4648D4',
  },
  {
    name: 'Sophie N.', role: 'Cadre, Apporteuse particulière',
    quote: "La plateforme est tellement intuitive. En quelques clics j'ai pu générer tous mes documents légaux et les partager avec mon entreprise partenaire.",
    initials: 'SN', bg: '#D8F0E6', color: '#15724A',
  },
  {
    name: 'Jean-Pierre T.', role: 'Directeur Commercial, Groupe BTP',
    quote: "Nous utilisons Opus pour gérer l'ensemble de notre réseau d'apporteurs. La fonctionnalité DAS2 automatique nous a économisé des heures de travail lors de la déclaration annuelle.",
    initials: 'JP', bg: '#FEF3C7', color: '#92400E',
  },
]

function Stars() {
  return (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill="#F59E0B">
          <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.7 4.08L8 10.4l-3.7 2.1.7-4.08-3-2.92 4.15-.75z"/>
        </svg>
      ))}
    </span>
  )
}

export default function Testimonials() {
  return (
    <section id="temoignages-clients" style={{ background: '#fff', padding: 'clamp(60px,7vw,90px) 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 64, alignItems: 'start' }}>

          {/* Colonne gauche sticky — clip reveal */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ overflow: 'hidden', marginBottom: 20 }}>
              <motion.h2
                variants={clipRevealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}
              >
                Success<br />Stories.
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Stars />
                <span style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>4.9/5</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Basé sur +200 avis de professionnels du bâtiment qui ont transformé leur gestion des commissions avec OPUS.
              </p>
            </motion.div>
          </div>

          {/* Cartes témoignages — stagger */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {TESTIMONIALS.map(t => (
              <motion.div
                key={t.name}
                variants={staggerItemVariants}
                whileHover={{
                  y: -4,
                  boxShadow: '0 16px 40px rgba(70,72,212,0.12)',
                  transition: { duration: 0.28, ease: EASE_POWER3 },
                }}
                style={{
                  background: '#fff', border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '22px 24px',
                  willChange: 'transform',
                }}
              >
                <Stars />
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: '12px 0', fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: t.bg, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`@media(max-width:768px){section [style*="280px 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </section>
  )
}
