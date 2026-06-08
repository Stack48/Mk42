'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './Connexion.module.css'

export default function Connexion() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    /* TODO: logique d'authentification */
  }

  return (
    <div className={styles.page}>

      {/* ── PANNEAU GAUCHE ────────────────────────────────────── */}
      <aside className={styles.leftPanel}>
        <Link href="/" className={styles.logo}>Opus</Link>

        <div className={styles.leftContent}>
          <h2 className={styles.pitch}>
            La conformité fiscale<br />
            de vos apports d&apos;affaires,<br />
            automatisée.
          </h2>
          <p className={styles.features}>
            Contrats horodatés · Signature électronique<br />
            Factures auto-générées · Export DAS2
          </p>
        </div>
      </aside>

      {/* ── PANNEAU DROIT ─────────────────────────────────────── */}
      <main className={styles.rightPanel}>
        <div className={styles.formCard}>

          <h1 className={styles.heading}>Connexion</h1>
          <p className={styles.subheading}>
            Entrez vos identifiants pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Mot de passe */}
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Mot de passe</label>
              <input
                id="password"
                type="password"
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Options */}
            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                Rester connecté
              </label>
              <Link href="/mot-de-passe-oublie" className={styles.forgotLink}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton */}
            <button type="submit" className={styles.btnSubmit}>
              Se connecter
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

          </form>

          {/* Lien inscription */}
          <p className={styles.registerRow}>
            Pas encore inscrit ?
            <Link href="/inscription" className={styles.registerLink}>
              Créer un compte →
            </Link>
          </p>

        </div>
      </main>

    </div>
  )
}
