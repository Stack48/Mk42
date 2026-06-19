'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import styles from './layout.module.css'
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
              <IconGridOutline />
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
            <IconSignOut />
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
