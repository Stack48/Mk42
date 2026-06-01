'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PROFILES = [
  {
    id: 'particulier',
    title: 'Rapporteur particulier',
    desc: "Vous recommandez occasionnellement des artisans à votre entourage.",
    features: ["Pas besoin de SIRET", "Régime fiscal simplifié", "Reçu d'honoraires"],
  },
  {
    id: 'professionnel',
    title: 'Rapporteur professionnel',
    desc: "Agent immobilier, courtier, indépendant avec activité régulière.",
    features: ['SIRET requis', 'Facturation pro', 'Tableau de bord avancé'],
  },
  {
    id: 'entreprise',
    title: 'Entreprise BTP',
    desc: "Vous recevez des opportunités et payez des commissions.",
    features: ['SIRET requis', 'Multi-utilisateurs', 'Export DAS2 / FEC'],
  },
] as const

type ProfileId = (typeof PROFILES)[number]['id']

interface CardProps {
  profile: (typeof PROFILES)[number]
  isSelected: boolean
  onSelect: () => void
}

function ProfileCard({ profile, isSelected, onSelect }: CardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={profile.title}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#fff',
        border: `1.5px solid ${isSelected ? 'var(--opus-primary)' : '#E2EDF5'}`,
        borderRadius: '18px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(34,116,165,.18), 0 4px 24px rgba(34,116,165,.13)'
          : hovered
          ? '0 4px 24px rgba(34,116,165,.13)'
          : '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
        transition: 'border-color 200ms ease, box-shadow 200ms ease',
      }}
    >
      <div aria-hidden="true" style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#BDD5EA',
        flexShrink: 0,
        marginBottom: '24px',
      }} />

      <h2 style={{
        fontSize: '19px',
        fontWeight: 700,
        color: 'var(--opus-ink)',
        lineHeight: 1.25,
        marginBottom: '8px',
      }}>
        {profile.title}
      </h2>

      <p style={{
        fontSize: '14px',
        fontWeight: 400,
        color: 'var(--opus-muted)',
        lineHeight: 1.6,
        marginBottom: '24px',
      }}>
        {profile.desc}
      </p>

      <ul
        aria-label="Caractéristiques"
        style={{
          flex: 1,
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          listStyle: 'none',
          padding: 0,
        }}
      >
        {profile.features.map(f => (
          <li key={f} style={{
            fontSize: '14px',
            color: 'var(--opus-text)',
            lineHeight: 1.5,
            paddingLeft: '16px',
            position: 'relative',
          }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: 0 }}>•</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        aria-label={`Choisir le profil ${profile.title}`}
        onClick={e => { e.stopPropagation(); onSelect() }}
        style={{
          width: '100%',
          padding: '11px 16px',
          border: '1.5px solid var(--opus-primary)',
          borderRadius: '6px',
          backgroundColor: isSelected
            ? 'var(--opus-primary)'
            : hovered
            ? 'var(--opus-primary-xl)'
            : 'transparent',
          color: isSelected ? '#fff' : 'var(--opus-primary)',
          fontSize: '14px',
          fontWeight: 600,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'background-color 200ms ease, color 200ms ease',
        }}
      >
        {isSelected ? 'Profil sélectionné ✓' : 'Choisir ce profil'}
      </button>
    </article>
  )
}

export default function ProfileCards() {
  const [selected, setSelected] = useState<ProfileId | null>(null)
  const router = useRouter()

  return (
    <div style={{ paddingTop: '48px', paddingBottom: '48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--opus-primary)',
          letterSpacing: '0.01em',
          marginBottom: '16px',
        }}>
          Étape 1 sur 6
        </p>

        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 700,
          color: 'var(--opus-ink)',
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
          marginBottom: '8px',
        }}>
          Quel est votre profil&nbsp;?
        </h1>

        <p style={{
          fontSize: '15px',
          fontWeight: 400,
          color: 'var(--opus-muted)',
          lineHeight: 1.5,
          marginBottom: '40px',
        }}>
          Vous pourrez modifier ces informations plus tard.
        </p>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="group"
          aria-label="Choisissez votre profil"
          style={{ marginBottom: '24px' }}
        >
          {PROFILES.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={selected === profile.id}
              onSelect={() => setSelected(profile.id)}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end" style={{ paddingTop: '8px', gap: '0' }}>
          <button
            type="button"
            disabled={!selected}
            onClick={() => router.push('/inscription/etape-3')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px 32px',
              backgroundColor: selected ? 'var(--opus-primary)' : '#E2EDF5',
              color: selected ? '#fff' : 'var(--opus-muted)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={e => { if (selected) e.currentTarget.style.backgroundColor = 'var(--opus-primary-dk)' }}
            onMouseLeave={e => { if (selected) e.currentTarget.style.backgroundColor = 'var(--opus-primary)' }}
          >
            Continuer
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
