// ── Easing curves ────────────────────────────────────────────────────────────
export const EASE_EXPO:    [number, number, number, number] = [0.16, 1, 0.3, 1]
export const EASE_POWER3:  [number, number, number, number] = [0.33, 1, 0.68, 1]
export const EASE_BACK:    [number, number, number, number] = [0.34, 1.56, 0.64, 1] // léger overshoot

// ── Spring presets ────────────────────────────────────────────────────────────
export const SPRING_SMOOTH    = { stiffness: 120, damping: 18, mass: 0.8 }
export const SPRING_SNAPPY    = { stiffness: 280, damping: 22, mass: 0.5 }
export const SPRING_MAGNETIC  = { stiffness: 130, damping: 13, mass: 0.9 }
export const SPRING_TILT      = { stiffness: 90,  damping: 20, mass: 0.7 }

// ── Fade-up reveal ────────────────────────────────────────────────────────────
export const fadeUpVariants = {
  hidden:  { opacity: 0, y: 36, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE_EXPO },
  },
}

// ── Clip-path mask reveal ─────────────────────────────────────────────────────
export const clipRevealVariants = {
  hidden:  { clipPath: 'inset(0 0 105% 0)', opacity: 0 },
  visible: {
    clipPath: 'inset(0 0 0% 0)', opacity: 1,
    transition: { duration: 0.75, ease: EASE_EXPO },
  },
}

// ── Stagger container ─────────────────────────────────────────────────────────
export const staggerContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
}

// ── Stagger child ─────────────────────────────────────────────────────────────
export const staggerItemVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: EASE_EXPO },
  },
}

// ── Shared viewport config ────────────────────────────────────────────────────
export const VIEWPORT = { once: true, margin: '-80px' } as const
