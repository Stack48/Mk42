import Link from 'next/link'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: "Opus — Opportunité soumise",
}

export default function ConfirmationPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Animated check */}
        <svg
          className={styles.checkCircle}
          viewBox="0 0 72 72"
          aria-hidden="true"
        >
          <circle
            className={styles.circleTrack}
            cx="36" cy="36" r="30"
          />
          <circle
            className={styles.circleFill}
            cx="36" cy="36" r="30"
            transform="rotate(-90 36 36)"
          />
          <path
            className={styles.checkMark}
            d="M22 36l10 10 18-18"
          />
        </svg>

        <h1 className={styles.title}>Opportunité soumise !</h1>
        <p className={styles.subtitle}>
          L'entreprise a été notifiée et reviendra vers vous sous 48h.
        </p>

        <Link href="/opportunites" className={styles.btnPrimary}>
          Voir mes opportunités
        </Link>
        <Link href="/opportunites/nouvelle" className={styles.linkSecondary}>
          Soumettre une nouvelle opportunité
        </Link>
      </div>
    </div>
  )
}
