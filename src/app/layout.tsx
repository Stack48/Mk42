<<<<<<< HEAD
import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
})
=======
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';
>>>>>>> 411585d (WIP Fix bug layout.tsx)

export const metadata: Metadata = {
  title: "Opus — Simplifiez vos commissions d'apporteurs d'affaires BTP",
  description:
    "Contrats légaux, factures, DAS2 et coffre-fort automatisés. Évitez les redressements fiscaux.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
<<<<<<< HEAD
    <html lang="fr" className={rubik.variable}>
      <body className="antialiased">
=======
    <html lang='fr'>
      <body className='antialiased'>
>>>>>>> 411585d (WIP Fix bug layout.tsx)
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
