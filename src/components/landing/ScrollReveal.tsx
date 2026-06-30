'use client'
import { motion } from 'framer-motion'
import { fadeUpVariants, VIEWPORT } from '@/lib/motion'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  amount?: number
}

export default function ScrollReveal({ children, className = '', delay = 0, amount = 0.08 }: Props) {
  const variants = {
    hidden: fadeUpVariants.hidden,
    visible: {
      ...fadeUpVariants.visible,
      transition: {
        ...(fadeUpVariants.visible as { transition: object }).transition,
        delay,
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...VIEWPORT, amount }}
    >
      {children}
    </motion.div>
  )
}
