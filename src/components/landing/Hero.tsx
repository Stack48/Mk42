'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import DashboardPreview from './DashboardPreview'
import { EASE_EXPO, EASE_POWER3, SPRING_MAGNETIC } from '@/lib/motion'

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
            {word}{i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </>
  )
}

function MagneticButton({ children, type }: { children: React.ReactNode; type?: 'submit' | 'button' }) {
  const ref = useRef<HTMLButtonElement>(null)
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
    x.set(0); y.set(0)
  }, [x, y])

  return (
    <motion.button
      ref={ref}
      type={type}
      style={{ x: sx, y: sy }}
      className="px-6 py-[11px] rounded-lg text-sm font-semibold border-none cursor-pointer text-white bg-opus-primary hover:bg-opus-primary-dk transition-colors duration-[180ms]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}

function TiltDashboard() {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sRotX = useSpring(rotX, { stiffness: 105, damping: 17, mass: 0.65 })
  const sRotY = useSpring(rotY, { stiffness: 105, damping: 17, mass: 0.65 })

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const nx = (e.clientX - r.left) / r.width  - 0.5
    const ny = (e.clientY - r.top)  / r.height - 0.5
    rotY.set( nx * 20)
    rotX.set(-ny * 13)
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
      <div ref={ref} className="[perspective:900px]" onMouseMove={onMove} onMouseLeave={onLeave}>
        <motion.div
          style={{ rotateX: sRotX, rotateY: sRotY, transformStyle: 'preserve-3d' }}
          className="relative"
        >
          <div className="rounded-2xl overflow-hidden shadow-[0_56px_130px_rgba(70,72,212,0.16),0_10px_32px_rgba(0,0,0,0.1)]">
            <DashboardPreview />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[52%] rounded-b-2xl pointer-events-none" style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 18%, rgba(255,255,255,0.14) 32%, rgba(255,255,255,0.32) 46%, rgba(255,255,255,0.55) 58%, rgba(255,255,255,0.74) 70%, rgba(255,255,255,0.88) 81%, rgba(255,255,255,0.96) 91%, #ffffff 100%)',
          }} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/inscription${email ? `?email=${encodeURIComponent(email)}` : ''}`)
  }

  return (
    <section id="hero" className="bg-white pt-[100px] pb-[72px] max-sm:pt-20 max-sm:pb-10">
      <div className="max-w-[1100px] mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, scale: 0.86, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_POWER3, delay: 0.05 }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-opus-primary-xl text-[13px] font-medium text-opus-primary">
            <motion.span
              animate={{ rotate: [0, 18, -12, 18, 0] }}
              transition={{ duration: 2, delay: 1.4, repeat: Infinity, repeatDelay: 5, ease: EASE_POWER3 }}
              className="inline-block leading-none"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7.833 1.167L2.917 7.583h4.25l-.834 5.25 5.25-6.416H7.25z"/>
              </svg>
            </motion.span>
            Découvrez tout ce qui peut être transformé avec les pros de votre entreprise
          </span>
        </motion.div>

        <h1 className="text-center text-[clamp(36px,5vw,58px)] font-extrabold leading-tight text-opus-ink tracking-[-0.03em] max-w-[820px] mx-auto mb-5 max-sm:text-[clamp(28px,8vw,38px)]">
          <SplitText text="Simplifiez vos opérations." baseDelay={0.18} />
          <br />
          <SplitText text="Accélérez votre croissance." baseDelay={0.42} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.95, ease: EASE_EXPO, delay: 0.78 }}
          className="text-center text-base text-gray-500 leading-[1.7] max-w-[560px] mx-auto mb-9"
        >
          Une plateforme SaaS tout-en-un pour rationaliser vos projets, automatiser vos ventes
          et fluidifier vos flux de travail pour toute entreprise du bâtiment.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_EXPO, delay: 0.94 }}
          className="flex justify-center gap-2 mb-14 flex-wrap max-sm:flex-col max-sm:items-stretch max-sm:px-1"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="px-4 py-[11px] rounded-lg text-sm border border-gray-200 outline-none w-60 text-opus-ink transition-[border-color,box-shadow] duration-200 focus:border-opus-primary focus:shadow-[0_0_0_3px_#EEEEFF] max-sm:w-full box-border"
          />
          <MagneticButton type="submit">Démarrer maintenant</MagneticButton>
        </motion.form>

        <div className="max-w-[960px] mx-auto relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: EASE_EXPO, delay: 0.5 }}
            className="absolute top-[5%] left-0 right-0 h-[82%] pointer-events-none z-0"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(70,72,212,0.24) 0%, rgba(70,72,212,0.08) 50%, transparent 72%)' }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.2, ease: EASE_EXPO, delay: 0.78 }}
            className="absolute top-[12%] left-0 right-0 h-[55%] blur-[6px] pointer-events-none z-0"
            style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(100,104,228,0.16) 0%, transparent 58%)' }}
          />
          <div className="relative z-[1]">
            <TiltDashboard />
          </div>
        </div>

      </div>
    </section>
  )
}
