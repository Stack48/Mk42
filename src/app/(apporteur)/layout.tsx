'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import styles from './layout.module.css'
<<<<<<< HEAD
import IconDashboardGrid from '@/components/icons/IconDashboardGrid'
import IconDocList from '@/components/icons/IconDocList'
import IconSafe from '@/components/icons/IconSafe'
import IconChartLine from '@/components/icons/IconChartLine'
import IconGear from '@/components/icons/IconGear'
import IconSignOut from '@/components/icons/IconSignOut'
import IconGridOutline from '@/components/icons/IconGridOutline'

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',          icon: <IconDashboardGrid className={styles.navIcon} /> },
  { href: '/opportunites',  label: 'Mes Opportunités',   icon: <IconDocList className={styles.navIcon} /> },
  { href: '/coffre-fort',   label: 'Coffre Fort',        icon: <IconSafe className={styles.navIcon} /> },
  { href: '/comptabilite',  label: 'Comptabilité',       icon: <IconChartLine className={styles.navIcon} /> },
  { href: '/parametres',    label: 'Paramètres',         icon: <IconGear className={styles.navIcon} /> },
=======

function DashboardIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function OpportunitesIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M7 8h6M7 12h4" />
    </svg>
  )
}

function CoffreIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="16" height="14" rx="2" />
      <circle cx="10" cy="11" r="2.5" />
      <path d="M2 8h16" />
    </svg>
  )
}

function ComptabiliteIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 14l4-5 3 3 3-5 4 4" />
      <path d="M3 17h14" />
    </svg>
  )
}

function ParametresIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6" />
    </svg>
  )
}

function GridLogoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',          icon: <DashboardIcon /> },
  { href: '/opportunites',  label: 'Mes Opportunités',   icon: <OpportunitesIcon /> },
  { href: '/coffre-fort',   label: 'Coffre Fort',        icon: <CoffreIcon /> },
  { href: '/comptabilite',  label: 'Comptabilité',       icon: <ComptabiliteIcon /> },
  { href: '/parametres',    label: 'Paramètres',         icon: <ParametresIcon /> },
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
]

export default function ApporteurLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  const initials = isLoaded && user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'JD'
    : 'JD'

  const displayName = isLoaded && user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'John Doe'
    : 'John Doe'

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar} aria-label="Navigation principale">
        <div className={styles.logoSection}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>Opus</span>
            <div className={styles.logoIcon} aria-hidden="true">
<<<<<<< HEAD
              <IconGridOutline />
=======
              <GridLogoIcon />
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
            </div>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Menu apporteur">
          {NAV_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href) && item.href !== '/'
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userRow}>
            <div className={styles.avatar} aria-hidden="true">{initials}</div>
            <span className={styles.userName}>{displayName}</span>
          </div>
          <button
            type="button"
            className={styles.signOutBtn}
            onClick={() => signOut({ redirectUrl: '/' })}
          >
<<<<<<< HEAD
            <IconSignOut />
=======
            <SignOutIcon />
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
            Déconnexion
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        {children}
      </div>
    </div>
  )
}
