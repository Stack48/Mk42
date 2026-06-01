'use client'
import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3
}

export default function ScrollReveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.08 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const delayClass = delay > 0 ? ` scroll-reveal-delay-${delay}` : ''

  return (
    <div ref={ref} className={`scroll-reveal${delayClass} ${className}`}>
      {children}
    </div>
  )
}
